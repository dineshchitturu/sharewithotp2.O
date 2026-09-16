import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TransferParticlesProps {
  status: 'idle' | 'file_selected' | 'waiting' | 'connecting' | 'transferring' | 'completed';
  speedBytesPerSec?: number;
}

const PARTICLE_COUNT = 90;

export const TransferParticles: React.FC<TransferParticlesProps> = ({
  status,
  speedBytesPerSec = 0,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Pre-generate random offsets and initial progress values
  const { initialProgress, offsets } = useMemo(() => {
    const p = new Float32Array(PARTICLE_COUNT);
    const o = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p[i] = Math.random();
      o[i * 3 + 0] = (Math.random() - 0.5) * 0.16;
      o[i * 3 + 1] = (Math.random() - 0.5) * 0.16;
      o[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
    }
    return { initialProgress: p, offsets: o };
  }, []);

  const progressRef = useRef<Float32Array>(new Float32Array(initialProgress));

  // Initial buffer positions
  const positions = useMemo(() => {
    return new Float32Array(PARTICLE_COUNT * 3);
  }, []);

  // Quadratic bezier curve reference points
  const p0 = useMemo(() => new THREE.Vector3(-2.2, 0.4, 0), []);
  const p1 = useMemo(() => new THREE.Vector3(0, 0.12, 0), []);
  const p2 = useMemo(() => new THREE.Vector3(2.2, 0.4, 0), []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const isTransferring = status === 'transferring';
    const isConnecting = status === 'connecting';

    if (!isTransferring && !isConnecting) {
      pointsRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;

    // Calculate speed factor: base 0.5 + dynamic scale based on MB/s
    const speedMB = speedBytesPerSec / (1024 * 1024);
    const speedFactor = isConnecting
      ? 0.35
      : THREE.MathUtils.clamp(0.6 + speedMB * 0.15, 0.6, 2.5);

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const pArr = posAttr.array as Float32Array;
    const curProgress = progressRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      curProgress[i] += delta * speedFactor;
      if (curProgress[i] > 1) {
        curProgress[i] -= 1;
      }

      const t = curProgress[i];
      const invT = 1 - t;

      // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const bx = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
      const by = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
      const bz = invT * invT * p0.z + 2 * invT * t * p1.z + t * t * p2.z;

      pArr[i * 3 + 0] = bx + offsets[i * 3 + 0];
      pArr[i * 3 + 1] = by + offsets[i * 3 + 1];
      pArr[i * 3 + 2] = bz + offsets[i * 3 + 2];
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#38bdf8"
        size={0.055}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
