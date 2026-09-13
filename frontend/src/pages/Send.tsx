import React, { useState, useRef, useEffect } from 'react';
import { RoomCreator } from '../components/RoomCreator';
import { OTPDisplay } from '../components/OTPDisplay';
import { FileSelector } from '../components/FileSelector';
import { TransferProgress } from '../components/TransferProgress';
import { TransferComplete } from '../components/TransferComplete';
import { ErrorMessage } from '../components/ErrorMessage';
import { createRoom } from '../services/api';
import { SignalingClient } from '../services/signaling';
import { WebRTCManager } from '../services/webrtc';
import { FileSender } from '../services/fileTransfer';
import type { TransferProgress as ProgressData, TransferState } from '../types/transfer';

interface SendProps {
  onBack: () => void;
}

export const Send: React.FC<SendProps> = ({ onBack }) => {
  const [step, setStep] = useState<'create' | 'waiting' | 'transferring' | 'completed'>('create');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [roomId, setRoomId] = useState<string>('');
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

  useEffect(() => {
    return () => {
      cleanupTransfer();
    };
  }, []);

  const cleanupTransfer = () => {
    isStreamingRef.current = false;
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

  const handleCreateRoom = async (chosenRoomId: string) => {
    if (!selectedFileRef.current) {
      setErrorMessage('Please select a file to share first before creating a transfer room.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    isCompletedRef.current = false;
    isStreamingRef.current = false;

    try {
      const resp = await createRoom(chosenRoomId);
      setRoomId(resp.room_id);
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
            setTransferState('CONNECTED');
          } else if (state === 'disconnected' || state === 'failed') {
            if (!isCompletedRef.current) {
              setTransferState('DISCONNECTED');
              setErrorMessage('Peer connection disconnected.');
            }
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

        if (msg.type === 'peer-joined') {
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
          setStep('completed');
          cleanupTransfer();
        } else if (msg.type === 'transfer-cancelled') {
          if (!isCompletedRef.current) {
            setTransferState('CANCELLED');
            setErrorMessage(`Transfer cancelled: ${msg.reason || 'By receiver'}`);
            cleanupTransfer();
          }
        } else if (msg.type === 'peer-left') {
          if (!isCompletedRef.current) {
            setTransferState('DISCONNECTED');
            setErrorMessage('Receiver disconnected from the room.');
          }
        } else if (msg.type === 'error') {
          if (!isCompletedRef.current) {
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
      onComplete: (_url, verified, hash) => {
        setComputedHash(hash || '');
        if (verified) {
          isCompletedRef.current = true;
          setErrorMessage(null);
          setTransferState('COMPLETED');
          setStep('completed');
          cleanupTransfer();
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
    setRoomId('');
    setOtp('');
    setTransferState('CREATED');
    setProgress(null);
    setErrorMessage(null);
    setStep('create');
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
        {step !== 'create' && (
          <span className="text-xs font-mono text-slate-500">
            Room: <strong className="text-slate-300">{roomId}</strong>
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
          <RoomCreator
            onCreate={handleCreateRoom}
            isLoading={isLoading}
            hasSelectedFile={Boolean(selectedFile)}
          />
        </div>
      )}

      {step === 'waiting' && (
        <div className="space-y-6">
          <OTPDisplay
            roomId={roomId}
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
