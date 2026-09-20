import { useState, useRef, useEffect, type FC } from 'react';
import { Navbar } from '../components/Navbar';
import { TransferCanvas, type TransferStatus3D } from '../three/TransferCanvas';
import { HeroDropZone } from '../components/HeroDropZone';
import { FilePreviewCard } from '../components/FilePreviewCard';
import { OTPPanel } from '../components/OTPPanel';
import { OTPReceiveInput } from '../components/OTPReceiveInput';
import { LiveTransferMetrics } from '../components/LiveTransferMetrics';
import { TransferSuccessCard } from '../components/TransferSuccessCard';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { SecurityArchitecture } from '../components/SecurityArchitecture';
import { InfoModal } from '../components/InfoModal';
import { Footer } from '../components/Footer';
import { ErrorMessage } from '../components/ErrorMessage';
import { createRoom, verifyOTP } from '../services/api';
import { SignalingClient } from '../services/signaling';
import { WebRTCManager } from '../services/webrtc';
import { FileSender, FileReceiver } from '../services/fileTransfer';
import type { TransferProgress as ProgressData, TransferState } from '../types/transfer';

type Mode = 'send' | 'receive';
type ModalType = 'about' | 'privacy' | 'terms' | null;

export const UnifiedTransferPage: FC = () => {
  // Page mode & modal state
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('otp') || params.get('code')) return 'receive';
    }
    return 'send';
  });
  const [modalType, setModalType] = useState<ModalType>(null);

  // Sender state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [senderOtp, setSenderOtp] = useState<string>('');
  const [senderExpiresAt, setSenderExpiresAt] = useState<string>('');
  const [senderStep, setSenderStep] = useState<
    'select' | 'preview' | 'waiting' | 'transferring' | 'completed'
  >('select');

  // Receiver state
  const [receiverInitialOtp, setReceiverInitialOtp] = useState<string>('');
  const [_receiverOtp, setReceiverOtp] = useState<string>('');
  const [receivingFileName, setReceivingFileName] = useState<string>('Receiving File...');
  const [receivingFileSize, setReceivingFileSize] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [receiverStep, setReceiverStep] = useState<
    'input' | 'transferring' | 'completed'
  >('input');

  // Shared transfer progress & status
  const [transferState, setTransferState] = useState<TransferState>('CREATED');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [computedHash, setComputedHash] = useState<string>('');
  const [isHashVerified, setIsHashVerified] = useState<boolean>(true);

  // Network & transfer refs
  const signalingRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const fileSenderRef = useRef<FileSender | null>(null);
  const fileReceiverRef = useRef<FileReceiver | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const isStreamingRef = useRef<boolean>(false);
  const selectedFileRef = useRef<File | null>(null);
  const isJoiningRef = useRef<boolean>(false);

  // Read URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('otp') || params.get('code');
    if (code && /^\d{6}$/.test(code.trim())) {
      setMode('receive');
      setReceiverInitialOtp(code.trim());
    }

    return () => {
      cleanupNetwork();
    };
  }, []);

  const cleanupNetwork = () => {
    isJoiningRef.current = false;
    isStreamingRef.current = false;
    if (fileSenderRef.current) {
      fileSenderRef.current.cancel();
      fileSenderRef.current = null;
    }
    if (fileReceiverRef.current) {
      fileReceiverRef.current.cancel();
      fileReceiverRef.current = null;
    }
    if (webrtcRef.current) {
      webrtcRef.current.close();
      webrtcRef.current = null;
    }
    if (signalingRef.current) {
      signalingRef.current.close();
      signalingRef.current = null;
    }
  };

  // Switch mode safely
  const handleSelectMode = (newMode: Mode) => {
    if (
      (mode === 'send' && (senderStep === 'transferring' || senderStep === 'waiting')) ||
      (mode === 'receive' && receiverStep === 'transferring')
    ) {
      if (
        !window.confirm(
          'An active transfer session is in progress. Switching will cancel this transfer. Continue?'
        )
      ) {
        return;
      }
    }
    cleanupNetwork();
    handleResetAll();
    setMode(newMode);
  };

  const handleScrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // SENDER FLOW: File selected
  const handleFileSelected = (file: File) => {
    selectedFileRef.current = file;
    setSelectedFile(file);
    setSenderStep('preview');
    setErrorMessage(null);
  };

  const handleClearFile = () => {
    selectedFileRef.current = null;
    setSelectedFile(null);
    setSenderStep('select');
  };

  // SENDER FLOW: Create Room and initiate Signaling
  const handleCreateShare = async () => {
    if (!selectedFileRef.current) {
      setErrorMessage('Please select a file to share first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    isCompletedRef.current = false;
    isStreamingRef.current = false;

    try {
      const resp = await createRoom();
      setSenderOtp(resp.otp);
      setSenderExpiresAt(resp.expires_at);
      setTransferState('WAITING_FOR_RECEIVER');
      setSenderStep('waiting');

      const signaling = new SignalingClient(resp.room_id, 'sender', resp.sender_token);
      signalingRef.current = signaling;

      const webrtc = new WebRTCManager(
        {},
        (candidate) => signaling.sendCandidate(candidate),
        (state) => {
          console.info('[Sender WebRTC State]:', state);
          if (state === 'connected') {
            setTransferState('CONNECTED');
          } else if (state === 'failed') {
            if (!isCompletedRef.current) {
              setTransferState('FAILED');
              setErrorMessage('Direct peer connection failed. Please check network connectivity.');
            }
          } else if (state === 'disconnected') {
            console.warn('[Sender WebRTC] Temporary peer disconnect detected.');
          }
        }
      );
      webrtcRef.current = webrtc;
      webrtc.initialize(true);

      const dataChannel = webrtc.dataChannel;
      if (dataChannel) {
        dataChannel.onopen = () => {
          console.info('[Sender] DataChannel opened!');
          setTransferState('CONNECTED');
          const fileToStream = selectedFileRef.current;
          if (fileToStream && !isStreamingRef.current) {
            startSenderStreaming(fileToStream, dataChannel);
          }
        };

        dataChannel.onerror = (err) => {
          console.warn('[Sender] DataChannel error:', err);
          if (
            isCompletedRef.current ||
            dataChannel.readyState === 'closing' ||
            dataChannel.readyState === 'closed'
          ) {
            return;
          }
          setErrorMessage('DataChannel encountered an error.');
        };
      }

      signaling.onMessage(async (msg) => {
        console.info('[Sender Signaling Rx]:', msg.type);
        if (msg.type === 'peer-joined' || msg.type === 'request-offer') {
          setTransferState('SIGNALING');
          try {
            const offer = await webrtc.createOffer();
            signaling.sendOffer(offer);
            setTransferState('CONNECTING');
          } catch (err: any) {
            setErrorMessage(`Failed to create offer: ${err.message}`);
          }
        } else if (msg.type === 'answer') {
          try {
            await webrtc.handleAnswer(msg.payload);
          } catch (err: any) {
            setErrorMessage(`Failed to process answer: ${err.message}`);
          }
        } else if (msg.type === 'ice-candidate') {
          if (msg.payload) {
            await webrtc.addIceCandidate(msg.payload);
          }
        } else if (msg.type === 'transfer-complete') {
          isCompletedRef.current = true;
          setErrorMessage(null);
          setTransferState('COMPLETED');
          setSenderStep('completed');
          cleanupNetwork();
        } else if (msg.type === 'transfer-cancelled') {
          if (!isCompletedRef.current) {
            setTransferState('CANCELLED');
            setErrorMessage(`Transfer cancelled: ${msg.reason || 'By receiver'}`);
            cleanupNetwork();
          }
        } else if (msg.type === 'peer-left') {
          if (!isCompletedRef.current) {
            setTransferState('DISCONNECTED');
            setErrorMessage('Receiver disconnected from the session.');
          }
        } else if (msg.type === 'error') {
          if (!isCompletedRef.current) {
            const isWsClose =
              msg.message?.toLowerCase().includes('closed') ||
              msg.message?.includes('1006');
            if (
              isWsClose &&
              (isStreamingRef.current ||
                transferState === 'TRANSFERRING' ||
                transferState === 'CONNECTED')
            ) {
              console.info(
                '[Sender Signaling] WebSocket closed during active WebRTC transfer, ignoring non-fatal error.'
              );
            } else {
              setErrorMessage(msg.message || 'Signaling error occurred.');
            }
          }
        }
      });

      await signaling.connect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const startSenderStreaming = (file: File, channel: RTCDataChannel) => {
    if (isStreamingRef.current) return;
    isStreamingRef.current = true;
    setSenderStep('transferring');
    setTransferState('TRANSFERRING');

    const sender = new FileSender(channel, {
      onProgress: (prog) => {
        setProgress(prog);
      },
      onComplete: (_url, verified, hash) => {
        setComputedHash(hash || '');
        if (verified) {
          isCompletedRef.current = true;
          setErrorMessage(null);
          setTransferState('COMPLETED');
          setSenderStep('completed');
        } else {
          setTransferState('VERIFYING');
        }
      },
      onError: (err) => {
        if (!isCompletedRef.current) {
          setErrorMessage(err);
          setTransferState('FAILED');
        }
      },
    });

    fileSenderRef.current = sender;
    sender.sendFile(file).catch((err) => {
      if (!isCompletedRef.current) {
        console.error('[Sender] Streaming error:', err);
        setErrorMessage(err.message || 'File transfer failed.');
        setTransferState('FAILED');
      }
    });
  };

  // RECEIVER FLOW: Join with OTP
  const handleJoinWithOtp = async (cleanOtp: string) => {
    if (isJoiningRef.current) {
      console.warn('[Receiver] Join already in progress, ignoring duplicate call.');
      return;
    }
    isJoiningRef.current = true;

    setIsLoading(true);
    setErrorMessage(null);
    isCompletedRef.current = false;
    setReceiverOtp(cleanOtp);

    let offerFallbackTimeout: number | null = null;

    try {
      const verifyResp = await verifyOTP(cleanOtp);
      if (!verifyResp.success || !verifyResp.session_token) {
        setAttemptsRemaining(verifyResp.attempts_remaining);
        setErrorMessage(verifyResp.message || 'OTP verification failed.');
        setIsLoading(false);
        isJoiningRef.current = false;
        return;
      }

      setTransferState('RECEIVER_AUTHENTICATED');
      const receiverToken = verifyResp.session_token;

      const signaling = new SignalingClient(cleanOtp, 'receiver', receiverToken);
      signalingRef.current = signaling;

      const webrtc = new WebRTCManager(
        {},
        (candidate) => signaling.sendCandidate(candidate),
        (state) => {
          console.info('[Receiver WebRTC State]:', state);
          if (state === 'connected') {
            setTransferState('CONNECTED');
          } else if (state === 'failed') {
            if (!isCompletedRef.current) {
              setTransferState('FAILED');
              setErrorMessage('Direct peer connection failed. Please check network connectivity.');
            }
          } else if (state === 'disconnected') {
            console.warn('[Receiver WebRTC] Temporary peer disconnect detected.');
          }
        },
        (dataChannel) => {
          console.info('[Receiver] DataChannel established from sender!');
          setReceiverStep('transferring');
          setTransferState('TRANSFERRING');

          dataChannel.onerror = (err) => {
            console.warn('[Receiver] DataChannel error:', err);
            if (
              isCompletedRef.current ||
              dataChannel.readyState === 'closing' ||
              dataChannel.readyState === 'closed'
            ) {
              return;
            }
            setErrorMessage('DataChannel encountered an error.');
          };

          const receiver = new FileReceiver(dataChannel, {
            onMetadata: (meta) => {
              console.info('[Receiver] Metadata received:', meta.name, meta.size);
              setReceivingFileName(meta.name);
              setReceivingFileSize(meta.size);
            },
            onProgress: (prog) => {
              setProgress(prog);
              if (prog.totalBytes && !receivingFileSize) {
                setReceivingFileSize(prog.totalBytes);
              }
            },
            onComplete: (url, hashVer, hash) => {
              isCompletedRef.current = true;
              setErrorMessage(null);
              if (url) setDownloadUrl(url);
              setIsHashVerified(Boolean(hashVer));
              setComputedHash(hash || '');
              setTransferState('COMPLETED');
              setReceiverStep('completed');

              if (signalingRef.current) {
                signalingRef.current.sendComplete();
              }
            },
            onError: (err) => {
              if (!isCompletedRef.current) {
                setErrorMessage(err);
                setTransferState('FAILED');
              }
            },
          });

          fileReceiverRef.current = receiver;
        }
      );

      webrtcRef.current = webrtc;
      webrtc.initialize(false);

      signaling.onMessage(async (msg) => {
        console.info('[Receiver Signaling Rx]:', msg.type);
        if (msg.type === 'offer') {
          if (offerFallbackTimeout !== null) {
            clearTimeout(offerFallbackTimeout);
            offerFallbackTimeout = null;
          }
          setTransferState('CONNECTING');
          try {
            const answer = await webrtc.handleOffer(msg.payload);
            signaling.sendAnswer(answer);
          } catch (err: any) {
            setErrorMessage(`Failed to handle offer: ${err.message}`);
          }
        } else if (msg.type === 'ice-candidate') {
          if (msg.payload) {
            await webrtc.addIceCandidate(msg.payload);
          }
        } else if (msg.type === 'transfer-complete') {
          if (offerFallbackTimeout !== null) clearTimeout(offerFallbackTimeout);
          isCompletedRef.current = true;
          setErrorMessage(null);
          setTransferState('COMPLETED');
          setReceiverStep('completed');
        } else if (msg.type === 'transfer-cancelled') {
          if (offerFallbackTimeout !== null) clearTimeout(offerFallbackTimeout);
          if (!isCompletedRef.current) {
            setTransferState('CANCELLED');
            setErrorMessage(`Transfer cancelled by peer: ${msg.reason || ''}`);
            cleanupNetwork();
          }
        } else if (msg.type === 'peer-left') {
          if (!isCompletedRef.current) {
            setTransferState('DISCONNECTED');
            setErrorMessage('Sender disconnected.');
          }
        } else if (msg.type === 'error') {
          if (!isCompletedRef.current) {
            const isWsClose =
              msg.message?.toLowerCase().includes('closed') ||
              msg.message?.includes('1006');
            if (
              isWsClose &&
              (transferState === 'TRANSFERRING' || transferState === 'CONNECTED')
            ) {
              console.info(
                '[Receiver Signaling] WebSocket closed during active WebRTC transfer, ignoring non-fatal error.'
              );
            } else {
              setErrorMessage(msg.message || 'Signaling error occurred.');
            }
          }
        }
      });

      await signaling.connect();

      // Offer request fallback if sender is waiting but offer handshake was delayed
      offerFallbackTimeout = window.setTimeout(() => {
        if (!isCompletedRef.current && (transferState === 'RECEIVER_AUTHENTICATED' || transferState === 'SIGNALING')) {
          console.info('[Receiver] Handshake waiting, requesting offer fallback...');
          signaling.sendRequestOffer();
        }
      }, 3500);
    } catch (err: any) {
      if (offerFallbackTimeout !== null) clearTimeout(offerFallbackTimeout);
      setErrorMessage(err.message || 'Verification or connection failed.');
    } finally {
      setIsLoading(false);
      isJoiningRef.current = false;
    }
  };

  // Cancel in progress
  const handleCancelTransfer = () => {
    if (signalingRef.current) {
      signalingRef.current.sendCancel('Cancelled by user');
    }
    cleanupNetwork();
    setTransferState('CANCELLED');
    setErrorMessage('Transfer was cancelled.');
  };

  // Full reset
  const handleResetAll = () => {
    cleanupNetwork();
    isCompletedRef.current = false;
    isStreamingRef.current = false;
    selectedFileRef.current = null;
    setSelectedFile(null);
    setSenderOtp('');
    setSenderExpiresAt('');
    setSenderStep('select');

    setReceiverOtp('');
    setReceiverInitialOtp('');
    setReceivingFileName('Receiving File...');
    setReceivingFileSize(0);
    setDownloadUrl(null);
    setAttemptsRemaining(null);
    setReceiverStep('input');

    setProgress(null);
    setTransferState('CREATED');
    setErrorMessage(null);
    setComputedHash('');
  };

  // Calculate 3D Scene Status
  const get3DStatus = (): TransferStatus3D => {
    if (transferState === 'COMPLETED' || senderStep === 'completed' || receiverStep === 'completed') {
      return 'completed';
    }
    if (transferState === 'TRANSFERRING' || senderStep === 'transferring' || receiverStep === 'transferring') {
      return 'transferring';
    }
    if (
      transferState === 'CONNECTING' ||
      transferState === 'SIGNALING' ||
      transferState === 'CONNECTED'
    ) {
      return 'connecting';
    }
    if (mode === 'send') {
      if (senderStep === 'waiting') return 'waiting';
      if (senderStep === 'preview') return 'file_selected';
    }
    return 'idle';
  };

  const activeFileName = selectedFile?.name || (receivingFileSize ? receivingFileName : undefined);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Top Floating Glass Navbar */}
      <Navbar
        mode={mode}
        onSelectMode={handleSelectMode}
        onOpenModal={(type) => setModalType(type)}
        onScrollTo={handleScrollTo}
      />

      {/* Main Single-Page Hero & Interactive Workspace */}
      <main className="flex-1 flex flex-col items-center justify-start relative w-full">
        {/* Anti-Gravity Theme: Sleek neon cyan and purple ambient background glows */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[300px] bg-gradient-to-b from-cyan-500/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute top-16 left-1/4 -translate-x-1/2 w-[380px] h-[280px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-slow" />
        <div className="absolute top-24 right-1/4 translate-x-1/2 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute top-36 left-8 w-1.5 h-1.5 rounded-full bg-cyan-400/50 blur-[0.5px] animate-float pointer-events-none -z-10" />
        <div className="absolute top-64 right-10 w-2 h-2 rounded-full bg-purple-400/50 blur-[0.5px] animate-float-slow pointer-events-none -z-10" />

        {/* 3D Visualizer Canvas - Compact on mobile */}
        <section className="w-full max-w-3xl mx-auto pt-2 sm:pt-4 pb-1 px-2 sm:px-4 flex flex-col items-center">
          <TransferCanvas
            status={get3DStatus()}
            progress={progress?.percentage || 0}
            speedBytesPerSec={progress?.speedBytesPerSec || 0}
            fileName={activeFileName}
          />
        </section>

        {/* Interactive Transfer Stage */}
        <section className="w-full max-w-xl mx-auto px-3.5 sm:px-4 pb-12 sm:pb-16">
          {/* Error Banner */}
          {errorMessage && (
            <ErrorMessage
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          )}

          {/* SENDER VIEW */}
          {mode === 'send' && (
            <div className="w-full transition-all duration-300">
              {/* Step 1: File Selection DropZone */}
              {senderStep === 'select' && (
                <HeroDropZone
                  onFileSelected={handleFileSelected}
                  disabled={isLoading}
                />
              )}

              {/* Step 2: File Preview & Confirm */}
              {senderStep === 'preview' && selectedFile && (
                <FilePreviewCard
                  file={selectedFile}
                  onClear={handleClearFile}
                  onConfirm={handleCreateShare}
                  isLoading={isLoading}
                />
              )}

              {/* Step 3: Waiting for Receiver (OTP Display) */}
              {senderStep === 'waiting' && (
                <OTPPanel
                  otp={senderOtp}
                  expiresAt={senderExpiresAt}
                  state={transferState}
                  fileName={selectedFile?.name}
                  onCancel={handleCancelTransfer}
                />
              )}

              {/* Step 4: Transfer In Progress */}
              {senderStep === 'transferring' && selectedFile && (
                <LiveTransferMetrics
                  fileName={selectedFile.name}
                  fileSize={selectedFile.size}
                  progress={progress}
                  state={transferState}
                  role="sender"
                  onCancel={handleCancelTransfer}
                />
              )}

              {/* Step 5: Transfer Success */}
              {senderStep === 'completed' && selectedFile && (
                <TransferSuccessCard
                  fileName={selectedFile.name}
                  fileSize={selectedFile.size}
                  hashVerified={true}
                  computedHash={computedHash}
                  role="sender"
                  onReset={handleResetAll}
                />
              )}
            </div>
          )}

          {/* RECEIVER VIEW */}
          {mode === 'receive' && (
            <div className="w-full transition-all duration-300">
              {/* Step 1: 6-Digit OTP Input */}
              {receiverStep === 'input' && (
                <OTPReceiveInput
                  onJoin={handleJoinWithOtp}
                  isLoading={isLoading}
                  attemptsRemaining={attemptsRemaining}
                  initialOtp={receiverInitialOtp}
                  onSelectMode={handleSelectMode}
                />
              )}

              {/* Step 2: Transfer In Progress */}
              {receiverStep === 'transferring' && (
                <LiveTransferMetrics
                  fileName={receivingFileName}
                  fileSize={receivingFileSize}
                  progress={progress}
                  state={transferState}
                  role="receiver"
                  onCancel={handleCancelTransfer}
                />
              )}

              {/* Step 3: Transfer Success & Download */}
              {receiverStep === 'completed' && (
                <TransferSuccessCard
                  fileName={receivingFileName}
                  fileSize={receivingFileSize}
                  hashVerified={isHashVerified}
                  computedHash={computedHash}
                  downloadUrl={downloadUrl || undefined}
                  role="receiver"
                  onReset={handleResetAll}
                />
              )}
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <HowItWorksSection onSelectMode={handleSelectMode} />

        {/* Security Architecture Section */}
        <SecurityArchitecture />
      </main>

      {/* Modern Cyber Footer */}
      <Footer
        onOpenModal={(type) => setModalType(type)}
        onScrollTo={handleScrollTo}
      />

      {/* Slide-over Info Modal for Developer / Privacy / Terms */}
      <InfoModal
        isOpen={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
};
