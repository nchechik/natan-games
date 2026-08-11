"use client";

import { useMemo, useRef, type ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CropId, GrowthStage } from "../types";
import { CROPS } from "../types";

const STAGE_SCALE: Record<GrowthStage, number> = {
  empty: 0,
  seed: 0.22,
  sprout: 0.62,
  grown: 1,
  wilted: 0.45,
};

function WheatCrop({ tint }: { tint: string }) {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        const r = 0.12 + (i % 2) * 0.05;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.45, Math.sin(a) * r]}>
            <cylinderGeometry args={[0.02, 0.03, 0.9, 5]} />
            <meshStandardMaterial color="#6f9b45" roughness={0.85} />
          </mesh>
        );
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        const r = 0.1 + (i % 2) * 0.04;
        return (
          <mesh key={`h-${i}`} position={[Math.cos(a) * r, 0.92, Math.sin(a) * r]}>
            <coneGeometry args={[0.06, 0.22, 6]} />
            <meshStandardMaterial color={tint} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function CornCrop({ tint }: { tint: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 1.1, 6]} />
        <meshStandardMaterial color="#4f8f3a" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.7, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.28, 0.02, 0.12]} />
        <meshStandardMaterial color="#6db35a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.08, 0.55, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.26, 0.02, 0.1]} />
        <meshStandardMaterial color="#6db35a" roughness={0.9} />
      </mesh>
      <mesh position={[0.06, 0.62, 0.02]}>
        <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
    </group>
  );
}

function CarrotCrop({ tint }: { tint: string }) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.12, 0.42, 8]} />
        <meshStandardMaterial color={tint} roughness={0.65} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i * 2.1) * 0.05, 0.42, Math.sin(i * 2.1) * 0.05]}
          rotation={[0.2, i, 0.15]}
        >
          <coneGeometry args={[0.03, 0.28, 5]} />
          <meshStandardMaterial color="#3f9a45" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function TomatoCrop({ tint }: { tint: string }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.7, 6]} />
        <meshStandardMaterial color="#3d7a32" roughness={0.85} />
      </mesh>
      {[
        [0.12, 0.45, 0.05],
        [-0.1, 0.55, -0.06],
        [0.02, 0.68, 0.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color={tint} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0.16, 0.5, -0.08]} rotation={[0.4, 0.2, 0.5]}>
        <boxGeometry args={[0.22, 0.015, 0.1]} />
        <meshStandardMaterial color="#5fa85a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PumpkinCrop({ tint }: { tint: string }) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} scale={[1, 0.78, 1]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.14, 6]} />
        <meshStandardMaterial color="#3d6b2e" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.22, 0.2]} rotation={[0.5, 0.4, 0.2]}>
        <torusGeometry args={[0.12, 0.02, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#4f8f45" roughness={0.85} />
      </mesh>
    </group>
  );
}

const CROP_MESH: Record<
  CropId,
  (props: { tint: string }) => ReactElement
> = {
  wheat: WheatCrop,
  corn: CornCrop,
  carrot: CarrotCrop,
  tomato: TomatoCrop,
  pumpkin: PumpkinCrop,
};

export function CropPlant({
  cropId,
  stage,
  swaySeed = 0,
}: {
  cropId: CropId;
  stage: GrowthStage;
  swaySeed?: number;
}) {
  const group = useRef<Group>(null);
  const target = STAGE_SCALE[stage];
  const tint = CROPS[cropId].tint;
  const Mesh = useMemo(() => CROP_MESH[cropId], [cropId]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const scale = g.scale.x + (target - g.scale.x) * 0.08;
    g.scale.setScalar(Math.max(0.001, scale));
    if (stage === "empty") {
      g.visible = false;
      return;
    }
    g.visible = true;
    if (stage === "grown" || stage === "sprout") {
      g.rotation.z = Math.sin(t * 1.4 + swaySeed) * 0.06;
      g.rotation.x = Math.cos(t * 1.1 + swaySeed * 0.7) * 0.03;
      if (stage === "grown") {
        g.position.y = Math.sin(t * 2.2 + swaySeed) * 0.02;
      }
    } else {
      g.rotation.z *= 0.9;
      g.rotation.x *= 0.9;
    }
  });

  if (stage === "empty") return null;

  return (
    <group ref={group} scale={0.001}>
      {stage === "seed" ? (
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
        </mesh>
      ) : (
        <Mesh tint={tint} />
      )}
    </group>
  );
}
