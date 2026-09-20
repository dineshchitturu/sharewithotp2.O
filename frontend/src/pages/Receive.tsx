import React, { useState, useRef, useEffect } from 'react';
import { RoomJoiner } from '../components/RoomJoiner';
import { TransferProgress } from '../components/TransferProgress';
import { TransferComplete } from '../components/TransferComplete';
import { ErrorMessage } from '../components/ErrorMessage';
import { verifyOTP } from '../services/api';
import { SignalingClient } from '../services/signaling';
import { WebRTCManager } from '../services/webrtc';
import { FileReceiver } from '../services/fileTransfer';
import type { TransferProgress as ProgressData, TransferState } from '../types/transfer';

interface ReceiveProps {
  onBack: () => void;
}

export const Receive: React.FC<ReceiveProps> = ({ onBack }) => {
  const [step, setStep] = useState<'join' | 'transferring' | 'completed'>('join');
  const [otp, setOtp] = useState<string>('');
  const [initialOtp, setInitialOtp] = useState<string>('');
  const [fileName, setFileName] = useState<string>('Receiving File...');
  const [fileSize, setFileSize] = useState<number>(0);
  const [transferState, setTransferState] = useState<TransferState>('CREATED');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isHashVerified, setIsHashVerified] = useState<boolean>(true);
  const [computedHash, setComputedHash] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const signalingRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const fileReceiverRef = useRef<FileReceiver | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const isJoiningRef = useRef<boolean>(false);

  useEffect(() => {
    // Read ?otp= or ?code= from URL parameters if present
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('otp') || params.get('code');
    if (codeParam && /^\d{6}$/.test(codeParam.trim())) {
      setInitialOtp(codeParam.trim());
    }

    return () => {
      cleanupTransfer();
    };
  }, []);

  const cleanupTransfer = () => {
    isJoiningRef.current = false;
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

  const handleJoin = async (enteredOtp: string) => {
    const cleanOtp = enteredOtp.trim();
    if (isJoiningRef.current) return;
    isJoiningRef.current = true;

    setIsLoading(true);
    setErrorMessage(null);
    isCompletedRef.current = false;
    setOtp(cleanOtp);

    let offerTimeout: any = null;

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
          } else if (state === 'disconnected' || state === 'failed') {
            if (!isCompletedRef.current) {
              setTransferState('DISCONNECTED');
              setErrorMessage('Peer connection disconnected.');
            }
          }
        },
        (dataChannel) => {
          console.info('[Receiver] DataChannel established from sender!');
          setStep('transferring');
          setTransferState('TRANSFERRING');

          dataChannel.onerror = (err) => {
            console.warn('[Receiver] DataChannel error event:', err);
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
              setFileName(meta.name);
              setFileSize(meta.size);
            },
            onProgress: (prog) => {
              setProgress(prog);
              if (prog.totalBytes && !fileSize) {
                setFileSize(prog.totalBytes);
              }
            },
            onComplete: (url, hashVerified, hash) => {
              isCompletedRef.current = true;
              setErrorMessage(null);
              if (url) setDownloadUrl(url);
              setIsHashVerified(Boolean(hashVerified));
              setComputedHash(hash || '');
              setTransferState('COMPLETED');
              setStep('completed');

              if (signalingRef.current) {
                signalingRef.current.sendComplete();
              }
              // Gracefully maintain connection so file download completes without network aborts
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
          if (offerTimeout) clearTimeout(offerTimeout);
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
          if (offerTimeout) clearTimeout(offerTimeout);
          isCompletedRef.current = true;
          setErrorMessage(null);
          setTransferState('COMPLETED');
          setStep('completed');
          // Gracefully maintain connection
        } else if (msg.type === 'transfer-cancelled') {
          if (offerTimeout) clearTimeout(offerTimeout);
          if (!isCompletedRef.current) {
            setTransferState('CANCELLED');
            setErrorMessage(`Transfer cancelled by peer: ${msg.reason || ''}`);
            cleanupTransfer();
          }
        } else if (msg.type === 'peer-left') {
          if (!isCompletedRef.current) {
            setTransferState('DISCONNECTED');
            setErrorMessage('Sender disconnected.');
          }
        } else if (msg.type === 'error') {
          if (!isCompletedRef.current) {
            setErrorMessage(msg.message || 'Signaling error occurred.');
          }
        }
      });

      await signaling.connect();

      offerTimeout = setTimeout(() => {
        if (!isCompletedRef.current && (transferState === 'RECEIVER_AUTHENTICATED' || transferState === 'SIGNALING')) {
          signaling.sendRequestOffer();
        }
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification or connection failed.');
    } finally {
      setIsLoading(false);
      isJoiningRef.current = false;
    }
  };

  const handleCancel = () => {
    if (signalingRef.current) {
      signalingRef.current.sendCancel('Cancelled by receiver');
    }
    cleanupTransfer();
    setTransferState('CANCELLED');
    setErrorMessage('Transfer cancelled by you.');
  };

  const handleReset = () => {
    cleanupTransfer();
    isCompletedRef.current = false;
    setOtp('');
    setFileName('Receiving File...');
    setFileSize(0);
    setDownloadUrl(null);
    setTransferState('CREATED');
    setProgress(null);
    setErrorMessage(null);
    setAttemptsRemaining(null);
    setStep('join');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
        >
          ← Back to Home
        </button>
        {step !== 'join' && otp && (
          <span className="text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5">
            <span>Code:</span>
            <strong className="text-sky-300 font-bold">{otp.length === 6 ? `${otp.slice(0, 3)} ${otp.slice(3)}` : otp}</strong>
          </span>
        )}
      </div>

      {step !== 'completed' && (
        <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />
      )}

      {step === 'join' && (
        <RoomJoiner
          onJoin={handleJoin}
          isLoading={isLoading}
          attemptsRemaining={attemptsRemaining}
          initialOtp={initialOtp}
        />
      )}

      {step === 'transferring' && (
        <TransferProgress
          fileName={fileName}
          fileSize={fileSize}
          progress={progress}
          state={transferState}
          role="receiver"
          onCancel={handleCancel}
        />
      )}

      {step === 'completed' && (
        <TransferComplete
          fileName={fileName}
          fileSize={fileSize}
          hashVerified={isHashVerified}
          computedHash={computedHash}
          downloadUrl={downloadUrl || undefined}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
