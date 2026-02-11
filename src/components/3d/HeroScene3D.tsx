import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useDeviceCapability } from '@/hooks/useDeviceCapability';

/* ─── Floating Geometric Shape ─── */
interface FloatingShapeProps {
  position: [number, number, number];
  geometry: 'icosahedron' | 'torus' | 'octahedron' | 'dodecahedron';
  color: string;
  size: number;
  speed: number;
  distort?: number;
}

const FloatingShape: React.FC<FloatingShapeProps> = ({
  position,
  geometry,
  color,
  size,
  speed,
  distort = 0.3,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  const getGeometry = () => {
    switch (geometry) {
      case 'icosahedron':
        return <icosahedronGeometry args={[size, 1]} />;
      case 'torus':
        return <torusGeometry args={[size, size * 0.35, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size]} />;
    }
  };

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        {getGeometry()}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.8}
          metalness={0.2}
          distort={distort}
          speed={speed}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
};

/* ─── Particle Field ─── */
const ParticleField: React.FC<{ count: number }> = ({ count }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#a855f7'), // purple (XP)
      new THREE.Color('#f97316'), // orange (primary)
      new THREE.Color('#fbbf24'), // gold (level)
      new THREE.Color('#3b82f6'), // blue
      new THREE.Color('#ffffff'), // white sparkle
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/* ─── Scene Content ─── */
const SceneContent: React.FC<{ tier: 'medium' | 'high' }> = ({ tier }) => {
  const shapes: FloatingShapeProps[] = useMemo(
    () => [
      { position: [-3.5, 1.5, -2], geometry: 'icosahedron', color: '#a855f7', size: 0.8, speed: 0.5, distort: 0.4 },
      { position: [3.8, -1.2, -3], geometry: 'torus', color: '#f97316', size: 0.6, speed: 0.3, distort: 0.2 },
      { position: [-2, -2, -1.5], geometry: 'octahedron', color: '#fbbf24', size: 0.5, speed: 0.7, distort: 0.3 },
      { position: [2.5, 2, -2.5], geometry: 'dodecahedron', color: '#3b82f6', size: 0.4, speed: 0.4, distort: 0.5 },
      { position: [0, -1.5, -4], geometry: 'icosahedron', color: '#22c55e', size: 0.7, speed: 0.6, distort: 0.2 },
    ],
    [],
  );

  const particleCount = tier === 'high' ? 200 : 100;

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#f97316" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#a855f7" />

      {/* Floating shapes */}
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}

      {/* Particle field */}
      <ParticleField count={particleCount} />
    </>
  );
};

/* ─── Gradient Fallback (Low-end devices) ─── */
const GradientFallback: React.FC = () => (
  <div
    className="absolute inset-0 bg-gradient-hero"
    style={{
      background: `
        radial-gradient(ellipse at 20% 50%, hsl(271 81% 56% / 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, hsl(14 100% 57% / 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, hsl(45 100% 51% / 0.04) 0%, transparent 50%),
        hsl(240 15% 3%)
      `,
    }}
  />
);

/* ─── Main HeroScene3D Component ─── */
const HeroScene3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canRender3D, performanceTier, recommendedDPR } = useDeviceCapability();

  if (!canRender3D) {
    return <GradientFallback />;
  }

  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <Suspense fallback={<GradientFallback />}>
        <Canvas
          dpr={[1, recommendedDPR]}
          camera={{ position: [0, 0, 6], fov: 55 }}
          style={{ pointerEvents: 'none' }}
          gl={{
            alpha: true,
            antialias: performanceTier === 'high',
            powerPreference: 'high-performance',
          }}
        >
          <SceneContent tier={performanceTier as 'medium' | 'high'} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default HeroScene3D;
