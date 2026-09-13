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
  const [roomId, setRoomId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('Receiving File...');
  const [fileSize, setFileSize] = useState<number>(0);
  const [transferState, setTransferState] = useState<TransferState>('CREATED');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isHashVerified, setIsHashVerified] = useState<boolean>(true);
  const [computedHash, setComputedHash] = useState<string>('');

  const signalingRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const fileReceiverRef = useRef<FileReceiver | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      cleanupTransfer();
    };
  }, []);

  const cleanupTransfer = () => {
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

  const handleJoin = async (enteredRoomId: string, enteredOtp: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    isCompletedRef.current = false;

    try {
      const verifyResp = await verifyOTP(enteredRoomId, enteredOtp);

      if (!verifyResp.success || !verifyResp.session_token) {
        setAttemptsRemaining(verifyResp.attempts_remaining);
        setErrorMessage(verifyResp.message || 'OTP verification failed.');
        setIsLoading(false);
        return;
      }

      setRoomId(enteredRoomId);
      setTransferState('RECEIVER_AUTHENTICATED');
      const receiverToken = verifyResp.session_token;

      const signaling = new SignalingClient(enteredRoomId, 'receiver', receiverToken);
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
            onProgress: (prog) => {
              setProgress(prog);
              if (prog.totalBytes && !fileSize) {
                setFileSize(prog.totalBytes);
              }
            },
            onComplete: (_url, hashVerified, hash) => {
              isCompletedRef.current = true;
              setErrorMessage(null);
              setIsHashVerified(Boolean(hashVerified));
              setComputedHash(hash || '');
              setTransferState('COMPLETED');
              setStep('completed');

              if (signalingRef.current) {
                signalingRef.current.sendComplete();
              }
              setTimeout(() => {
                cleanupTransfer();
              }, 500);
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
          isCompletedRef.current = true;
          setErrorMessage(null);
          setTransferState('COMPLETED');
          setStep('completed');
          cleanupTransfer();
        } else if (msg.type === 'transfer-cancelled') {
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
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification or connection failed.');
    } finally {
      setIsLoading(false);
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
    setRoomId('');
    setFileName('Receiving File...');
    setFileSize(0);
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
        {step !== 'join' && (
          <span className="text-xs font-mono text-slate-500">
            Room: <strong className="text-slate-300">{roomId}</strong>
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
          onReset={handleReset}
        />
      )}
    </div>
  );
};
