import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CategoryBreakdownItem } from '../../types';
import { formatINR } from '../../utils/currency';

interface CategoryNodesProps {
  categories: CategoryBreakdownItem[];
}

export const CategoryNodes: React.FC<CategoryNodesProps> = ({ categories }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const topCategories = categories.slice(0, 6);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {topCategories.map((cat, idx) => {
        const angle = (idx * 2 * Math.PI) / topCategories.length;
        const radius = 2.8 + (idx % 3) * 0.7; // staggering orbit radii
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = Math.sin(angle * 2) * 0.4; // subtle wave

        const nodeScale = Math.max(0.2, Math.min(0.45, 0.2 + (cat.percentage / 100) * 0.35));
        const isHovered = hoveredIdx === idx;

        return (
          <group key={cat.category} position={[x, y, z]}>
            {/* Connecting Line to Core */}
            <line>
              <bufferGeometry
                attach="geometry"
                onUpdate={(geom) => {
                  geom.setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(-x, -y, -z),
                  ]);
                }}
              />
              <lineBasicMaterial
                color={cat.color}
                transparent
                opacity={isHovered ? 0.4 : 0.1}
                linewidth={1}
              />
            </line>

            {/* Category Sphere Mesh */}
            <mesh
              scale={isHovered ? nodeScale * 1.3 : nodeScale}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIdx(idx);
              }}
              onPointerOut={() => setHoveredIdx(null)}
            >
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial
                color={cat.color}
                emissive={cat.color}
                emissiveIntensity={isHovered ? 0.8 : 0.4}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>

            {/* Orbit Label / Tooltip via Drei Html — kept below sticky header (z-30) and modals (z-50) */}
            <Html
              position={[0, nodeScale + 0.3, 0]}
              center
              distanceFactor={8}
              zIndexRange={[10, 0]}
            >
              <div
                className={`transition-all duration-200 pointer-events-none select-none rounded-lg px-2.5 py-1 text-center whitespace-nowrap backdrop-blur-md border ${
                  isHovered
                    ? 'bg-slate-900/95 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900/75 border-white/10 opacity-85'
                }`}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-semibold text-white">
                    {cat.category}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 font-medium">
                  {formatINR(cat.amount)}
                </div>
                {isHovered && (
                  <div className="text-[10px] text-slate-400">
                    {cat.percentage}% of spending
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
