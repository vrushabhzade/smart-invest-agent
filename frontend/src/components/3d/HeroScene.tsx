'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlowingSphere({ position, color, speed, distort, size }: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
  size: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.3;
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.z = t * 0.05;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position}>
        <Sphere args={[size, 64, 64]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={distort}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.6}
          />
        </Sphere>
      </mesh>
    </Float>
  );
}

function DataRings() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.05;
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1;
  });

  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(2.5, 0.01, 16, 100);
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          geometry={ringGeometry}
          rotation={[Math.PI / 2 + i * 0.15, i * 0.3, i * 0.1]}
        >
          <meshBasicMaterial
            color={i === 0 ? '#00F0FF' : i === 1 ? '#7B61FF' : '#00E676'}
            transparent
            opacity={0.3 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = t * 0.02;
    particlesRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#00F0FF"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#00F0FF" />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#7B61FF" />

        <GlowingSphere position={[-2.5, 0.5, -1]} color="#00F0FF" speed={1.5} distort={0.4} size={0.8} />
        <GlowingSphere position={[2.8, -0.3, -2]} color="#7B61FF" speed={1.2} distort={0.3} size={0.6} />
        <GlowingSphere position={[0, 1.5, -1.5]} color="#00E676" speed={1.0} distort={0.5} size={0.4} />

        <DataRings />
        <FloatingParticles />
        <Stars radius={50} depth={50} count={1000} factor={3} saturation={0} fade speed={0.5} />
      </Canvas>
    </div>
  );
}
