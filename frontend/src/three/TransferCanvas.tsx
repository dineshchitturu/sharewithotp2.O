import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { FileCrystal } from './FileCrystal';
import { NetworkNodes } from './NetworkNodes';
import { ConnectionBeam } from './ConnectionBeam';
import { TransferParticles } from './TransferParticles';

export type TransferStatus3D =
  | 'idle'
  | 'file_selected'
  | 'waiting'
  | 'connecting'
  | 'transferring'
  | 'completed';

export interface TransferCanvasProps {
  status: TransferStatus3D;
  progress?: number;
  speedBytesPerSec?: number;
  fileName?: string;
}

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Scene with subtle mouse parallax
const SceneContent: React.FC<{
  status: TransferStatus3D;
  progress: number;
  speedBytesPerSec: number;
}> = ({ status, progress, speedBytesPerSec }) => {
  const sceneGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!sceneGroup.current) return;
    // Parallax damping
    const targetRotX = (state.pointer.y * Math.PI) / 36;
    const targetRotY = (state.pointer.x * Math.PI) / 28;
    sceneGroup.current.rotation.x = THREE.MathUtils.damp(
      sceneGroup.current.rotation.x,
      targetRotX,
      3,
      0.016
    );
    sceneGroup.current.rotation.y = THREE.MathUtils.damp(
      sceneGroup.current.rotation.y,
      targetRotY,
      3,
      0.016
    );
  });

  return (
    <group ref={sceneGroup}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 6, 4]} intensity={1.5} color="#e0f2fe" />
      <pointLight position={[-2.2, 2.5, 1.5]} intensity={2.2} color="#38bdf8" />
      <pointLight
        position={[2.2, 2.5, 1.5]}
        intensity={2.2}
        color={status === 'completed' ? '#10b981' : '#38bdf8'}
      />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <NetworkNodes status={status} />
        <ConnectionBeam status={status} />
        <FileCrystal status={status} progress={progress} />
        <TransferParticles status={status} speedBytesPerSec={speedBytesPerSec} />
      </Float>
    </group>
  );
};

// 2D Fallback for environments lacking WebGL
const Fallback2D: React.FC<TransferCanvasProps> = ({ status, progress = 0 }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative w-64 h-32 flex items-center justify-between px-4">
        {/* Sender Node */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(56,189,248,0.4)] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-xs font-mono text-cyan-300">Sender</span>
        </div>

        {/* Dynamic Beam */}
        <div className="flex-1 h-0.5 mx-3 relative bg-slate-700 overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 transition-all duration-300 ${
              status === 'transferring' ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>

        {/* Receiver Node */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
              status === 'completed'
                ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'border-slate-700 bg-slate-900/60'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full ${
                status === 'completed' ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
          </div>
          <span className="text-xs font-mono text-slate-400">Receiver</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-mono mt-2 uppercase tracking-wider">
        P2P DataStream • Direct Browser Link
      </p>
    </div>
  );
};

export const TransferCanvas: React.FC<TransferCanvasProps> = ({
  status,
  progress = 0,
  speedBytesPerSec = 0,
  fileName,
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    setHasWebGL(checkWebGL());
  }, []);

  if (!hasWebGL) {
    return <Fallback2D status={status} progress={progress} />;
  }

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] select-none pointer-events-auto">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 4.4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            status={status}
            progress={progress}
            speedBytesPerSec={speedBytesPerSec}
          />
        </Suspense>
      </Canvas>

      {/* Node labels overlay with modern cyber-minimal styling */}
      <div className="absolute inset-x-0 bottom-2 px-8 flex justify-between items-center pointer-events-none text-[11px] font-mono tracking-wider uppercase text-slate-400">
        <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-2.5 py-1 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Local Peer</span>
        </div>

        {fileName && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/70 border border-cyan-500/20 px-3 py-1 rounded-full backdrop-blur-md text-cyan-300 truncate max-w-[200px]">
            <span className="truncate">{fileName}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-2.5 py-1 rounded-full backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'completed'
                ? 'bg-emerald-400'
                : status === 'transferring'
                ? 'bg-cyan-400'
                : 'bg-slate-600'
            }`}
          />
          <span>Remote Peer</span>
        </div>
      </div>
    </div>
  );
};
