"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import type { Group } from "three";
import { plotPosition } from "./PlotBed";

const IDLE_POS: [number, number, number] = [-2.8, 0, 3.6];
const DROP_COUNT = 7;

/** Hired hand that stands by a plot and pours water while it grows */
export function WateringWorker({
  plotIndex,
  watering,
}: {
  plotIndex: number | null;
  watering: boolean;
}) {
  const target =
    plotIndex != null
      ? (() => {
          const [x, , z] = plotPosition(plotIndex);
          return [x + 0.95, 0, z + 0.15] as [number, number, number];
        })()
      : IDLE_POS;

  const { posX, posZ } = useSpring({
    posX: target[0],
    posZ: target[2],
    config: { tension: 90, friction: 18 },
  });

  const canRef = useRef<Group>(null);
  const armRef = useRef<Group>(null);
  const dropsRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (armRef.current) {
      armRef.current.rotation.z = watering
        ? -0.85 + Math.sin(t * 4.2) * 0.12
        : -0.25 + Math.sin(t * 1.4) * 0.08;
    }
    if (canRef.current) {
      canRef.current.rotation.z = watering
        ? -0.95 + Math.sin(t * 5) * 0.1
        : -0.2;
    }
    if (dropsRef.current) {
      dropsRef.current.visible = watering;
      if (!watering) return;
      dropsRef.current.children.forEach((child, i) => {
        const phase = (t * 2.1 + i * 0.34) % 1;
        child.position.set(
          0.42 + (i % 3) * 0.03 - phase * 0.06,
          0.95 - phase * 0.7,
          0.12 + ((i % 5) - 2) * 0.04,
        );
        child.scale.setScalar(Math.max(0.12, (1 - phase) * 0.9));
        child.visible = phase < 0.9;
      });
    }
  });

  return (
    <a.group position-x={posX} position-y={0} position-z={posZ} scale={0.92}>
      {/* Face toward the bed when working */}
      <group rotation={[0, watering ? -0.9 : 0.35, 0]}>
        {/* Legs */}
        <mesh position={[-0.1, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.45, 8]} />
          <meshStandardMaterial color="#3b6ea5" roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.45, 8]} />
          <meshStandardMaterial color="#3b6ea5" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.06, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.22]} />
          <meshStandardMaterial color="#4a3020" roughness={0.85} />
        </mesh>
        <mesh position={[0.1, 0.06, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.22]} />
          <meshStandardMaterial color="#4a3020" roughness={0.85} />
        </mesh>
        {/* Overalls + shirt */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[0.42, 0.5, 0.28]} />
          <meshStandardMaterial color="#4a82ba" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.48, 0.22, 0.3]} />
          <meshStandardMaterial color="#d6453d" roughness={0.7} />
        </mesh>
        {/* Left arm */}
        <mesh position={[-0.3, 0.78, 0]} rotation={[0, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.38, 8]} />
          <meshStandardMaterial color="#e8b896" roughness={0.7} />
        </mesh>
        {/* Right arm + watering can */}
        <group ref={armRef} position={[0.26, 0.9, 0.08]}>
          <mesh rotation={[0.15, 0, -0.55]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.4, 8]} />
            <meshStandardMaterial color="#e8b896" roughness={0.7} />
          </mesh>
          <group ref={canRef} position={[0.22, -0.05, 0.12]} scale={0.85}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.12, 0.18, 10]} />
              <meshStandardMaterial
                color="#3a8fd4"
                roughness={0.45}
                metalness={0.25}
              />
            </mesh>
            <mesh position={[0.14, 0.02, 0]} rotation={[0, 0, -0.55]} castShadow>
              <cylinderGeometry args={[0.02, 0.03, 0.16, 8]} />
              <meshStandardMaterial
                color="#4aa3e0"
                roughness={0.4}
                metalness={0.25}
              />
            </mesh>
            <mesh position={[-0.02, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.07, 0.014, 6, 12, Math.PI]} />
              <meshStandardMaterial color="#2a6fa8" roughness={0.45} />
            </mesh>
          </group>
        </group>
        {/* Head + hat */}
        <mesh position={[0, 1.22, 0]} castShadow>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color="#f0c8a8" roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.14, 0.18]} scale={[1.4, 0.45, 0.6]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.8} />
        </mesh>
        <mesh position={[-0.07, 1.26, 0.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
        </mesh>
        <mesh position={[0.07, 1.26, 0.18]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.18, 12]} />
          <meshStandardMaterial color="#e8c86a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.32, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 16]} />
          <meshStandardMaterial color="#d4b45a" roughness={0.85} />
        </mesh>

        <group ref={dropsRef}>
          {Array.from({ length: DROP_COUNT }, (_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial
                color="#5ec8ff"
                emissive="#2a9fd4"
                emissiveIntensity={0.35}
                transparent
                opacity={0.85}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>
      </group>
    </a.group>
  );
}
