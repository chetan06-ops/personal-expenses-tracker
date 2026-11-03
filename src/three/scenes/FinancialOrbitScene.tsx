import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CentralCore } from '../components/CentralCore';
import { OrbitRings } from '../components/OrbitRings';
import { CategoryNodes } from '../components/CategoryNodes';
import { Particles } from '../components/Particles';
import { Orbit2DFallback } from '../fallback/Orbit2DFallback';
import { CategoryBreakdownItem } from '../../types';
import { Eye, Layers } from 'lucide-react';

export interface FinancialOrbitSceneProps {
  netBalance: number;
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdownItem[];
  enable3D?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

/**
 * Checks if WebGL is supported by the current browser context.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

class ThreeErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('Three.js scene encountered an error, falling back to 2D:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const FinancialOrbitScene: React.FC<FinancialOrbitSceneProps> = ({
  netBalance,
  totalExpenses,
  categoryBreakdown,
  enable3D = true,
  performanceMode = 'high',
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [forced2D, setForced2D] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const fallbackView = (
    <Orbit2DFallback
      netBalance={netBalance}
      totalExpenses={totalExpenses}
      categoryBreakdown={categoryBreakdown}
    />
  );

  // If WebGL is unavailable, user disabled 3D, or prefers reduced motion, render 2D
  if (!hasWebGL || !enable3D || forced2D || reducedMotion) {
    return (
      <div className="relative">
        {fallbackView}
        {hasWebGL && enable3D && !reducedMotion && (
          <button
            onClick={() => setForced2D(false)}
            className="absolute top-2 right-2 flex items-center gap-1 text-[11px] bg-slate-800/80 hover:bg-slate-700 text-cyan-300 px-2 py-1 rounded-md border border-slate-700 transition"
            title="Switch to 3D Orbit"
          >
            <Layers className="w-3 h-3" />
            <span>Switch to 3D</span>
          </button>
        )}
      </div>
    );
  }

  const particleCount = performanceMode === 'low' ? 100 : performanceMode === 'medium' ? 200 : 350;

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden glass-card">
      <ThreeErrorBoundary fallback={fallbackView}>
        <Suspense fallback={fallbackView}>
          <Canvas
            camera={{ position: [0, 2.5, 6], fov: 50 }}
            dpr={[1, 1.5]}
            frameloop={reducedMotion ? 'demand' : 'always'}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.warn('WebGL context lost, falling back to 2D');
                setForced2D(true);
              });
            }}
          >
            {/* Ambient and Key Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 0]} intensity={2.5} color="#06B6D4" distance={10} />
            <pointLight position={[4, 5, 4]} intensity={1.5} color="#8B5CF6" />
            <directionalLight position={[-4, 4, -4]} intensity={0.6} color="#FFFFFF" />

            {/* Orbiting Elements */}
            <CentralCore netBalance={netBalance} />
            <OrbitRings />
            <CategoryNodes categories={categoryBreakdown} />
            <Particles count={particleCount} />

            {/* Camera Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minDistance={4}
              maxDistance={9}
              maxPolarAngle={Math.PI / 1.7}
              minPolarAngle={Math.PI / 3}
              autoRotate={!reducedMotion}
              autoRotateSpeed={0.8}
              dampingFactor={0.05}
            />
          </Canvas>
        </Suspense>
      </ThreeErrorBoundary>

      {/* Floating Mode Switch Control */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setForced2D(true)}
          className="flex items-center gap-1 text-[11px] bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 backdrop-blur-md transition shadow-sm"
          title="Switch to 2D view for lower battery/hardware consumption"
        >
          <Eye className="w-3 h-3 text-cyan-400" />
          <span>2D Mode</span>
        </button>
      </div>

      {/* Bottom Status Hint */}
      <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-slate-500 font-mono flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>Interactive Financial Orbit • Drag to rotate</span>
      </div>
    </div>
  );
};

export default FinancialOrbitScene;
