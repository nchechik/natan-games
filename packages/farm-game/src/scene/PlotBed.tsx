"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import {
  CROPS,
  getGrowthProgress,
  getGrowthStage,
  type PlotState,
} from "../types";
import { CropPlant } from "./CropPlant";

const COLS = 4;
const SPACING_X = 1.7;
const SPACING_Z = 1.55;
const BED_W = 1.35;
const BED_D = 1.15;

export function plotPosition(index: number): [number, number, number] {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = (col - (COLS - 1) / 2) * SPACING_X;
  const z = (row - 1) * SPACING_Z + 0.15;
  return [x, 0, z];
}

function SeedIcon({ tint = "#c4a06a" }: { tint?: string }) {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={tint} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]} scale={[0.72, 1.15, 0.72]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#8b6914" roughness={0.65} />
      </mesh>
    </group>
  );
}

function HarvestIcon({ tint }: { tint: string }) {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial
          color="#fff4c2"
          emissive="#e8b84a"
          emissiveIntensity={0.55}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function GrowthBar({
  progress,
  tint,
}: {
  progress: number;
  tint: string;
}) {
  const fill = Math.max(0.04, Math.min(1, progress));
  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false}>
      <group>
        <mesh>
          <planeGeometry args={[0.72, 0.14]} />
          <meshStandardMaterial
            color="#1f2a1c"
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[-0.36 * (1 - fill), 0, 0.01]} scale={[fill, 1, 1]}>
          <planeGeometry args={[0.66, 0.08]} />
          <meshStandardMaterial color={tint} depthWrite={false} />
        </mesh>
      </group>
    </Billboard>
  );
}

function PlotMarker({
  stage,
  progress,
  cropTint,
  unlocked,
  hovered,
}: {
  stage: ReturnType<typeof getGrowthStage>;
  progress: number;
  cropTint: string | null;
  unlocked: boolean;
  hovered: boolean;
}) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 2.4) * 0.03;
    if (stage === "empty") group.current.position.y = 1.05 + bob;
    else if (stage === "grown") group.current.position.y = 1.25 + bob;
  });

  if (!unlocked) {
    return (
      <mesh position={[0, 0.4, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#e8d4a8"
          emissive="#c4a574"
          emissiveIntensity={hovered ? 0.45 : 0.18}
          roughness={0.4}
        />
      </mesh>
    );
  }

  if (stage === "empty") {
    return (
      <group ref={group} position={[0, 1.05, 0]}>
        <Billboard>
          <SeedIcon tint="#c4a06a" />
        </Billboard>
      </group>
    );
  }

  if (stage === "grown") {
    return (
      <group ref={group} position={[0, 1.25, 0]}>
        <Billboard>
          <HarvestIcon tint={cropTint ?? "#8fd16a"} />
        </Billboard>
      </group>
    );
  }

  return (
    <group position={[0, 1.2, 0]}>
      <GrowthBar progress={progress} tint={cropTint ?? "#8fd16a"} />
    </group>
  );
}

function buildStoneBorder() {
  const hw = BED_W / 2 + 0.08;
  const hd = BED_D / 2 + 0.08;
  const list: {
    x: number;
    z: number;
    sx: number;
    sy: number;
    sz: number;
    color: string;
  }[] = [];
  const edge = (count: number, axis: "x" | "z", fixed: number, sign: number) => {
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const along = (t - 0.5) * (axis === "x" ? BED_W : BED_D) * 1.05;
      list.push({
        x: axis === "x" ? along : fixed * sign,
        z: axis === "z" ? along : fixed * sign,
        sx: 0.85 + (i % 3) * 0.15,
        sy: 0.7 + (i % 2) * 0.2,
        sz: 0.9 + (i % 3) * 0.1,
        color: i % 2 ? "#9a9a9a" : "#b8b8b8",
      });
    }
  };
  edge(5, "x", hd, 1);
  edge(5, "x", hd, -1);
  edge(4, "z", hw, 1);
  edge(4, "z", hw, -1);
  return list;
}

const STONE_BORDER = buildStoneBorder();

function StoneBorder() {
  return (
    <group>
      {STONE_BORDER.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, 0.06, s.z]}
          scale={[s.sx, s.sy, s.sz]}
          castShadow
        >
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={s.color} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export function PlotBed({
  plot,
  index,
  now,
  unlockCost,
  onTap,
  onUnlock,
}: {
  plot: PlotState;
  index: number;
  now: number;
  unlockCost: number;
  onTap: () => void;
  onUnlock: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const soilRef = useRef<Mesh>(null);
  const [x, , z] = plotPosition(index);
  const stage = getGrowthStage(plot, now);
  const progress = getGrowthProgress(plot, now);
  const crop = plot.cropId ? CROPS[plot.cropId] : null;
  const ready = stage === "grown";

  const { posY, scale } = useSpring({
    posY: hovered && plot.unlocked ? 0.08 : 0,
    scale: pressed ? 0.92 : hovered ? 1.04 : 1,
    config: { tension: 380, friction: 14 },
  });

  useFrame((state) => {
    const mat = soilRef.current?.material as MeshStandardMaterial | undefined;
    if (!mat) return;
    if (ready) {
      mat.emissiveIntensity =
        0.22 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.1;
    } else {
      mat.emissiveIntensity = hovered ? 0.08 : 0;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 140);
    if (!plot.unlocked) onUnlock();
    else onTap();
  };

  const aria =
    !plot.unlocked
      ? `Unlock plot for ${unlockCost} coins`
      : crop
        ? ready
          ? `Harvest ${crop.name}`
          : `${crop.name} growing`
        : "Empty plot — plant seeds";

  return (
    <a.group
      position-x={x}
      position-y={posY}
      position-z={z}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {hovered && (
        <Html position={[0, 1.6, 0]} center style={{ pointerEvents: "none" }}>
          <div className="fg-plot-tip">{aria}</div>
        </Html>
      )}

      {/* Grass under-bed */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[BED_W + 0.35, 0.04, BED_D + 0.35]} />
        <meshStandardMaterial
          color={plot.unlocked ? "#3d9a45" : "#2f6b35"}
          roughness={1}
        />
      </mesh>

      {/* Rectangular tilled soil */}
      <mesh ref={soilRef} position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[BED_W, 0.18, BED_D]} />
        <meshStandardMaterial
          color={plot.unlocked ? "#7a4a28" : "#5a4638"}
          roughness={0.95}
          emissive={ready ? "#5fa85a" : hovered ? "#c4a574" : "#000000"}
          emissiveIntensity={0}
        />
      </mesh>
      {/* Furrow lines */}
      {plot.unlocked &&
        [-0.28, 0, 0.28].map((fz, i) => (
          <mesh key={i} position={[0, 0.195, fz]} receiveShadow>
            <boxGeometry args={[BED_W * 0.92, 0.02, 0.12]} />
            <meshStandardMaterial color="#6b3f22" roughness={1} />
          </mesh>
        ))}

      {plot.unlocked && <StoneBorder />}

      {plot.unlocked && plot.cropId && (
        <group position={[0, 0.2, 0]}>
          <CropPlant cropId={plot.cropId} stage={stage} swaySeed={index * 1.7} />
        </group>
      )}

      <PlotMarker
        stage={stage}
        progress={progress}
        cropTint={crop?.tint ?? null}
        unlocked={plot.unlocked}
        hovered={hovered}
      />
    </a.group>
  );
}
