import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Bar3DProps {
  value: number;
  maxValue: number;
  color: string;
  position: [number, number, number];
  isAnimating: boolean;
}

const Bar3D: React.FC<Bar3DProps> = ({ value, maxValue, color, position, isAnimating }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const height = (value / maxValue) * 5; // Scale height to max 5 units
  const targetY = height / 2; // Center the bar vertically
  
  useFrame(() => {
    if (meshRef.current && isAnimating) {
      // Smooth animation to target position
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.1
      );
    }
  });
  
  useEffect(() => {
    if (meshRef.current && !isAnimating) {
      meshRef.current.position.y = targetY;
    }
  }, [targetY, isAnimating]);
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color}
          transparent
          opacity={hovered ? 0.9 : 0.8}
        />
      </mesh>
      
      {/* Value label */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
};

interface VisualizationStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
}

interface ThreeVisualizationProps {
  step: VisualizationStep;
  isAnimating: boolean;
}

const Scene: React.FC<ThreeVisualizationProps> = ({ step, isAnimating }) => {
  const maxValue = Math.max(...step.array);
  
  const getBarColor = (index: number): string => {
    if (step.sorted.includes(index)) return '#10b981'; // green
    if (step.swapping.includes(index)) return '#ef4444'; // red
    if (step.comparing.includes(index)) return '#f59e0b'; // yellow
    return '#3b82f6'; // blue (default)
  };
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Ground plane */}
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
      
      {/* Bars */}
      {step.array.map((value, index) => {
        const x = (index - step.array.length / 2) * 1.2;
        return (
          <Bar3D
            key={index}
            value={value}
            maxValue={maxValue}
            color={getBarColor(index)}
            position={[x, 0, 0]}
            isAnimating={isAnimating}
          />
        );
      })}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export const ThreeVisualization: React.FC<ThreeVisualizationProps> = ({ step, isAnimating }) => {
  return (
    <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 8, 12], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene step={step} isAnimating={isAnimating} />
      </Canvas>
    </div>
  );
};