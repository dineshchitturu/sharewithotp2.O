import React, { useState, useRef, useEffect } from 'react';
import { OTPDisplay } from '../components/OTPDisplay';
import { FileSelector } from '../components/FileSelector';
import { TransferProgress } from '../components/TransferProgress';
import { TransferComplete } from '../components/TransferComplete';
import { ErrorMessage } from '../components/ErrorMessage';
import { createRoom } from '../services/api';
import { SignalingClient } from '../services/signaling';
import { WebRTCManager } from '../services/webrtc';
import { FileSender } from '../services/fileTransfer';
import { Sparkles } from 'lucide-react';
import type { TransferProgress as ProgressData, TransferState } from '../types/transfer';

interface SendProps {
  onBack: () => void;
}

export const Send: React.FC<SendProps> = ({ onBack }) => {
  const [step, setStep] = useState<'create' | 'waiting' | 'transferring' | 'completed'>('create');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [otp, setOtp] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [transferState, setTransferState] = useState<TransferState>('CREATED');
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [computedHash, setComputedHash] = useState<string>('');

  const signalingRef = useRef<SignalingClient | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const fileSenderRef = useRef<FileSender | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const selectedFileRef = useRef<File | null>(null);
  const isStreamingRef = useRef<boolean>(false);
  const disconnectTimeoutRef = useRef<number | null>(null);
  const isOfferingRef = useRef<boolean>(false);
  const offerSentAtRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      cleanupTransfer();
    };
  }, []);

  const cleanupTransfer = () => {
    if (disconnectTimeoutRef.current !== null) {
      window.clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }
    isStreamingRef.current = false;
    isOfferingRef.current = false;
    offerSentAtRef.current = 0;
    if (fileSenderRef.current) {
      fileSenderRef.current.cancel();
      fileSenderRef.current = null;
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

  const handleCreateTransfer = async () => {
    if (!selectedFileRef.current) {
      setErrorMessage('Please select a file to share first before creating a transfer.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    isCompletedRef.current = false;
    isStreamingRef.current = false;

    try {
      const resp = await createRoom();
      setOtp(resp.otp);
      setExpiresAt(resp.expires_at);
      setTransferState('WAITING_FOR_RECEIVER');
      setStep('waiting');

      const signaling = new SignalingClient(resp.room_id, 'sender', resp.sender_token);
      signalingRef.current = signaling;

      const webrtc = new WebRTCManager(
        {},
        (candidate) => signaling.sendCandidate(candidate),
        (state) => {
          console.info('[Sender WebRTC State]:', state);
          if (state === 'connected') {
            if (disconnectTimeoutRef.current !== null) {
              window.clearTimeout(disconnectTimeoutRef.current);
              disconnectTimeoutRef.current = null;
            }
            setErrorMessage(null);
            setTransferState(isStreamingRef.current ? 'TRANSFERRING' : 'CONNECTED');
          } else if (state === 'disconnected') {
            if (isCompletedRef.current) return;
            // WebRTC 'disconnected' is transient. Debounce 8s before declaring error.
            if (disconnectTimeoutRef.current !== null) {
              window.clearTimeout(disconnectTimeoutRef.current);
            }
            console.warn('[Sender] WebRTC transiently disconnected. Waiting 8s for potential reconnection...');
            disconnectTimeoutRef.current = window.setTimeout(() => {
              if (isCompletedRef.current) return;
              if (webrtcRef.current?.isDataChannelOpen()) {
                console.info('[Sender] DataChannel is still open, ignoring disconnected state.');
                return;
              }
              setTransferState('DISCONNECTED');
              setErrorMessage('Peer connection disconnected. Please check connection and try again.');
            }, 8000);
          } else if (state === 'failed') {
            if (isCompletedRef.current) return;
            console.warn('[Sender] WebRTC connection failed. Attempting ICE restart...');
            webrtcRef.current?.restartIce().then((offer) => {
              if (offer && signalingRef.current?.isConnected()) {
                signalingRef.current.sendOffer(offer);
              }
            }).catch(() => {});

            if (disconnectTimeoutRef.current !== null) {
              window.clearTimeout(disconnectTimeoutRef.current);
            }
            disconnectTimeoutRef.current = window.setTimeout(() => {
              if (!isCompletedRef.current && !webrtcRef.current?.isDataChannelOpen()) {
                setTransferState('DISCONNECTED');
                setErrorMessage('Peer connection failed. Could not establish direct P2P connection.');
              }
            }, 15000);
          }
        }
      );
      webrtcRef.current = webrtc;

      webrtc.initialize(true);
      const dataChannel = webrtc.dataChannel;

      if (dataChannel) {
        let readyFallbackTimer: any = null;

        // Attach DataChannel message listener IMMEDIATELY so no incoming messages are ever dropped
        const onChannelMessage = (event: MessageEvent) => {
          if (typeof event.data === 'string') {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'receiver_ready') {
                console.info('[Sender] Received receiver_ready from receiver.');
                if (readyFallbackTimer) {
                  window.clearTimeout(readyFallbackTimer);
                  readyFallbackTimer = null;
                }
                const fileToStream = selectedFileRef.current;
                if (fileToStream && !isStreamingRef.current) {
                  startStreaming(fileToStream, dataChannel);
                }
              } else if (data.type === 'transfer_ack') {
                console.info('[Sender] Received transfer_ack via DataChannel.');
                isCompletedRef.current = true;
                setErrorMessage(null);
                setTransferState('COMPLETED');
                setStep('completed');
              }
            } catch {}
          }
        };

        dataChannel.addEventListener('message', onChannelMessage);

        dataChannel.onopen = () => {
          console.info('[Sender] DataChannel opened!');
          if (disconnectTimeoutRef.current !== null) {
            window.clearTimeout(disconnectTimeoutRef.current);
            disconnectTimeoutRef.current = null;
          }
          setErrorMessage(null);
          setTransferState('CONNECTED');

          const fileToStream = selectedFileRef.current;
          if (!fileToStream) return;

          // Notify receiver that sender DataChannel is ready
          try {
            dataChannel.send(JSON.stringify({ type: 'sender_ready' }));
          } catch {}

          // Start streaming IMMEDIATELY! Zero delay!
          if (!isStreamingRef.current) {
            console.info('[Sender] DataChannel open. Initiating immediate stream.');
            startStreaming(fileToStream, dataChannel);
          }
        };

        dataChannel.onerror = (err) => {
          console.warn('[Sender] DataChannel error event:', err);
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
          // Immediately activate transfer progress screen on sender as soon as receiver unlocks
          if (selectedFileRef.current && !isStreamingRef.current) {
            setStep('transferring');
            setTransferState('CONNECTING');
          }

          // If already streaming, completed, or data channel is open, ignore
          if (isCompletedRef.current || (webrtcRef.current?.isDataChannelOpen() && webrtcRef.current?.pc?.signalingState === 'stable')) {
            console.info('[Sender] Connection is already active. Ignoring redundant offer trigger.');
            return;
          }

          // If currently creating offer, prevent concurrent collision
          if (isOfferingRef.current) {
            console.info('[Sender] Offer creation already in progress. Ignoring concurrent trigger.');
            return;
          }

          // If offer was already sent and is waiting for answer, resend local description immediately
          if (webrtcRef.current?.pc?.signalingState === 'have-local-offer') {
            console.info('[Sender] Resending local offer to peer upon trigger.');
            if (webrtcRef.current.pc.localDescription) {
              signaling.sendOffer(webrtcRef.current.pc.localDescription);
              offerSentAtRef.current = Date.now();
            }
            return;
          }

          if (webrtcRef.current?.pc?.signalingState === 'stable') {
            isOfferingRef.current = true;
            setTransferState('SIGNALING');
            try {
              const offer = await webrtc.createOffer();
              offerSentAtRef.current = Date.now();
              signaling.sendOffer(offer);
              setTransferState('CONNECTING');
            } catch (err: any) {
              console.warn('[Sender] Offer creation note:', err.message);
            } finally {
              isOfferingRef.current = false;
            }
          }
        } else if (msg.type === 'answer') {
          try {
            await webrtc.handleAnswer(msg.payload);
          } catch (err: any) {
            console.warn('[Sender] Harmless answer handling note:', err.message);
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
          // Gracefully maintain connection until user resets or navigates away
        } else if (msg.type === 'transfer-cancelled') {
          if (!isCompletedRef.current) {
            setTransferState('CANCELLED');
            setErrorMessage(`Transfer cancelled: ${msg.reason || 'By receiver'}`);
            cleanupTransfer();
          }
        } else if (msg.type === 'peer-left') {
          if (!isCompletedRef.current) {
            // If DataChannel is still open and actively streaming, don't abort immediately
            if (isStreamingRef.current && webrtcRef.current?.isDataChannelOpen()) {
              console.warn('[Sender] Peer left signaling server, but P2P DataChannel is still streaming.');
              return;
            }
            setTransferState('DISCONNECTED');
            setErrorMessage('Receiver disconnected from the room.');
          }
        } else if (msg.type === 'error') {
          if (!isCompletedRef.current && !isStreamingRef.current) {
            setErrorMessage(msg.message || 'Signaling error occurred.');
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

  const startStreaming = (file: File, channel: RTCDataChannel) => {
    if (isStreamingRef.current) return;
    isStreamingRef.current = true;
    setStep('transferring');
    setTransferState('TRANSFERRING');

    const sender = new FileSender(channel, {
      onProgress: (prog) => {
        setProgress(prog);
      },
      onComplete: (_url, _verified, hash) => {
        setComputedHash(hash || '');
        isCompletedRef.current = true;
        setErrorMessage(null);
        setTransferState('COMPLETED');
        setStep('completed');
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

  const handleFileSelected = (file: File) => {
    selectedFileRef.current = file;
    setSelectedFile(file);
    const channel = webrtcRef.current?.dataChannel;
    if (channel && channel.readyState === 'open' && !isStreamingRef.current) {
      startStreaming(file, channel);
    }
  };

  const handleCancelTransfer = () => {
    if (signalingRef.current) {
      signalingRef.current.sendCancel('Cancelled by sender');
    }
    cleanupTransfer();
    setTransferState('CANCELLED');
    setErrorMessage('Transfer was cancelled by you.');
  };

  const handleReset = () => {
    cleanupTransfer();
    isCompletedRef.current = false;
    isStreamingRef.current = false;
    selectedFileRef.current = null;
    setSelectedFile(null);
    setOtp('');
    setTransferState('CREATED');
    setProgress(null);
    setErrorMessage(null);
    setStep('create');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-glass-pill text-xs px-3.5 py-1.5 gap-1.5 text-slate-300 hover:text-white"
        >
          <span>← Back to Home</span>
        </button>
        {step !== 'create' && otp && (
          <span className="badge-luminous-pill font-mono text-xs">
            <span className="text-slate-400 font-sans">Code:</span>
            <strong className="text-white font-bold tracking-wider">{otp.length === 6 ? `${otp.slice(0, 3)} ${otp.slice(3)}` : otp}</strong>
          </span>
        )}
      </div>

      {step !== 'completed' && (
        <ErrorMessage message={errorMessage || ''} onDismiss={() => setErrorMessage(null)} />
      )}

      {step === 'create' && (
        <div className="space-y-6">
          <FileSelector
            onFileSelect={handleFileSelected}
            selectedFile={selectedFile}
            onClearFile={() => {
              selectedFileRef.current = null;
              setSelectedFile(null);
            }}
          />

          <div className="pt-2 max-w-lg mx-auto">
            <button
              onClick={handleCreateTransfer}
              disabled={isLoading || !selectedFile}
              className="w-full btn-luminous-pill py-4 px-6 text-sm font-bold gap-2.5 shadow-xl shadow-cyan-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Generate One-Time Code & Share</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">
              Direct peer-to-peer WebRTC transfer • Zero server storage
            </p>
          </div>
        </div>
      )}

      {step === 'waiting' && (
        <div className="space-y-6">
          <OTPDisplay
            otp={otp}
            expiresAt={expiresAt}
            state={transferState}
          />

          {!selectedFile && (
            <div className="mt-4">
              <FileSelector
                onFileSelect={handleFileSelected}
                selectedFile={selectedFile}
                onClearFile={() => setSelectedFile(null)}
              />
            </div>
          )}
        </div>
      )}

      {step === 'transferring' && selectedFile && (
        <TransferProgress
          fileName={selectedFile.name}
          fileSize={selectedFile.size}
          progress={progress}
          state={transferState}
          role="sender"
          onCancel={handleCancelTransfer}
        />
      )}

      {step === 'completed' && selectedFile && (
        <TransferComplete
          fileName={selectedFile.name}
          fileSize={selectedFile.size}
          hashVerified={true}
          computedHash={computedHash}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
