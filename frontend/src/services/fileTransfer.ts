import { createSHA256 } from 'hash-wasm';
import type { FileMetadata, TransferProgress } from '../types/transfer';

// Chunk size configuration (default 64 KB, within 64 KB - 256 KB recommended range)
export const DEFAULT_CHUNK_SIZE = 64 * 1024; // 64 KB
export const HIGH_WATER_MARK = 4 * 1024 * 1024; // 4 MB backpressure threshold
export const LOW_WATER_MARK = 512 * 1024; // 512 KB resume threshold

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
    const totalBytes = file.size;
    const totalChunks = Math.ceil(totalBytes / this.chunkSize);

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
      totalChunks,
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

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (this.isCancelled) {
        this.callbacks.onError('Transfer cancelled by sender.');
        return;
      }

      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, totalBytes);
      const slice = file.slice(start, end);

      const arrayBuffer = await slice.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      if (hasher) {
        hasher.update(uint8);
      }

      // Backpressure management
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

      if (timeDeltaSec >= 0.2 || chunkIndex === totalChunks - 1) {
        currentSpeed = bytesSinceLastProgress / timeDeltaSec;
        const remainingBytes = totalBytes - bytesTransferred;
        const remainingSeconds = currentSpeed > 0 ? remainingBytes / currentSpeed : 0;
        const percentage = Math.min(100, Math.round((bytesTransferred / totalBytes) * 100));

        this.callbacks.onProgress({
          bytesTransferred,
          totalBytes,
          percentage,
          speedBytesPerSec: currentSpeed,
          remainingSeconds,
          currentChunk: chunkIndex + 1,
          totalChunks,
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
  private isCancelled: boolean = false;
  private hasher: any = null;
  private dataChannel: RTCDataChannel;
  private callbacks: TransferCallbacks;

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
            await this.handleHeader(message.metadata);
          } else if (message.type === 'transfer_trailer') {
            await this.handleTrailer(message.hash);
          }
        } catch (err) {
          console.error('[FileReceiver] Error processing message:', err);
        }
      } else if (event.data instanceof ArrayBuffer) {
        await this.handleChunk(event.data);
      }
    };
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

    if (timeDeltaSec >= 0.2 || this.bytesReceived >= this.metadata.size) {
      const speed = this.bytesSinceLastProgress / timeDeltaSec;
      const remainingBytes = this.metadata.size - this.bytesReceived;
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

      this.lastProgressTime = now;
      this.bytesSinceLastProgress = 0;
    }
  }

  private async handleTrailer(senderHash?: string): Promise<void> {
    if (!this.metadata) return;

    const computedHash = this.hasher ? this.hasher.digest('hex') : undefined;
    const isVerified = Boolean(senderHash && computedHash && senderHash.toLowerCase() === computedHash.toLowerCase());

    console.info(`[FileReceiver] Transfer complete. Hash verified: ${isVerified}. Sender Hash: ${senderHash}, Computed: ${computedHash}`);

    const blob = new Blob(this.receivedChunks, {
      type: this.metadata.type || 'application/octet-stream',
    });

    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = this.metadata.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
  }
}
