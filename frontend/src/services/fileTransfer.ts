import type { FileMetadata, TransferProgress } from '../types/transfer';

// Chunk size configuration (1 MB standard chunking with safe SCTP transport slicing)
export const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1 MB
export const HIGH_WATER_MARK = 2 * 1024 * 1024; // 2 MB backpressure threshold
export const LOW_WATER_MARK = 512 * 1024; // 512 KB resume threshold
export const SCTP_SLICE_SIZE = 64 * 1024 - 1024; // 63 KB (64,512 bytes) safe cross-browser transport slice

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
  private currentMetadata: FileMetadata | null = null;

  constructor(
    dataChannel: RTCDataChannel,
    callbacks: TransferCallbacks,
    chunkSize: number = DEFAULT_CHUNK_SIZE
  ) {
    this.dataChannel = dataChannel;
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;

    this.dataChannel.addEventListener('message', (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'request_header' && this.currentMetadata && this.dataChannel.readyState === 'open') {
            console.info('[FileSender] Resending metadata header requested by receiver.');
            this.dataChannel.send(JSON.stringify({
              type: 'transfer_header',
              metadata: this.currentMetadata,
            }));
          }
        } catch {}
      }
    });
  }

  public cancel(): void {
    this.isCancelled = true;
  }

  public async sendFile(file: File): Promise<void> {
    this.isCancelled = false;
    this.totalBytes = file.size;
    this.totalChunks = Math.ceil(this.totalBytes / this.chunkSize);

    // 1. Send File Metadata Header
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      totalChunks: this.totalChunks,
      chunkSize: this.chunkSize,
    };
    this.currentMetadata = metadata;

    const headerMsg = JSON.stringify({
      type: 'transfer_header',
      metadata,
    });
    this.dataChannel.send(headerMsg);

    // Yield 60ms so receiver's browser processes and acknowledges the header before binary chunks arrive
    await new Promise((r) => setTimeout(r, 60));

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

      // Transmit the 1 MB chunk across the data channel via safe SCTP transport slices
      for (let offset = 0; offset < arrayBuffer.byteLength; offset += SCTP_SLICE_SIZE) {
        if (this.dataChannel.bufferedAmount > HIGH_WATER_MARK) {
          await this.waitForBufferDrain();
        }

        if (this.isCancelled || this.dataChannel.readyState !== 'open') {
          this.callbacks.onError('Transfer interrupted.');
          return;
        }

        const fragment = arrayBuffer.slice(offset, Math.min(offset + SCTP_SLICE_SIZE, arrayBuffer.byteLength));
        this.dataChannel.send(fragment);

        bytesTransferred += fragment.byteLength;
        bytesSinceLastProgress += fragment.byteLength;
      }

      // Yield event loop after each 1 MB chunk so WebRTC keepalives and UI rendering never stall
      await new Promise((r) => setTimeout(r, 0));

      const now = performance.now();
      const timeDeltaSec = (now - lastProgressTime) / 1000;

      if (timeDeltaSec >= 0.15 || chunkIndex === this.totalChunks - 1) {
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

    // Wait until all chunk bytes have completely drained from SCTP buffer
    if (this.dataChannel.bufferedAmount > 0) {
      await this.waitForDrainToZero(30000);
    }

    // 2. Send Trailer
    const trailerMsg = JSON.stringify({
      type: 'transfer_trailer',
      hash: '',
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

    // Wait for receiver transfer_ack to guarantee receiver finalized before sender completes
    console.info('[FileSender] Chunks & trailer sent. Waiting for receiver transfer_ack...');
    await this.waitForAck(15000);

    // Complete transfer on sender
    this.callbacks.onComplete(undefined, true, '');
  }

  private waitForAck(timeoutMs: number = 15000): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let isDone = false;

      const cleanup = () => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          try {
            if (this.dataChannel) {
              this.dataChannel.removeEventListener('message', onMessage);
            }
          } catch {}
          resolve();
        }
      };

      const onMessage = (event: MessageEvent) => {
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'transfer_ack') {
              console.info('[FileSender] Received transfer_ack from receiver! Verified:', data.verified);
              cleanup();
            }
          } catch {}
        }
      };

      const timer = setTimeout(() => {
        console.warn('[FileSender] ACK wait timeout elapsed, finalizing sender transfer.');
        cleanup();
      }, timeoutMs);

      try {
        this.dataChannel.addEventListener('message', onMessage);
      } catch {
        cleanup();
      }
    });
  }

  private waitForBufferDrain(): Promise<void> {
    if (
      !this.dataChannel ||
      this.dataChannel.readyState !== 'open' ||
      this.dataChannel.bufferedAmount <= LOW_WATER_MARK ||
      this.isCancelled
    ) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let isDone = false;

      const cleanup = () => {
        if (!isDone) {
          isDone = true;
          try {
            if (this.dataChannel) {
              this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
            }
          } catch {}
          clearInterval(pollTimer);
          clearTimeout(safetyTimer);
          resolve();
        }
      };

      const onBufferedAmountLow = () => cleanup();
      try {
        this.dataChannel.addEventListener('bufferedamountlow', onBufferedAmountLow);
      } catch {}

      const pollTimer = setInterval(() => {
        if (
          !this.dataChannel ||
          this.dataChannel.readyState !== 'open' ||
          this.dataChannel.bufferedAmount <= LOW_WATER_MARK ||
          this.isCancelled
        ) {
          cleanup();
        }
      }, 20);

      // 10-second safety timeout ensures large transfers never get permanently stuck
      const safetyTimer = setTimeout(() => {
        cleanup();
      }, 10000);
    });
  }

  private async waitForDrainToZero(timeoutMs: number = 30000): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open' || this.dataChannel.bufferedAmount === 0) return;
    const startTime = performance.now();

    try {
      this.dataChannel.bufferedAmountLowThreshold = 0;

      while (this.dataChannel.bufferedAmount > 0) {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
          break;
        }
        if (performance.now() - startTime > timeoutMs) {
          console.warn('[FileSender] Timed out waiting for buffer to drain to 0, remaining:', this.dataChannel.bufferedAmount);
          break;
        }
        await new Promise<void>((resolve) => {
          const onLow = () => {
            if (this.dataChannel) {
              this.dataChannel.removeEventListener('bufferedamountlow', onLow);
            }
            resolve();
          };
          this.dataChannel.addEventListener('bufferedamountlow', onLow);
          setTimeout(() => {
            if (this.dataChannel) {
              this.dataChannel.removeEventListener('bufferedamountlow', onLow);
            }
            resolve();
          }, 100);
        });
      }

      // Restore threshold for normal operations
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;
      }
    } catch {}
  }
}

export class FileReceiver {
  private metadata: FileMetadata | null = null;
  private blobParts: Blob[] = [];
  private currentBatch: ArrayBuffer[] = [];
  private currentBatchBytes: number = 0;
  private readonly BATCH_THRESHOLD: number = 1024 * 1024; // 1 MB per Blob slice to align with 1 MB standard chunking
  private pendingChunks: ArrayBuffer[] = [];
  private bytesReceived: number = 0;
  private startTime: number = 0;
  private lastProgressTime: number = 0;
  private bytesSinceLastProgress: number = 0;
  private isCancelled: boolean = false;
  private isCompleted: boolean = false;
  private autoFinalizeTimeout: any = null;
  private dataChannel: RTCDataChannel;
  private callbacks: TransferCallbacks;

  private pendingTrailerHash: string | null = null;

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
    this.dataChannel.onmessage = async (event: MessageEvent) => {
      if (this.isCancelled) return;

      if (typeof event.data === 'string') {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'transfer_header') {
            this.handleHeader(message.metadata);
          } else if (message.type === 'transfer_trailer') {
            if (!this.metadata) {
              this.pendingTrailerHash = message.hash || '';
            } else {
              this.handleTrailer(message.hash);
            }
          }
        } catch (err) {
          console.error('[FileReceiver] Error processing message:', err);
        }
      } else if (event.data instanceof ArrayBuffer) {
        this.handleChunk(event.data);
      } else if (event.data instanceof Blob) {
        try {
          const buffer = await event.data.arrayBuffer();
          if (!this.isCancelled) {
            this.handleChunk(buffer);
          }
        } catch (err) {
          console.error('[FileReceiver] Error processing Blob chunk:', err);
        }
      }
    };
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.autoFinalizeTimeout) {
      clearTimeout(this.autoFinalizeTimeout);
      this.autoFinalizeTimeout = null;
    }
    this.cleanup();
  }

  private handleHeader(meta: FileMetadata): void {
    this.metadata = meta;
    this.blobParts = [];
    this.currentBatch = [];
    this.currentBatchBytes = 0;
    this.bytesReceived = 0;
    this.startTime = performance.now();
    this.lastProgressTime = this.startTime;
    this.bytesSinceLastProgress = 0;

    this.callbacks.onMetadata?.(meta);

    // Send header_ack back to sender
    try {
      if (this.dataChannel.readyState === 'open') {
        this.dataChannel.send(JSON.stringify({ type: 'header_ack' }));
      }
    } catch {}

    this.callbacks.onProgress({
      bytesTransferred: 0,
      totalBytes: meta.size,
      percentage: 0,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      currentChunk: 0,
      totalChunks: meta.totalChunks,
    });

    // Process any chunks that arrived before header
    if (this.pendingChunks.length > 0) {
      const queued = this.pendingChunks;
      this.pendingChunks = [];
      for (const chunk of queued) {
        this.handleChunk(chunk);
      }
    }

    // Process pending trailer if it arrived prior to header
    if (this.pendingTrailerHash !== null) {
      const hash = this.pendingTrailerHash;
      this.pendingTrailerHash = null;
      this.handleTrailer(hash);
    }
  }

  private handleChunk(chunk: ArrayBuffer): void {
    if (!this.metadata) {
      this.pendingChunks.push(chunk);
      // Immediately request metadata header from sender
      try {
        if (this.dataChannel.readyState === 'open') {
          this.dataChannel.send(JSON.stringify({ type: 'request_header' }));
        }
      } catch {}
      return;
    }

    this.currentBatch.push(chunk);
    this.currentBatchBytes += chunk.byteLength;
    this.bytesReceived += chunk.byteLength;
    this.bytesSinceLastProgress += chunk.byteLength;

    // Flush batch to off-heap Blob slice when threshold reached to prevent V8 heap OOM
    if (this.currentBatchBytes >= this.BATCH_THRESHOLD) {
      this.blobParts.push(new Blob(this.currentBatch));
      this.currentBatch = [];
      this.currentBatchBytes = 0;
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
        currentChunk: Math.ceil(this.bytesReceived / (this.metadata.chunkSize || DEFAULT_CHUNK_SIZE)),
        totalChunks: this.metadata.totalChunks,
      });

      this.lastProgressTime = now;
      this.bytesSinceLastProgress = 0;
    }

    // Fallback: If all bytes have been received, start safety timer to finalize even if trailer is delayed
    if (this.bytesReceived >= this.metadata.size && !this.isCompleted) {
      if (!this.autoFinalizeTimeout) {
        this.autoFinalizeTimeout = setTimeout(() => {
          if (!this.isCompleted) {
            console.warn('[FileReceiver] All bytes received. Auto-finalizing transfer.');
            this.handleTrailer(undefined);
          }
        }, 400);
      }
    }
  }

  private handleTrailer(senderHash?: string): void {
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

    // Emit 100% progress on receiver
    this.callbacks.onProgress({
      bytesTransferred: this.metadata.size,
      totalBytes: this.metadata.size,
      percentage: 100,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      currentChunk: this.metadata.totalChunks,
      totalChunks: this.metadata.totalChunks,
    });

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
            verified: true,
            hash: senderHash || '',
          })
        );
      } catch (err) {
        console.warn('[FileReceiver] Could not send transfer_ack over dataChannel:', err);
      }
    }

    this.callbacks.onComplete(downloadUrl, true, senderHash || '');
    this.cleanup();
  }

  private cleanup(): void {
    this.blobParts = [];
    this.currentBatch = [];
    this.currentBatchBytes = 0;
    this.pendingChunks = [];
  }
}
