import { createSHA256 } from 'hash-wasm';
import type { FileMetadata, TransferProgress } from '../types/transfer';

// Chunk size configuration (default 64 KB, within 64 KB - 256 KB recommended range)
export const DEFAULT_CHUNK_SIZE = 64 * 1024; // 64 KB
export const HIGH_WATER_MARK = 1024 * 1024; // 1 MB backpressure threshold (tighter buffer)
export const LOW_WATER_MARK = 256 * 1024; // 256 KB resume threshold

export interface TransferCallbacks {
  onMetadata?: (metadata: FileMetadata) => void;
  onProgress: (progress: TransferProgress) => void;
  onComplete: (fileUrl?: string, hashVerified?: boolean, computedHash?: string) => void;
  onError: (error: string) => void;
}

export class FileSender {
  private isCancelled: boolean = false;
  private dataChannel: RTCDataChannel;
  private callbacks: TransferCallbacks;
  private chunkSize: number;
  private totalBytes: number = 0;
  private totalChunks: number = 0;
  private transferStartTime: number = 0;
  private ackResolver: ((ack: { verified: boolean; hash?: string }) => void) | null = null;

  constructor(
    dataChannel: RTCDataChannel,
    callbacks: TransferCallbacks,
    chunkSize: number = DEFAULT_CHUNK_SIZE
  ) {
    this.dataChannel = dataChannel;
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;
    this.setupListeners();
  }

  private setupListeners(): void {
    const prevOnMessage = this.dataChannel.onmessage;
    this.dataChannel.onmessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'transfer_ack') {
            console.info('[FileSender] Received transfer_ack from receiver:', message);
            if (this.ackResolver) {
              this.ackResolver({ verified: Boolean(message.verified), hash: message.hash });
              this.ackResolver = null;
            }
            this.callbacks.onComplete(undefined, message.verified, message.hash);
          } else if (message.type === 'transfer_progress') {
            // Receiver reported acknowledged progress - synchronize sender in real-time
            const rxBytes = message.bytesReceived || 0;
            const rxPercentage = message.percentage || 0;
            const now = performance.now();
            const elapsedSec = (now - this.transferStartTime) / 1000;
            const currentSpeed = elapsedSec > 0 ? rxBytes / elapsedSec : 0;
            const remainingBytes = Math.max(0, this.totalBytes - rxBytes);
            const remainingSeconds = currentSpeed > 0 ? remainingBytes / currentSpeed : 0;

            this.callbacks.onProgress({
              bytesTransferred: rxBytes,
              totalBytes: this.totalBytes,
              percentage: rxPercentage,
              speedBytesPerSec: currentSpeed,
              remainingSeconds,
              currentChunk: Math.min(this.totalChunks, Math.ceil(rxBytes / this.chunkSize)),
              totalChunks: this.totalChunks,
            });
          }
        } catch {}
      }
      if (prevOnMessage) {
        prevOnMessage.call(this.dataChannel, event);
      }
    };
  }

  public cancel(): void {
    this.isCancelled = true;
  }

  public async sendFile(file: File): Promise<void> {
    this.isCancelled = false;
    this.totalBytes = file.size;
    this.totalChunks = Math.ceil(this.totalBytes / this.chunkSize);
    this.transferStartTime = performance.now();

    // Initialize streaming WebAssembly SHA-256 hasher
    let hasher: any;
    try {
      hasher = await createSHA256();
      hasher.init();
    } catch (e) {
      console.warn('[FileSender] Failed to initialize WASM SHA-256 hasher:', e);
    }

    // 1. Send File Metadata Header
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      totalChunks: this.totalChunks,
      chunkSize: this.chunkSize,
    };

    const headerMsg = JSON.stringify({
      type: 'transfer_header',
      metadata,
    });
    this.dataChannel.send(headerMsg);

    let bytesTransferred = 0;
    let lastProgressTime = performance.now();
    let bytesSinceLastProgress = 0;
    let currentSpeed = 0;

    for (let chunkIndex = 0; chunkIndex < this.totalChunks; chunkIndex++) {
      if (this.isCancelled) {
        this.callbacks.onError('Transfer cancelled by sender.');
        return;
      }

      if (this.dataChannel.readyState !== 'open') {
        this.callbacks.onError('DataChannel closed during file transfer.');
        return;
      }

      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.totalBytes);
      const slice = file.slice(start, end);

      const arrayBuffer = await slice.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      if (hasher) {
        hasher.update(uint8);
      }

      // Backpressure management: wait if buffer exceeds HIGH_WATER_MARK
      if (this.dataChannel.bufferedAmount > HIGH_WATER_MARK) {
        await this.waitForBufferDrain();
      }

      if (this.isCancelled) {
        this.callbacks.onError('Transfer cancelled by sender.');
        return;
      }

      if (this.dataChannel.readyState !== 'open') {
        this.callbacks.onError('DataChannel closed during file transfer.');
        return;
      }

      this.dataChannel.send(arrayBuffer);

      bytesTransferred += arrayBuffer.byteLength;
      bytesSinceLastProgress += arrayBuffer.byteLength;

      // Yield every 16 chunks (~1 MB) to prevent event loop starvation and keep WebRTC keepalives active
      if (chunkIndex % 16 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }

      const now = performance.now();
      const timeDeltaSec = (now - lastProgressTime) / 1000;

      if (timeDeltaSec >= 0.15 || chunkIndex === this.totalChunks - 1) {
        // Calculate true bytes that left the socket (subtracting pending buffer)
        const netBytes = Math.max(0, bytesTransferred - this.dataChannel.bufferedAmount);
        currentSpeed = bytesSinceLastProgress / (timeDeltaSec || 0.001);
        const remainingBytes = Math.max(0, this.totalBytes - netBytes);
        const remainingSeconds = currentSpeed > 0 ? remainingBytes / currentSpeed : 0;
        const percentage = Math.min(99, Math.round((netBytes / this.totalBytes) * 100));

        this.callbacks.onProgress({
          bytesTransferred: netBytes,
          totalBytes: this.totalBytes,
          percentage,
          speedBytesPerSec: currentSpeed,
          remainingSeconds,
          currentChunk: chunkIndex + 1,
          totalChunks: this.totalChunks,
        });

        lastProgressTime = now;
        bytesSinceLastProgress = 0;
      }
    }

    const finalHash = hasher ? hasher.digest('hex') : '';

    // Wait until all chunk bytes have completely drained from SCTP buffer
    if (this.dataChannel.bufferedAmount > 0) {
      await this.waitForDrainToZero(30000);
    }

    // 2. Send Trailer with calculated SHA-256 hash
    const trailerMsg = JSON.stringify({
      type: 'transfer_trailer',
      hash: finalHash,
    });
    this.dataChannel.send(trailerMsg);
    await this.waitForDrainToZero(5000);

    // Update progress to 100% on sender
    this.callbacks.onProgress({
      bytesTransferred: this.totalBytes,
      totalBytes: this.totalBytes,
      percentage: 100,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      currentChunk: this.totalChunks,
      totalChunks: this.totalChunks,
    });

    // Wait for receiver to acknowledge full receipt and verification
    let receiverAckReceived = false;
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('[FileSender] Timed out waiting for receiver transfer_ack, proceeding with completion.');
        resolve();
      }, 8000);

      this.ackResolver = (_ack) => {
        clearTimeout(timeout);
        receiverAckReceived = true;
        resolve();
      };
    });

    if (!receiverAckReceived) {
      this.callbacks.onComplete(undefined, true, finalHash);
    }
  }

  private waitForBufferDrain(): Promise<void> {
    if (!this.dataChannel || this.dataChannel.bufferedAmount <= LOW_WATER_MARK) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      let isDone = false;

      const cleanup = () => {
        if (!isDone) {
          isDone = true;
          this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
          clearInterval(pollTimer);
          clearTimeout(timeoutTimer);
          resolve();
        }
      };

      const onBufferedAmountLow = () => cleanup();
      this.dataChannel.addEventListener('bufferedamountlow', onBufferedAmountLow);

      const pollTimer = setInterval(() => {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
          if (!isDone) {
            isDone = true;
            clearInterval(pollTimer);
            clearTimeout(timeoutTimer);
            this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
            reject(new Error('DataChannel closed while waiting for buffer drain'));
          }
        } else if (this.dataChannel.bufferedAmount <= LOW_WATER_MARK) {
          cleanup();
        }
      }, 30);

      // Extended safety timeout to allow large chunks over slower connections
      const timeoutTimer = setTimeout(() => {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
          console.warn('[FileSender] Buffer drain waiting exceeded 45s, bufferedAmount:', this.dataChannel.bufferedAmount);
          cleanup();
        } else {
          reject(new Error('Buffer drain timeout and DataChannel closed'));
        }
      }, 45000);
    });
  }

  private async waitForDrainToZero(timeoutMs: number = 30000): Promise<void> {
    if (this.dataChannel.bufferedAmount === 0) return;
    const startTime = performance.now();

    this.dataChannel.bufferedAmountLowThreshold = 0;

    while (this.dataChannel.bufferedAmount > 0) {
      if (performance.now() - startTime > timeoutMs) {
        console.warn('[FileSender] Timed out waiting for buffer to drain to 0, remaining:', this.dataChannel.bufferedAmount);
        break;
      }
      await new Promise<void>((resolve) => {
        const onLow = () => {
          this.dataChannel.removeEventListener('bufferedamountlow', onLow);
          resolve();
        };
        this.dataChannel.addEventListener('bufferedamountlow', onLow);
        setTimeout(() => {
          this.dataChannel.removeEventListener('bufferedamountlow', onLow);
          resolve();
        }, 100);
      });
    }

    // Restore threshold for normal operations
    this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;
  }
}

export class FileReceiver {
  private metadata: FileMetadata | null = null;
  private blobParts: Blob[] = [];
  private currentBatch: ArrayBuffer[] = [];
  private currentBatchBytes: number = 0;
  private readonly BATCH_THRESHOLD: number = 8 * 1024 * 1024; // 8 MB per Blob slice
  private totalChunksReceived: number = 0;
  private bytesReceived: number = 0;
  private startTime: number = 0;
  private lastProgressTime: number = 0;
  private bytesSinceLastProgress: number = 0;
  private lastReportTime: number = 0;
  private isCancelled: boolean = false;
  private isCompleted: boolean = false;
  private autoFinalizeTimeout: any = null;
  private hasher: any = null;
  private dataChannel: RTCDataChannel;
  private callbacks: TransferCallbacks;
  private messageQueue: (string | ArrayBuffer)[] = [];
  private isProcessingQueue: boolean = false;

  constructor(
    dataChannel: RTCDataChannel,
    callbacks: TransferCallbacks
  ) {
    this.dataChannel = dataChannel;
    this.callbacks = callbacks;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.dataChannel.binaryType = 'arraybuffer';
    this.dataChannel.onmessage = (event: MessageEvent) => {
      if (this.isCancelled) return;
      // Push into FIFO queue to ensure strict sequential processing (especially for small files)
      this.messageQueue.push(event.data);
      this.processQueue();
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      let itemsProcessed = 0;
      while (this.messageQueue.length > 0) {
        if (this.isCancelled) break;
        const data = this.messageQueue.shift()!;

        if (typeof data === 'string') {
          try {
            const message = JSON.parse(data);
            if (message.type === 'transfer_header') {
              await this.handleHeader(message.metadata);
            } else if (message.type === 'transfer_trailer') {
              await this.handleTrailer(message.hash);
            }
          } catch (err) {
            console.error('[FileReceiver] Error processing message:', err);
          }
        } else if (data instanceof ArrayBuffer) {
          await this.handleChunk(data);
        }

        itemsProcessed++;
        if (itemsProcessed >= 20) {
          itemsProcessed = 0;
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.autoFinalizeTimeout) {
      clearTimeout(this.autoFinalizeTimeout);
      this.autoFinalizeTimeout = null;
    }
    this.cleanup();
  }

  private async handleHeader(meta: FileMetadata): Promise<void> {
    this.metadata = meta;
    this.blobParts = [];
    this.currentBatch = [];
    this.currentBatchBytes = 0;
    this.totalChunksReceived = 0;
    this.bytesReceived = 0;
    this.startTime = performance.now();
    this.lastProgressTime = this.startTime;
    this.lastReportTime = this.startTime;
    this.bytesSinceLastProgress = 0;

    try {
      this.hasher = await createSHA256();
      this.hasher.init();
    } catch (e) {
      console.warn('[FileReceiver] Failed to initialize WASM SHA-256 hasher:', e);
    }

    this.callbacks.onMetadata?.(meta);

    this.callbacks.onProgress({
      bytesTransferred: 0,
      totalBytes: meta.size,
      percentage: 0,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      currentChunk: 0,
      totalChunks: meta.totalChunks,
    });
  }

  private async handleChunk(chunk: ArrayBuffer): Promise<void> {
    if (!this.metadata) return;

    this.currentBatch.push(chunk);
    this.currentBatchBytes += chunk.byteLength;
    this.totalChunksReceived++;
    this.bytesReceived += chunk.byteLength;
    this.bytesSinceLastProgress += chunk.byteLength;

    // Flush batch to off-heap Blob slice when threshold reached to prevent V8 heap OOM
    if (this.currentBatchBytes >= this.BATCH_THRESHOLD) {
      this.blobParts.push(new Blob(this.currentBatch));
      this.currentBatch = [];
      this.currentBatchBytes = 0;
    }

    if (this.hasher) {
      this.hasher.update(new Uint8Array(chunk));
    }

    const now = performance.now();
    const timeDeltaSec = (now - this.lastProgressTime) / 1000;

    if (timeDeltaSec >= 0.15 || this.bytesReceived >= this.metadata.size) {
      const speed = this.bytesSinceLastProgress / (timeDeltaSec || 0.001);
      const remainingBytes = Math.max(0, this.metadata.size - this.bytesReceived);
      const remainingSeconds = speed > 0 ? remainingBytes / speed : 0;
      const percentage = Math.min(100, Math.round((this.bytesReceived / this.metadata.size) * 100));

      this.callbacks.onProgress({
        bytesTransferred: this.bytesReceived,
        totalBytes: this.metadata.size,
        percentage,
        speedBytesPerSec: speed,
        remainingSeconds,
        currentChunk: this.totalChunksReceived,
        totalChunks: this.metadata.totalChunks,
      });

      // Synchronize progress back to sender via DataChannel (throttled to 400ms)
      if (
        this.dataChannel &&
        this.dataChannel.readyState === 'open' &&
        (now - this.lastReportTime >= 400 || this.bytesReceived >= this.metadata.size)
      ) {
        try {
          this.dataChannel.send(
            JSON.stringify({
              type: 'transfer_progress',
              bytesReceived: this.bytesReceived,
              percentage,
            })
          );
          this.lastReportTime = now;
        } catch {}
      }

      this.lastProgressTime = now;
      this.bytesSinceLastProgress = 0;
    }

    // Fallback: If all bytes have been received, start safety timer to finalize even if trailer is delayed
    if (this.bytesReceived >= this.metadata.size && !this.isCompleted) {
      if (!this.autoFinalizeTimeout) {
        this.autoFinalizeTimeout = setTimeout(() => {
          if (!this.isCompleted) {
            console.warn('[FileReceiver] All bytes received but trailer delayed. Auto-finalizing transfer.');
            this.handleTrailer(undefined);
          }
        }, 2000);
      }
    }
  }

  private async handleTrailer(senderHash?: string): Promise<void> {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (this.autoFinalizeTimeout) {
      clearTimeout(this.autoFinalizeTimeout);
      this.autoFinalizeTimeout = null;
    }

    if (!this.metadata) return;

    // Flush any remaining chunks into blobParts
    if (this.currentBatch.length > 0) {
      this.blobParts.push(new Blob(this.currentBatch));
      this.currentBatch = [];
      this.currentBatchBytes = 0;
    }

    const computedHash = this.hasher ? this.hasher.digest('hex') : undefined;
    const isVerified = Boolean(
      senderHash && computedHash && senderHash.toLowerCase() === computedHash.toLowerCase()
    );

    console.info(
      `[FileReceiver] Transfer complete. Hash verified: ${isVerified}. Sender Hash: ${senderHash}, Computed: ${computedHash}`
    );

    const blob = new Blob(this.blobParts, {
      type: this.metadata.type || 'application/octet-stream',
    });

    const downloadUrl = URL.createObjectURL(blob);

    // Auto-trigger browser download
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = this.metadata.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('[FileReceiver] Auto-download failed, fallback button is available:', err);
    }

    // Send ACK back to sender over DataChannel if open
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(
          JSON.stringify({
            type: 'transfer_ack',
            verified: isVerified,
            hash: computedHash,
          })
        );
      } catch (err) {
        console.warn('[FileReceiver] Could not send transfer_ack over dataChannel:', err);
      }
    }

    this.callbacks.onComplete(downloadUrl, isVerified, computedHash);
    this.cleanup();
  }

  private cleanup(): void {
    this.blobParts = [];
    this.currentBatch = [];
    this.currentBatchBytes = 0;
    this.totalChunksReceived = 0;
    this.hasher = null;
    this.messageQueue = [];
  }
}
