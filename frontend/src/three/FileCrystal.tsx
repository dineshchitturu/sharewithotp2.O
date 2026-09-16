import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

export interface FileCrystalProps {
  status: 'idle' | 'file_selected' | 'waiting' | 'connecting' | 'transferring' | 'completed';
  progress?: number; // 0 to 100
}

export const FileCrystal: React.FC<FileCrystalProps> = ({ status, progress = 0 }) => {
  const meshRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Target positions:
  // Sender: -2.2, Receiver: 2.2
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Default resting position
    let targetX = 0;
    let targetY = Math.sin(time * 1.6) * 0.08 + 0.3;
    let targetZ = 0;

    if (status === 'transferring') {
      // Map progress (0-100) from sender (-2.2) to receiver (+2.2)
      const ratio = Math.min(1, Math.max(0, progress / 100));
      targetX = -2.2 + ratio * 4.4;
      // Slight arc upwards during flight
      targetY = 0.4 + Math.sin(ratio * Math.PI) * 0.6;
    } else if (status === 'completed') {
      targetX = 2.2;
      targetY = 0.4 + Math.sin(time * 2.0) * 0.04;
    } else if (status === 'file_selected' || status === 'waiting') {
      targetX = -2.2;
      targetY = 0.4 + Math.sin(time * 1.8) * 0.06;
    }

    // Smooth interpolation (damping) towards target position
    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, 5, delta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 5, delta);
    meshRef.current.position.z = THREE.MathUtils.damp(meshRef.current.position.z, targetZ, 5, delta);

    // Continuous slow hypnotic rotation
    meshRef.current.rotation.y += delta * 0.6;
    meshRef.current.rotation.x = Math.sin(time * 0.8) * 0.15;

    // Scale pulse depending on status
    let targetScale = 1.0;
    if (status === 'file_selected') targetScale = 1.15;
    if (status === 'transferring') targetScale = 0.95;
    if (status === 'completed') targetScale = 1.1;

    meshRef.current.scale.setScalar(
      THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 4, delta)
    );
  });

  // Determine dynamic colors based on state
  const isCompleted = status === 'completed';
  const isTransferring = status === 'transferring';
  const isWaiting = status === 'waiting';

  const bodyColor = isCompleted
    ? '#10b981'
    : isTransferring
    ? '#38bdf8'
    : isWaiting
    ? '#f59e0b'
    : '#0284c7';

  const edgeColor = isCompleted
    ? '#34d399'
    : isTransferring
    ? '#7dd3fc'
    : isWaiting
    ? '#fcd34d'
    : '#38bdf8';

  return (
    <group ref={meshRef} position={[0, 0.3, 0]}>
      {/* Outer Stylized File Tablet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.2, 0.14]} />
        <meshPhysicalMaterial
          color={bodyColor}
          roughness={0.15}
          metalness={0.7}
          transmission={0.65}
          thickness={0.5}
          ior={1.4}
          transparent
          opacity={0.88}
        />
        <Edges color={edgeColor} threshold={15} />
      </mesh>

      {/* Internal Glowing Data Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color={edgeColor}
          emissive={edgeColor}
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Subtle Data Ring Accent */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.012, 16, 32]} />
        <meshBasicMaterial color={edgeColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};
