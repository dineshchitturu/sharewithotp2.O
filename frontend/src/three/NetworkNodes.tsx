import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NetworkNodesProps {
  status: 'idle' | 'file_selected' | 'waiting' | 'connecting' | 'transferring' | 'completed';
}

export const NetworkNodes: React.FC<NetworkNodesProps> = ({ status }) => {
  const senderRingRef = useRef<THREE.Mesh>(null);
  const receiverRingRef = useRef<THREE.Mesh>(null);
  const relayNodeRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (senderRingRef.current) {
      senderRingRef.current.rotation.z += delta * 0.8;
      const sScale = status !== 'idle' ? 1 + Math.sin(time * 3) * 0.08 : 1;
      senderRingRef.current.scale.setScalar(sScale);
    }

    if (receiverRingRef.current) {
      receiverRingRef.current.rotation.z -= delta * 0.8;
      const rScale =
        status === 'connecting' || status === 'transferring' || status === 'completed'
          ? 1 + Math.sin(time * 3) * 0.08
          : 0.9;
      receiverRingRef.current.scale.setScalar(rScale);
    }

    if (relayNodeRef.current) {
      relayNodeRef.current.position.y = 1.6 + Math.sin(time * 1.5) * 0.06;
      relayNodeRef.current.rotation.y += delta * 0.5;
    }
  });

  const senderActive = status !== 'idle';
  const receiverActive =
    status === 'connecting' || status === 'transferring' || status === 'completed';
  const isCompleted = status === 'completed';

  const senderColor = senderActive ? '#38bdf8' : '#334155';
  const receiverColor = isCompleted ? '#10b981' : receiverActive ? '#38bdf8' : '#334155';
  const relayColor = status === 'connecting' ? '#38bdf8' : '#64748b';

  return (
    <group>
      {/* 1. SENDER NODE */}
      <group position={[-2.2, 0.4, 0]}>
        {/* Core Sphere */}
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color={senderColor}
            emissive={senderColor}
            emissiveIntensity={senderActive ? 1.2 : 0.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Orbiting Ring */}
        <mesh ref={senderRingRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.38, 0.015, 16, 32]} />
          <meshBasicMaterial
            color={senderColor}
            transparent
            opacity={senderActive ? 0.8 : 0.25}
          />
        </mesh>
      </group>

      {/* 2. SIGNALING / EPHEMERAL BROKER NODE */}
      <group ref={relayNodeRef} position={[0, 1.6, -0.8]}>
        <mesh>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial
            color={relayColor}
            emissive={relayColor}
            emissiveIntensity={status === 'connecting' ? 1.5 : 0.3}
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.3, 0.01, 16, 24]} />
          <meshBasicMaterial
            color={relayColor}
            transparent
            opacity={0.35}
          />
        </mesh>
      </group>

      {/* 3. RECEIVER NODE */}
      <group position={[2.2, 0.4, 0]}>
        {/* Core Sphere */}
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color={receiverColor}
            emissive={receiverColor}
            emissiveIntensity={receiverActive ? 1.2 : 0.2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Orbiting Ring */}
        <mesh ref={receiverRingRef} rotation={[-Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.38, 0.015, 16, 32]} />
          <meshBasicMaterial
            color={receiverColor}
            transparent
            opacity={receiverActive ? 0.8 : 0.25}
          />
        </mesh>
      </group>
    </group>
  );
};
