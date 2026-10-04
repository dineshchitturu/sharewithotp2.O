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
  const disconnectTimeoutRef = useRef<number | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);
  const readyIntervalRef = useRef<number | null>(null);

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
    if (disconnectTimeoutRef.current !== null) {
      window.clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }
    if (readyIntervalRef.current !== null) {
      window.clearInterval(readyIntervalRef.current);
      readyIntervalRef.current = null;
    }
    isJoiningRef.current = false;
    hasAnsweredRef.current = false;
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
    hasAnsweredRef.current = false;
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

      // Immediately activate sharing view on receiver so user sees instant connection progress
      setStep('transferring');
      setTransferState('CONNECTING');
      const receiverToken = verifyResp.session_token;

      const signaling = new SignalingClient(cleanOtp, 'receiver', receiverToken);
      signalingRef.current = signaling;

      const webrtc = new WebRTCManager(
        { iceServers: verifyResp.ice_servers },
        (candidate) => signaling.sendCandidate(candidate),
        (state) => {
          console.info('[Receiver WebRTC State]:', state);
          if (state === 'connected') {
            if (disconnectTimeoutRef.current !== null) {
              window.clearTimeout(disconnectTimeoutRef.current);
              disconnectTimeoutRef.current = null;
            }
            setErrorMessage(null);
            setTransferState(step === 'transferring' ? 'TRANSFERRING' : 'CONNECTED');
          } else if (state === 'disconnected') {
            if (isCompletedRef.current) return;
            // WebRTC 'disconnected' is transient. Debounce 10s before declaring error.
            if (disconnectTimeoutRef.current !== null) {
              window.clearTimeout(disconnectTimeoutRef.current);
            }
            console.warn('[Receiver] WebRTC transiently disconnected. Waiting 10s for potential reconnection...');
            disconnectTimeoutRef.current = window.setTimeout(() => {
              if (isCompletedRef.current) return;
              if (webrtcRef.current?.isDataChannelOpen()) {
                console.info('[Receiver] DataChannel is still open, ignoring disconnected state.');
                return;
              }
              setTransferState('DISCONNECTED');
              setErrorMessage('Peer connection disconnected. Please check your connection.');
            }, 10000);
          } else if (state === 'failed') {
            if (isCompletedRef.current) return;
            console.warn('[Receiver] WebRTC failed. Requesting fresh offer from sender...');
            hasAnsweredRef.current = false;
            try {
              signalingRef.current?.sendMessage({ type: 'request-offer' });
            } catch {}

            if (disconnectTimeoutRef.current !== null) {
              window.clearTimeout(disconnectTimeoutRef.current);
            }
            disconnectTimeoutRef.current = window.setTimeout(() => {
              if (!isCompletedRef.current && !webrtcRef.current?.isDataChannelOpen()) {
                setTransferState('DISCONNECTED');
                setErrorMessage('Peer connection could not be established across networks. Please check firewall / WebRTC settings.');
              }
            }, 15000);
          }
        },
        (dataChannel) => {
          console.info('[Receiver] DataChannel established from sender!');
          if (disconnectTimeoutRef.current !== null) {
            window.clearTimeout(disconnectTimeoutRef.current);
            disconnectTimeoutRef.current = null;
          }
          setErrorMessage(null);
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

          let pingCount = 0;
          const stopReadyPing = () => {
            if (readyIntervalRef.current !== null) {
              window.clearInterval(readyIntervalRef.current);
              readyIntervalRef.current = null;
            }
          };

          const sendReady = () => {
            if (dataChannel.readyState === 'open') {
              try {
                dataChannel.send(JSON.stringify({ type: 'receiver_ready' }));
                console.info('[Receiver] Sent receiver_ready to sender.');
              } catch {}
            }
          };

          // Initialize FileReceiver and attach listeners FIRST before notifying sender
          const receiver = new FileReceiver(dataChannel, {
            onMetadata: (meta) => {
              stopReadyPing();
              setFileName(meta.name);
              setFileSize(meta.size);
              setTransferState('TRANSFERRING');
            },
            onProgress: (prog) => {
              setProgress(prog);
              if (prog.totalBytes && !fileSize) {
                setFileSize(prog.totalBytes);
              }
            },
            onComplete: (url, hashVerified, hash) => {
              stopReadyPing();
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
              stopReadyPing();
              if (!isCompletedRef.current) {
                setErrorMessage(err);
                setTransferState('FAILED');
              }
            },
          });

          fileReceiverRef.current = receiver;

          if (dataChannel.readyState === 'open') {
            sendReady();
          } else {
            dataChannel.onopen = () => {
              sendReady();
            };
          }

          readyIntervalRef.current = window.setInterval(() => {
            if (isCompletedRef.current || pingCount > 20) {
              stopReadyPing();
              return;
            }
            pingCount++;
            sendReady();
          }, 200);
        }
      );
      webrtcRef.current = webrtc;
      webrtc.initialize(false);

      signaling.onMessage(async (msg) => {
        console.info('[Receiver Signaling Rx]:', msg.type);

        if (msg.type === 'offer') {
          if (offerTimeout) clearTimeout(offerTimeout);

          // Detect if this is an ICE restart offer
          const isIceRestart = msg.payload?.sdp?.includes('ice-restart') || webrtcRef.current?.pc?.signalingState !== 'stable';

          // If already answered an initial offer and connection is active and NOT an ICE restart, ignore redundant offer
          if (hasAnsweredRef.current && !isIceRestart && webrtcRef.current?.isDataChannelOpen() && webrtcRef.current?.pc?.signalingState === 'stable') {
            console.info('[Receiver] Already answered initial offer. Ignoring redundant offer.');
            return;
          }

          setTransferState(step === 'transferring' ? 'TRANSFERRING' : 'CONNECTING');
          try {
            const answer = await webrtc.handleOffer(msg.payload);
            hasAnsweredRef.current = true;
            signaling.sendAnswer(answer);
            webrtc.resendLocalCandidates((cand) => signaling.sendCandidate(cand));
          } catch (err: any) {
            console.warn('[Receiver] Harmless offer handling note:', err.message);
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
            // CRITICAL: WebRTC DataChannel is direct peer-to-peer!
            // If actively streaming or DataChannel is open, signaling WebSocket drops must NEVER abort the transfer!
            if (step === 'transferring' || webrtcRef.current?.isDataChannelOpen()) {
              console.info('[Receiver] Peer left signaling server, but direct P2P DataChannel is active. Continuing transfer.');
              return;
            }
            setTransferState('DISCONNECTED');
            setErrorMessage('Sender disconnected.');
          }
        } else if (msg.type === 'error') {
          if (!isCompletedRef.current && !webrtcRef.current?.isDataChannelOpen() && step !== 'transferring') {
            setErrorMessage(msg.message || 'Signaling error occurred.');
          }
        }
      });

      await signaling.connect();

      // Immediately request offer upon Unlock Share click to activate sharing with zero delay
      console.info('[Receiver] Connected to signaling. Requesting offer from sender...');
      signaling.sendRequestOffer();

      // Set a 2.5-second safety fallback: retry request offer if sender hasn't answered yet
      offerTimeout = window.setTimeout(() => {
        if (!isCompletedRef.current && webrtcRef.current && !webrtcRef.current.isDataChannelOpen() && !hasAnsweredRef.current) {
          console.info('[Receiver] Offer not received within 2.5s. Retrying offer request...');
          signaling.sendRequestOffer();
        }
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification or connection failed.');
      setStep('join');
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-sm btn-secondary gap-1.5 cursor-pointer text-gray-700"
        >
          <span>&larr; Back to Home</span>
        </button>
        {step !== 'join' && otp && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs shadow-xs">
            <span className="text-gray-500 font-sans">Code:</span>
            <strong className="font-bold tracking-wider">{otp.length === 6 ? `${otp.slice(0, 3)} ${otp.slice(3)}` : otp}</strong>
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
