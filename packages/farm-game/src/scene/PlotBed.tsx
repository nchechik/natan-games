"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import type { Mesh, MeshStandardMaterial } from "three";
import { formatDuration } from "@natan-games/game-core";
import {
  CROPS,
  getGrowthProgress,
  getGrowthStage,
  remainingGrowMs,
  type PlotState,
} from "../types";
import { CropPlant } from "./CropPlant";

const COLS = 4;
const SPACING = 1.55;

export function plotPosition(index: number): [number, number, number] {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = (col - (COLS - 1) / 2) * SPACING;
  const z = (row - 1) * SPACING;
  return [x, 0, z];
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
  const left = remainingGrowMs(plot, now);
  const ready = stage === "grown";

  const { posY, scale } = useSpring({
    posY: hovered && plot.unlocked ? 0.1 : 0,
    scale: pressed ? 0.9 : hovered ? 1.06 : 1,
    config: { tension: 380, friction: 14 },
  });

  useFrame((state) => {
    const mat = soilRef.current?.material as MeshStandardMaterial | undefined;
    if (!mat) return;
    if (ready) {
      mat.emissiveIntensity =
        0.25 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.12;
    } else {
      mat.emissiveIntensity = hovered ? 0.1 : 0;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 140);
    if (!plot.unlocked) onUnlock();
    else onTap();
  };

  const label = !plot.unlocked
    ? `Expand · ${unlockCost}`
    : crop
      ? ready
        ? `Ready · ${crop.name}`
        : `${crop.name} · ${formatDuration(left)}`
      : "Empty soil";

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
      <mesh ref={soilRef} position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.22, 8]} />
        <meshStandardMaterial
          color={plot.unlocked ? "#7a4a28" : "#5a4638"}
          roughness={0.95}
          emissive={ready ? "#5fa85a" : hovered ? "#c4a574" : "#000000"}
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.68, 0.72, 0.08, 8]} />
        <meshStandardMaterial
          color={plot.unlocked ? "#4f8f45" : "#3d5c38"}
          roughness={1}
        />
      </mesh>

      {plot.unlocked && plot.cropId && (
        <group position={[0, 0.18, 0]}>
          <CropPlant cropId={plot.cropId} stage={stage} swaySeed={index * 1.7} />
        </group>
      )}

      {plot.unlocked && stage !== "empty" && stage !== "grown" && (
        <group position={[0, 0.05, 0.52]}>
          <mesh>
            <boxGeometry args={[0.7, 0.06, 0.08]} />
            <meshStandardMaterial color="#1f2a1c" transparent opacity={0.55} />
          </mesh>
          <mesh
            position={[-0.35 * (1 - progress), 0.01, 0]}
            scale={[Math.max(0.02, progress), 1, 1]}
          >
            <boxGeometry args={[0.7, 0.04, 0.05]} />
            <meshStandardMaterial color={crop?.tint ?? "#8fd16a"} />
          </mesh>
        </group>
      )}

      {!plot.unlocked && (
        <mesh position={[0, 0.35, 0]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color="#e8d4a8"
            emissive="#c4a574"
            emissiveIntensity={hovered ? 0.4 : 0.15}
            roughness={0.4}
          />
        </mesh>
      )}

      <Text
        position={[0, 1.15, 0]}
        fontSize={0.16}
        color="#23401f"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#fff8e0"
      >
        {label}
      </Text>
    </a.group>
  );
}
