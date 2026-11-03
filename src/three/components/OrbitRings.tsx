import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const OrbitRings: React.FC = () => {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.05;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.03;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.02;
  });

  return (
    <group>
      {/* Inner Primary Orbit Ring */}
      <group ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.5, 0.015, 16, 100]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Middle Orbit Ring */}
      <group ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[3.6, 0.012, 16, 100]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.25} />
        </mesh>
      </group>

      {/* Outer Orbit Ring */}
      <group ref={ring3Ref} rotation={[Math.PI / 5, -Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[4.7, 0.01, 16, 100]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
};
