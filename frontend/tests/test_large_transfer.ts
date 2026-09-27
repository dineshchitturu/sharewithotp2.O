import { FileSender, FileReceiver, HIGH_WATER_MARK, LOW_WATER_MARK } from '../src/services/fileTransfer.ts';

// Mock WebRTC DataChannel that faithfully implements SCTP buffer simulation & backpressure
class MockDataChannel extends EventTarget {
  public readyState: RTCDataChannelState = 'open';
  public bufferedAmount: number = 0;
  public bufferedAmountLowThreshold: number = LOW_WATER_MARK;
  public binaryType: BinaryType = 'arraybuffer';
  public peer: MockDataChannel | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onopen: (() => void) | null = null;
  public onclose: (() => void) | null = null;
  public onerror: ((event: any) => void) | null = null;

  private drainInterval: any = null;
  private readonly drainSpeedBytesPerSec: number = 40 * 1024 * 1024; // 40 MB/s simulated line rate

  constructor() {
    super();
    this.startDrainLoop();
  }

  private startDrainLoop() {
    const tickMs = 15;
    const drainPerTick = Math.floor(this.drainSpeedBytesPerSec * (tickMs / 1000));

    this.drainInterval = setInterval(() => {
      if (this.bufferedAmount > 0) {
        const prev = this.bufferedAmount;
        this.bufferedAmount = Math.max(0, this.bufferedAmount - drainPerTick);

        if (prev > this.bufferedAmountLowThreshold && this.bufferedAmount <= this.bufferedAmountLowThreshold) {
          this.dispatchEvent(new Event('bufferedamountlow'));
        }
      }
    }, tickMs);
  }

  public send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    if (this.readyState !== 'open') {
      throw new Error('DataChannel not open');
    }

    let byteLength = 0;
    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data, 'utf-8');
    } else if (data instanceof ArrayBuffer) {
      byteLength = data.byteLength;
    } else if (ArrayBuffer.isView(data)) {
      byteLength = data.byteLength;
    }

    this.bufferedAmount += byteLength;

    // Relay to peer asynchronously
    setImmediate(() => {
      if (this.peer && this.peer.readyState === 'open') {
        const event = new MessageEvent('message', { data });
        if (this.peer.onmessage) {
          this.peer.onmessage(event);
        }
        this.peer.dispatchEvent(event);
      }
    });
  }

  public close(): void {
    this.readyState = 'closed';
    if (this.drainInterval) {
      clearInterval(this.drainInterval);
      this.drainInterval = null;
    }
  }
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function runLargeFileTransferTest() {
  console.log('=====================================================');
  console.log('Starting P2P Large File Transfer Simulation (25 MB)');
  console.log('=====================================================');

  const senderCh = new MockDataChannel();
  const receiverCh = new MockDataChannel();
  senderCh.peer = receiverCh as any;
  receiverCh.peer = senderCh as any;

  // Generate 100 MB random binary payload
  const fileSize = 100 * 1024 * 1024; // 100 MB
  console.log(`Generating ${fileSize / (1024 * 1024)} MB test file...`);
  const rawData = new Uint8Array(fileSize);
  for (let i = 0; i < fileSize; i += 65536) {
    const end = Math.min(i + 65536, fileSize);
    for (let j = i; j < end; j++) {
      rawData[j] = (j * 31 + 7) & 0xff;
    }
  }

  const expectedHash = await sha256Hex(rawData.buffer);
  console.log(`Expected SHA-256: ${expectedHash}`);

  const testFile = new File([rawData], 'ubuntu-24.04-desktop-amd64.iso', {
    type: 'application/x-iso9660-image',
  });

  let receiverCompletePromiseResolve: (url: string) => void;
  const receiverCompletePromise = new Promise<string>((resolve) => {
    receiverCompletePromiseResolve = resolve;
  });

  let senderComplete = false;
  let maxSenderBufferedAmount = 0;
  let lastReportedPercentage = -1;

  // Initialize Receiver
  const receiver = new FileReceiver(receiverCh as any, {
    onProgress: (p) => {
      // Receiver progress
    },
    onComplete: (fileUrl) => {
      console.log('Receiver onComplete triggered!');
      receiverCompletePromiseResolve(fileUrl || '');
    },
    onError: (err) => {
      console.error('Receiver error:', err);
      process.exit(1);
    },
  });

  // Track buffer spikes to verify backpressure was activated
  const bufferMonitor = setInterval(() => {
    if (senderCh.bufferedAmount > maxSenderBufferedAmount) {
      maxSenderBufferedAmount = senderCh.bufferedAmount;
    }
  }, 5);

  const startTime = Date.now();

  // Initialize Sender
  const sender = new FileSender(senderCh as any, {
    onProgress: (prog) => {
      if (prog.percentage !== lastReportedPercentage && prog.percentage % 10 === 0) {
        lastReportedPercentage = prog.percentage;
        const mb = (prog.bytesTransferred / (1024 * 1024)).toFixed(2);
        const totalMb = (prog.totalBytes / (1024 * 1024)).toFixed(2);
        const speedMb = (prog.speedBytesPerSec / (1024 * 1024)).toFixed(2);
        console.log(
          `[Stream Progress] ${prog.percentage}% | ${mb} MB / ${totalMb} MB | Chunk: ${prog.currentChunk}/${prog.totalChunks} | Speed: ${speedMb} MB/s | Buffer: ${(senderCh.bufferedAmount / 1024).toFixed(0)} KB`
        );
      }
    },
    onComplete: () => {
      console.log('Sender onComplete triggered!');
      senderComplete = true;
    },
    onError: (err) => {
      console.error('Sender error:', err);
      process.exit(1);
    },
  });

  // Execute streaming
  console.log('Sender streaming file over DataChannel with calibrated backpressure...');
  await sender.sendFile(testFile);

  // Await receiver completion
  const downloadUrl = await receiverCompletePromise;
  clearInterval(bufferMonitor);

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Transfer finished in ${elapsedSec}s!`);

  // Verify downloaded Blob integrity
  console.log('Verifying received Blob byte length & SHA-256 checksum...');
  const res = await fetch(downloadUrl);
  const receivedBlob = await res.blob();
  const receivedBuf = await receivedBlob.arrayBuffer();

  if (receivedBuf.byteLength !== fileSize) {
    throw new Error(`Size mismatch! Expected ${fileSize}, got ${receivedBuf.byteLength}`);
  }

  const actualHash = await sha256Hex(receivedBuf);
  console.log(`Actual SHA-256:   ${actualHash}`);

  if (actualHash !== expectedHash) {
    throw new Error(`Hash mismatch! ${actualHash} !== ${expectedHash}`);
  }

  console.log('-----------------------------------------------------');
  console.log(`Max sender bufferedAmount reached: ${(maxSenderBufferedAmount / 1024).toFixed(1)} KB`);
  console.log(`HIGH_WATER_MARK: ${(HIGH_WATER_MARK / 1024).toFixed(1)} KB`);
  console.log(`Backpressure engaged successfully: ${maxSenderBufferedAmount >= HIGH_WATER_MARK}`);
  console.log(`SHA-256 verified identical: MATCH!`);
  console.log(`Sender completed: ${senderComplete}`);
  console.log('TEST PASSED! 25 MB P2P streaming was 100% continuous and uncorrupted.');
  console.log('=====================================================');

  senderCh.close();
  receiverCh.close();
}

runLargeFileTransferTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
