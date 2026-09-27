import type { FileMetadata, TransferProgress } from '../types/transfer';

// Chunk size configuration (1 MB logical chunks for UI metrics, 63 KB wire transport slices)
export const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1 MB logical chunking
export const SCTP_SLICE_SIZE = 64 * 1024 - 1024; // 63 KB (64,512 bytes) safe cross-browser transport slice
export const HIGH_WATER_MARK = 1024 * 1024; // 1 MB backpressure threshold (keeps SCTP buffer safe & prevents buffer bloat)
export const LOW_WATER_MARK = 256 * 1024; // 256 KB resume threshold (keeps network pipe continuously saturated)

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
  private bytesSent: number = 0;
  private currentMetadata: FileMetadata | null = null;
  private lastProgressTime: number = 0;
  private lastReportedNetBytes: number = 0;
  private smoothedSpeed: number = 0;

  constructor(
    dataChannel: RTCDataChannel,
    callbacks: TransferCallbacks,
    chunkSize: number = DEFAULT_CHUNK_SIZE
  ) {
    this.dataChannel = dataChannel;
    this.callbacks = callbacks;
    this.chunkSize = chunkSize;
    try {
      this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;
    } catch {}

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

  /**
   * Yield to macrotask queue using MessageChannel to avoid HTML5 4ms timer clamping
   * and Chrome background tab 1000ms timer throttling.
   */
  private yieldEventLoop(): Promise<void> {
    if (typeof MessageChannel !== 'undefined') {
      return new Promise<void>((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          channel.port1.close();
          channel.port2.close();
          resolve();
        };
        channel.port2.postMessage(null);
      });
    }
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  private emitProgress(force: boolean = false): void {
    const now = performance.now();
    const timeDeltaSec = (now - this.lastProgressTime) / 1000;

    if (!force && timeDeltaSec < 0.15) {
      return;
    }

    const buffered = this.dataChannel?.bufferedAmount || 0;
    const netBytes = Math.min(this.totalBytes, Math.max(0, this.bytesSent - buffered));
    const deltaBytes = Math.max(0, netBytes - this.lastReportedNetBytes);
    const instantSpeed = deltaBytes / (timeDeltaSec || 0.001);

    if (this.smoothedSpeed === 0) {
      this.smoothedSpeed = instantSpeed;
    } else if (instantSpeed > 0) {
      this.smoothedSpeed = this.smoothedSpeed * 0.7 + instantSpeed * 0.3;
    }

    const remainingBytes = Math.max(0, this.totalBytes - netBytes);
    const remainingSeconds = this.smoothedSpeed > 0 ? remainingBytes / this.smoothedSpeed : 0;
    const percentage = Math.min(99, Math.round((netBytes / (this.totalBytes || 1)) * 100));

    const currentMbChunk = Math.min(
      this.totalChunks,
      Math.max(1, Math.ceil(netBytes / (1024 * 1024)))
    );

    try {
      this.callbacks.onProgress({
        bytesTransferred: netBytes,
        totalBytes: this.totalBytes,
        percentage,
        speedBytesPerSec: this.smoothedSpeed,
        remainingSeconds,
        currentChunk: currentMbChunk,
        totalChunks: this.totalChunks,
      });
    } catch (err) {
      console.warn('[FileSender] Error in onProgress callback:', err);
    }

    this.lastProgressTime = now;
    this.lastReportedNetBytes = netBytes;
  }

  public async sendFile(file: File): Promise<void> {
    this.isCancelled = false;
    this.totalBytes = file.size;
    this.totalChunks = Math.ceil(this.totalBytes / (1024 * 1024)) || 1;
    this.bytesSent = 0;
    this.lastProgressTime = performance.now();
    this.lastReportedNetBytes = 0;
    this.smoothedSpeed = 0;

    // Ensure bufferedAmountLowThreshold is calibrated
    try {
      this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;
    } catch {}

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

    // Yield 40ms to ensure the receiver processes the transfer_header and initializes buffers before chunks arrive
    await new Promise((r) => setTimeout(r, 40));

    // Stream file data in safe, high-speed 63 KB SCTP transport slices with strict backpressure
    for (let offset = 0; offset < this.totalBytes; offset += SCTP_SLICE_SIZE) {
      if (this.isCancelled) {
        this.callbacks.onError('Transfer cancelled by sender.');
        return;
      }

      if (this.dataChannel.readyState !== 'open') {
        this.callbacks.onError('DataChannel closed during file transfer.');
        return;
      }

      // STRICT BACKPRESSURE: Wait until the buffer has drained below LOW_WATER_MARK
      // whenever it exceeds HIGH_WATER_MARK. This prevents buffer bloat and SCTP stalls.
      while (this.dataChannel.bufferedAmount > HIGH_WATER_MARK) {
        await this.waitForBufferDrain();

        if (this.isCancelled || this.dataChannel.readyState !== 'open') {
          this.callbacks.onError('Transfer interrupted.');
          return;
        }
      }

      const chunkEnd = Math.min(offset + SCTP_SLICE_SIZE, this.totalBytes);
      const slice = file.slice(offset, chunkEnd);
      const arrayBuffer = await slice.arrayBuffer();

      this.dataChannel.send(arrayBuffer);
      this.bytesSent += arrayBuffer.byteLength;

      // Yield event loop every 8 slices (~512 KB) so browser handles I/O and keepalives without timer throttling
      if ((offset / SCTP_SLICE_SIZE) % 8 === 0) {
        await this.yieldEventLoop();
      }

      this.emitProgress();
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

    return new Promise<void>((resolve) => {
      let isDone = false;

      const cleanup = () => {
        if (!isDone) {
          isDone = true;
          try {
            if (this.dataChannel) {
              this.dataChannel.removeEventListener('bufferedamountlow', onBufferedAmountLow);
            }
          } catch {}
          if (pollTimer) clearInterval(pollTimer);
          resolve();
        }
      };

      const onBufferedAmountLow = () => cleanup();

      try {
        this.dataChannel.bufferedAmountLowThreshold = LOW_WATER_MARK;
        this.dataChannel.addEventListener('bufferedamountlow', onBufferedAmountLow);
      } catch {}

      // Fast poll backup timer to detect drain if event was missed or delayed by browser
      const pollTimer = setInterval(() => {
        // Continuously update progress as bytes drain out over the wire
        this.emitProgress();

        if (
          !this.dataChannel ||
          this.dataChannel.readyState !== 'open' ||
          this.dataChannel.bufferedAmount <= LOW_WATER_MARK ||
          this.isCancelled
        ) {
          cleanup();
        }
      }, 20);
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
        this.emitProgress();
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
          }, 50);
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
  private readonly BATCH_THRESHOLD: number = 4 * 1024 * 1024; // 4 MB per Blob slice to keep V8 heap flat and reduce memory allocations
  private pendingChunks: ArrayBuffer[] = [];
  private bytesReceived: number = 0;
  private startTime: number = 0;
  private lastProgressTime: number = 0;
  private bytesSinceLastProgress: number = 0;
  private smoothedSpeed: number = 0;
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
    this.dataChannel.onmessage = (event: MessageEvent) => {
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
        event.data.arrayBuffer().then((buffer) => {
          if (!this.isCancelled) {
            this.handleChunk(buffer);
          }
        }).catch((err) => {
          console.error('[FileReceiver] Error processing Blob chunk:', err);
        });
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
    this.smoothedSpeed = 0;

    this.callbacks.onMetadata?.(meta);

    // Send header_ack back to sender
    try {
      if (this.dataChannel.readyState === 'open') {
        this.dataChannel.send(JSON.stringify({ type: 'header_ack' }));
      }
    } catch {}

    const totalMbChunks = Math.ceil(meta.size / (1024 * 1024)) || 1;
    this.callbacks.onProgress({
      bytesTransferred: 0,
      totalBytes: meta.size,
      percentage: 0,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      currentChunk: 0,
      totalChunks: totalMbChunks,
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

    // Flush batch to off-heap Blob slice when threshold reached to keep V8 heap flat
    if (this.currentBatchBytes >= this.BATCH_THRESHOLD) {
      try {
        this.blobParts.push(new Blob(this.currentBatch));
      } catch (err) {
        console.error('[FileReceiver] Error creating batch Blob:', err);
      }
      this.currentBatch = [];
      this.currentBatchBytes = 0;
    }

    const now = performance.now();
    const timeDeltaSec = (now - this.lastProgressTime) / 1000;

    if (timeDeltaSec >= 0.15 || this.bytesReceived >= this.metadata.size) {
      const instantSpeed = this.bytesSinceLastProgress / (timeDeltaSec || 0.001);
      if (this.smoothedSpeed === 0) {
        this.smoothedSpeed = instantSpeed;
      } else if (instantSpeed > 0) {
        this.smoothedSpeed = this.smoothedSpeed * 0.7 + instantSpeed * 0.3;
      }

      const remainingBytes = Math.max(0, this.metadata.size - this.bytesReceived);
      const remainingSeconds = this.smoothedSpeed > 0 ? remainingBytes / this.smoothedSpeed : 0;
      const percentage = Math.min(100, Math.round((this.bytesReceived / this.metadata.size) * 100));
      const totalMbChunks = Math.ceil(this.metadata.size / (1024 * 1024)) || 1;
      const currentMbChunk = Math.min(
        totalMbChunks,
        Math.max(1, Math.ceil(this.bytesReceived / (1024 * 1024)))
      );

      try {
        this.callbacks.onProgress({
          bytesTransferred: this.bytesReceived,
          totalBytes: this.metadata.size,
          percentage,
          speedBytesPerSec: this.smoothedSpeed,
          remainingSeconds,
          currentChunk: currentMbChunk,
          totalChunks: totalMbChunks,
        });
      } catch (err) {
        console.warn('[FileReceiver] Error in onProgress callback:', err);
      }

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

    const totalMbChunks = Math.ceil(this.metadata.size / (1024 * 1024)) || 1;

    // Emit 100% progress on receiver
    this.callbacks.onProgress({
      bytesTransferred: this.metadata.size,
      totalBytes: this.metadata.size,
      percentage: 100,
      speedBytesPerSec: 0,
      remainingSeconds: 0,
      currentChunk: totalMbChunks,
      totalChunks: totalMbChunks,
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
