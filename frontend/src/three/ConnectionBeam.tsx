import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ConnectionBeamProps {
  status: 'idle' | 'file_selected' | 'waiting' | 'connecting' | 'transferring' | 'completed';
}

export const ConnectionBeam: React.FC<ConnectionBeamProps> = ({ status }) => {
  // Line from Sender to Relay
  const senderToRelayPoints = useMemo(() => {
    return [new THREE.Vector3(-2.2, 0.4, 0), new THREE.Vector3(0, 1.6, -0.8)];
  }, []);

  // Line from Relay to Receiver
  const relayToReceiverPoints = useMemo(() => {
    return [new THREE.Vector3(0, 1.6, -0.8), new THREE.Vector3(2.2, 0.4, 0)];
  }, []);

  // Direct P2P Line between Sender and Receiver
  const directP2PPoints = useMemo(() => {
    // Slight catenary curve down towards center
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.2, 0.4, 0),
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(2.2, 0.4, 0)
    );
    return curve.getPoints(32);
  }, []);

  const senderToRelayGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(senderToRelayPoints);
  }, [senderToRelayPoints]);

  const relayToReceiverGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(relayToReceiverPoints);
  }, [relayToReceiverPoints]);

  const directP2PGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(directP2PPoints);
  }, [directP2PPoints]);

  const isDirectActive = status === 'connecting' || status === 'transferring' || status === 'completed';
  const isSignalingActive = status === 'file_selected' || status === 'waiting' || status === 'connecting';
  const isCompleted = status === 'completed';

  const beamColor = isCompleted ? '#10b981' : '#38bdf8';

  return (
    <group>
      {/* Signaling Lines (to broker) */}
      <primitive object={new THREE.Line(senderToRelayGeom, new THREE.LineBasicMaterial({
        color: '#0284c7',
        transparent: true,
        opacity: isSignalingActive ? 0.45 : 0.12,
      }))} />

      <primitive object={new THREE.Line(relayToReceiverGeom, new THREE.LineBasicMaterial({
        color: '#0284c7',
        transparent: true,
        opacity: isSignalingActive ? 0.45 : 0.12,
      }))} />

      {/* Direct P2P Beam */}
      <primitive object={new THREE.Line(directP2PGeom, new THREE.LineBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: isDirectActive ? 0.75 : 0.15,
      }))} />
    </group>
  );
};
