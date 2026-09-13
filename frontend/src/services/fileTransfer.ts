import { createSHA256 } from 'hash-wasm';
import type { FileMetadata, TransferProgress } from '../types/transfer';

// Chunk size configuration (default 64 KB, within 64 KB - 256 KB recommended range)
export const DEFAULT_CHUNK_SIZE = 64 * 1024; // 64 KB
export const HIGH_WATER_MARK = 1024 * 1024; // 1 MB backpressure threshold (tighter buffer)
export const LOW_WATER_MARK = 256 * 1024; // 256 KB resume threshold

export interface TransferCallbacks {
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

      this.dataChannel.send(arrayBuffer);

      bytesTransferred += arrayBuffer.byteLength;
      bytesSinceLastProgress += arrayBuffer.byteLength;

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

    if (this.dataChannel.bufferedAmount > 0) {
      await this.waitForBufferDrain();
    }

    // 2. Send Trailer with calculated SHA-256 hash
    const trailerMsg = JSON.stringify({
      type: 'transfer_trailer',
      hash: finalHash,
    });
    this.dataChannel.send(trailerMsg);

    this.callbacks.onComplete(undefined, true, finalHash);
  }

  private waitForBufferDrain(): Promise<void> {
    return new Promise((resolve) => {
      const onBufferedAmountLow = () => {
        this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
        resolve();
      };
      this.dataChannel.addEventListener('bufferedamountlow', onBufferedAmountLow);
    });
  }
}

export class FileReceiver {
  private metadata: FileMetadata | null = null;
  private receivedChunks: ArrayBuffer[] = [];
  private bytesReceived: number = 0;
  private startTime: number = 0;
  private lastProgressTime: number = 0;
  private bytesSinceLastProgress: number = 0;
  private lastReportTime: number = 0;
  private isCancelled: boolean = false;
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
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    this.cleanup();
  }

  private async handleHeader(meta: FileMetadata): Promise<void> {
    this.metadata = meta;
    this.receivedChunks = [];
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

    this.receivedChunks.push(chunk);
    this.bytesReceived += chunk.byteLength;
    this.bytesSinceLastProgress += chunk.byteLength;

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
        currentChunk: this.receivedChunks.length,
        totalChunks: this.metadata.totalChunks,
      });

      // Synchronize progress back to sender via DataChannel
      if (
        this.dataChannel &&
        this.dataChannel.readyState === 'open' &&
        (now - this.lastReportTime >= 150 || this.bytesReceived >= this.metadata.size)
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
  }

  private async handleTrailer(senderHash?: string): Promise<void> {
    if (!this.metadata) return;

    const computedHash = this.hasher ? this.hasher.digest('hex') : undefined;
    const isVerified = Boolean(
      senderHash && computedHash && senderHash.toLowerCase() === computedHash.toLowerCase()
    );

    console.info(
      `[FileReceiver] Transfer complete. Hash verified: ${isVerified}. Sender Hash: ${senderHash}, Computed: ${computedHash}`
    );

    const blob = new Blob(this.receivedChunks, {
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
    this.receivedChunks = [];
    this.hasher = null;
    this.messageQueue = [];
  }
}
