"use client";

import { useMemo, useRef, type ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { CropId, GrowthStage } from "../types";
import { CROPS } from "../types";

const STAGE_SCALE: Record<GrowthStage, number> = {
  empty: 0,
  seed: 0.32,
  sprout: 0.72,
  grown: 1,
  wilted: 0.45,
};

const WHEAT_STALKS = [
  { x: 0, z: 0, h: 1, lean: 0, twist: 0 },
  { x: 0.13, z: 0.09, h: 0.94, lean: 0.1, twist: 0.4 },
  { x: -0.12, z: 0.1, h: 0.9, lean: -0.1, twist: -0.5 },
  { x: 0.1, z: -0.11, h: 0.96, lean: 0.08, twist: 0.8 },
  { x: -0.1, z: -0.09, h: 0.91, lean: -0.12, twist: -0.3 },
  { x: 0.02, z: 0.17, h: 0.86, lean: 0.06, twist: 1.1 },
  { x: -0.03, z: -0.16, h: 0.88, lean: -0.05, twist: -1.0 },
  { x: 0.18, z: 0.02, h: 0.85, lean: 0.14, twist: 0.2 },
  { x: -0.17, z: 0.0, h: 0.87, lean: -0.11, twist: -0.6 },
] as const;

function WheatEar({ tint, y }: { tint: string; y: number }) {
  const grains = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        y: i * 0.042,
        scale: 1 - i * 0.048,
        rot: i * 0.55,
      })),
    [],
  );

  return (
    <group position={[0, y, 0]}>
      {grains.map((g, i) => (
        <group key={i} position={[0, g.y, 0]} rotation={[0, g.rot, 0]}>
          <mesh position={[0.026, 0, 0]} scale={g.scale} castShadow>
            <sphereGeometry args={[0.03, 7, 7]} />
            <meshStandardMaterial color={tint} roughness={0.5} />
          </mesh>
          <mesh position={[-0.026, 0, 0]} scale={g.scale} castShadow>
            <sphereGeometry args={[0.03, 7, 7]} />
            <meshStandardMaterial color={tint} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.34, 0]}>
        <coneGeometry args={[0.018, 0.07, 5]} />
        <meshStandardMaterial color={tint} roughness={0.55} />
      </mesh>
    </group>
  );
}

function WheatStalk({
  tint,
  x,
  z,
  h,
  lean,
  twist,
}: {
  tint: string;
  x: number;
  z: number;
  h: number;
  lean: number;
  twist: number;
}) {
  const stemH = 0.72 * h;
  return (
    <group position={[x, 0, z]} rotation={[lean * 0.32, twist, lean]}>
      <mesh position={[0, stemH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.02, stemH, 5]} />
        <meshStandardMaterial color="#7ab04a" roughness={0.85} />
      </mesh>
      <mesh
        position={[0.045, stemH * 0.35, 0]}
        rotation={[0.15, 0.2, 0.9]}
        castShadow
      >
        <boxGeometry args={[0.18, 0.01, 0.04]} />
        <meshStandardMaterial color="#5f9a42" roughness={0.9} />
      </mesh>
      <WheatEar tint={tint} y={stemH} />
    </group>
  );
}

function WheatCrop({ tint }: { tint: string }) {
  return (
    <group>
      {WHEAT_STALKS.map((s, i) => (
        <WheatStalk key={i} tint={tint} {...s} />
      ))}
    </group>
  );
}

/** Tall corn with bright yellow ears — Hay Day style */
function CornCrop({ tint }: { tint: string }) {
  return (
    <group>
      {[
        { x: -0.16, z: 0.08 },
        { x: 0.14, z: -0.06 },
        { x: 0.02, z: 0.16 },
      ].map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 1.15, 6]} />
            <meshStandardMaterial color="#3d9a3a" roughness={0.8} />
          </mesh>
          {/* Leaves */}
          <mesh position={[0.1, 0.75, 0]} rotation={[0, 0.2, 0.55]} castShadow>
            <boxGeometry args={[0.32, 0.02, 0.12]} />
            <meshStandardMaterial color="#52b35a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.1, 0.55, 0]} rotation={[0, -0.2, -0.5]} castShadow>
            <boxGeometry args={[0.28, 0.02, 0.1]} />
            <meshStandardMaterial color="#4caf50" roughness={0.9} />
          </mesh>
          <mesh position={[0.08, 0.95, 0.04]} rotation={[0.1, 0, 0.4]} castShadow>
            <boxGeometry args={[0.24, 0.015, 0.09]} />
            <meshStandardMaterial color="#66bb6a" roughness={0.9} />
          </mesh>
          {/* Corn ears */}
          <mesh position={[0.08, 0.65, 0.04]} castShadow>
            <capsuleGeometry args={[0.055, 0.2, 4, 8]} />
            <meshStandardMaterial color={tint} roughness={0.5} />
          </mesh>
          <mesh position={[-0.06, 0.78, -0.03]} castShadow>
            <capsuleGeometry args={[0.05, 0.16, 4, 8]} />
            <meshStandardMaterial color="#f5d060" roughness={0.5} />
          </mesh>
          {/* Silk tops */}
          <mesh position={[0.08, 0.82, 0.04]}>
            <coneGeometry args={[0.03, 0.1, 5]} />
            <meshStandardMaterial color="#c9e86a" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Carrot tops — bushy plumes above soil like the reference */
function CarrotCrop({ tint }: { tint: string }) {
  return (
    <group>
      {[
        [-0.18, 0.12],
        [0.16, 0.08],
        [0.0, -0.14],
        [-0.08, 0.0],
        [0.12, -0.1],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Partially visible orange shoulder */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color={tint} roughness={0.6} />
          </mesh>
          {/* Bushy leafy plume */}
          {[0, 1, 2, 3].map((j) => (
            <mesh
              key={j}
              position={[
                Math.cos(j * 1.6) * 0.04,
                0.22 + (j % 2) * 0.06,
                Math.sin(j * 1.6) * 0.04,
              ]}
              rotation={[0.25, j, 0.2 + j * 0.15]}
              castShadow
            >
              <coneGeometry args={[0.035, 0.32, 5]} />
              <meshStandardMaterial
                color={j % 2 ? "#3d9a45" : "#2e8b3a"}
                roughness={0.85}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Tomatoes on stakes — vertical vines with bright red fruit */
function TomatoCrop({ tint }: { tint: string }) {
  return (
    <group>
      {/* Stake */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 1.1, 6]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.85} />
      </mesh>
      {/* Vine */}
      <mesh position={[0.02, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.95, 6]} />
        <meshStandardMaterial color="#2e7a32" roughness={0.85} />
      </mesh>
      {/* Leaves */}
      {[
        [0.14, 0.4, 0.05, 0.5],
        [-0.12, 0.55, -0.04, -0.55],
        [0.1, 0.75, 0.08, 0.4],
        [-0.08, 0.9, -0.06, -0.35],
      ].map(([x, y, z, rot], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[0.2, 0, rot]}
          castShadow
        >
          <boxGeometry args={[0.2, 0.015, 0.1]} />
          <meshStandardMaterial color="#4caf50" roughness={0.9} />
        </mesh>
      ))}
      {/* Tomatoes */}
      {[
        [0.12, 0.45, 0.06],
        [-0.1, 0.58, -0.05],
        [0.08, 0.72, 0.1],
        [-0.06, 0.88, 0.04],
        [0.02, 0.62, -0.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color={i % 2 ? tint : "#e85545"}
            roughness={0.4}
            emissive={tint}
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function PumpkinCrop({ tint }: { tint: string }) {
  return (
    <group>
      <mesh position={[0, 0.26, 0]} scale={[1.05, 0.78, 1]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={tint} roughness={0.5} />
      </mesh>
      {/* Rib suggestion */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.26, 0.02]} scale={[0.35, 0.78, 1]}>
          <sphereGeometry args={[0.28, 12, 12]} />
          <meshStandardMaterial
            color={i === 1 ? "#f09830" : tint}
            roughness={0.55}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.12, 6]} />
        <meshStandardMaterial color="#3d6b2e" roughness={0.8} />
      </mesh>
      <mesh position={[0.16, 0.2, 0.18]} rotation={[0.5, 0.4, 0.2]} castShadow>
        <torusGeometry args={[0.11, 0.02, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#4f8f45" roughness={0.85} />
      </mesh>
    </group>
  );
}

const CROP_MESH: Record<CropId, (props: { tint: string }) => ReactElement> = {
  wheat: WheatCrop,
  corn: CornCrop,
  carrot: CarrotCrop,
  tomato: TomatoCrop,
  pumpkin: PumpkinCrop,
};

/** Multiple plant instances across a rectangular bed */
function PlantCluster({
  cropId,
  tint,
}: {
  cropId: CropId;
  tint: string;
}) {
  const Mesh = CROP_MESH[cropId];
  const offsets =
    cropId === "pumpkin"
      ? [{ x: 0, z: 0, s: 1 }]
      : cropId === "tomato"
        ? [
            { x: -0.22, z: 0.12, s: 0.85 },
            { x: 0.22, z: -0.1, s: 0.9 },
          ]
        : cropId === "wheat"
          ? [
              { x: -0.22, z: 0.15, s: 0.75 },
              { x: 0.2, z: 0.1, s: 0.8 },
              { x: -0.05, z: -0.18, s: 0.78 },
            ]
          : [
              { x: -0.2, z: 0.12, s: 0.72 },
              { x: 0.18, z: -0.08, s: 0.75 },
            ];

  return (
    <group>
      {offsets.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]} scale={o.s}>
          <Mesh tint={tint} />
        </group>
      ))}
    </group>
  );
}

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
      g.rotation.z = Math.sin(t * 1.35 + swaySeed) * 0.05;
      g.rotation.x = Math.cos(t * 1.05 + swaySeed * 0.7) * 0.025;
      if (stage === "grown") {
        g.position.y = Math.sin(t * 2.1 + swaySeed) * 0.015;
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
        <group>
          {[
            [-0.15, 0.12],
            [0.12, -0.08],
            [0.05, 0.1],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.04, z]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial color="#6b4423" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ) : stage === "sprout" ? (
        <group>
          {[
            [-0.15, 0.1],
            [0.14, -0.06],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.015, 0.02, 0.22, 5]} />
                <meshStandardMaterial color="#4caf50" roughness={0.85} />
              </mesh>
              <mesh position={[0.04, 0.2, 0]} rotation={[0, 0, 0.6]}>
                <boxGeometry args={[0.12, 0.01, 0.05]} />
                <meshStandardMaterial color="#66bb6a" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ) : (
        <PlantCluster cropId={cropId} tint={tint} />
      )}
    </group>
  );
}
