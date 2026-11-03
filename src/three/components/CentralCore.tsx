import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CentralCoreProps {
  netBalance: number;
}

export const CentralCore: React.FC<CentralCoreProps> = ({ netBalance }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const isHealthy = netBalance >= 0;
  const coreColor = isHealthy ? '#06B6D4' : '#F43F5E';
  const glowColor = isHealthy ? '#0891B2' : '#E11D48';

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Outer Glow Sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main Core Crystal Mesh */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <meshStandardMaterial
          color={coreColor}
          roughness={0.15}
          metalness={0.8}
          emissive={coreColor}
          emissiveIntensity={0.6}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe Halo Overlay */}
      <mesh>
        <sphereGeometry args={[1.05, 16, 16]} />
        <meshBasicMaterial
          color="#38BDF8"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
};
