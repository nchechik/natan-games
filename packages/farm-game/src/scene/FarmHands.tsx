"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import type { Group } from "three";
import { plotPosition } from "./PlotBed";

/** Behind-the-field rest spot (umbrella + chairs) */
export const REST_CENTER: [number, number, number] = [0.1, 0, -3.45];

export function waterSeat(index: number): [number, number, number] {
  return [-0.55 - index * 0.58, 0, -3.35];
}

export function harvestSeat(index: number): [number, number, number] {
  return [0.65 + index * 0.58, 0, -3.35];
}

const DROP_COUNT = 6;
const HAND_SCALE = 0.58;

function RestArea({
  waterSeats,
  harvestSeats,
}: {
  waterSeats: number;
  harvestSeats: number;
}) {
  return (
    <group position={REST_CENTER}>
      {/* Pole */}
      <mesh position={[0, 0.85, -0.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.7, 8]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.85} />
      </mesh>
      {/* Umbrella canopy */}
      <mesh position={[0, 1.72, -0.2]} castShadow>
        <coneGeometry args={[1.15, 0.45, 10]} />
        <meshStandardMaterial color="#e85a4a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, -0.2]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.12, 0.12, 10]} />
        <meshStandardMaterial color="#c44538" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.98, -0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#f0c040" roughness={0.5} metalness={0.2} />
      </mesh>

      {Array.from({ length: Math.max(1, waterSeats) }, (_, i) => (
        <Chair
          key={`w-${i}`}
          position={[-0.65 - i * 0.58, 0, 0.2]}
          rotation={Math.PI + 0.12}
        />
      ))}
      {Array.from({ length: Math.max(1, harvestSeats) }, (_, i) => (
        <Chair
          key={`h-${i}`}
          position={[0.55 + i * 0.58, 0, 0.2]}
          rotation={Math.PI - 0.1}
        />
      ))}
    </group>
  );
}

function Chair({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.42, 0.06, 0.4]} />
        <meshStandardMaterial color="#c4a06a" roughness={0.8} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.52, -0.17]} castShadow>
        <boxGeometry args={[0.42, 0.42, 0.06]} />
        <meshStandardMaterial color="#b89058" roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[
        [-0.16, 0.14, 0.14],
        [0.16, 0.14, 0.14],
        [-0.16, 0.14, -0.14],
        [0.16, 0.14, -0.14],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.28, 6]} />
          <meshStandardMaterial color="#8b5e3c" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

type Outfit = {
  pants: string;
  shirt: string;
  hat: string;
  hatBand: string;
};

function MiniFarmerBody({
  outfit,
  sitting,
  armRef,
  tool,
}: {
  outfit: Outfit;
  sitting: boolean;
  armRef?: RefObject<Group | null>;
  tool: "can" | "sickle";
}) {
  const legY = sitting ? 0.22 : 0.28;
  const legH = sitting ? 0.28 : 0.45;
  const torsoY = sitting ? 0.55 : 0.72;
  const headY = sitting ? 1.0 : 1.22;
  const hatY = sitting ? 1.16 : 1.4;

  return (
    <group>
      {/* Legs */}
      <mesh position={[-0.09, legY, sitting ? 0.08 : 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, legH, 8]} />
        <meshStandardMaterial color={outfit.pants} roughness={0.8} />
      </mesh>
      <mesh position={[0.09, legY, sitting ? 0.08 : 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, legH, 8]} />
        <meshStandardMaterial color={outfit.pants} roughness={0.8} />
      </mesh>
      {!sitting && (
        <>
          <mesh position={[-0.09, 0.055, 0.04]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.2]} />
            <meshStandardMaterial color="#4a3020" roughness={0.85} />
          </mesh>
          <mesh position={[0.09, 0.055, 0.04]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.2]} />
            <meshStandardMaterial color="#4a3020" roughness={0.85} />
          </mesh>
        </>
      )}
      {/* Torso */}
      <mesh position={[0, torsoY, 0]} castShadow>
        <boxGeometry args={[0.38, 0.42, 0.26]} />
        <meshStandardMaterial color={outfit.shirt} roughness={0.75} />
      </mesh>
      {/* Left arm */}
      <mesh
        position={[-0.26, torsoY + 0.05, 0]}
        rotation={[sitting ? 0.6 : 0, 0, sitting ? 0.15 : 0.35]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.06, 0.34, 8]} />
        <meshStandardMaterial color="#e8b896" roughness={0.7} />
      </mesh>
      {/* Right arm + tool */}
      <group
        ref={armRef}
        position={[0.24, torsoY + 0.12, 0.06]}
        rotation={sitting ? [0.5, 0, -0.2] : [0, 0, 0]}
      >
        <mesh rotation={[0.1, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.36, 8]} />
          <meshStandardMaterial color="#e8b896" roughness={0.7} />
        </mesh>
        {tool === "can" ? (
          <group position={[0.18, -0.04, 0.1]} scale={0.75}>
            <mesh castShadow>
              <cylinderGeometry args={[0.09, 0.11, 0.16, 10]} />
              <meshStandardMaterial
                color="#3a8fd4"
                roughness={0.45}
                metalness={0.25}
              />
            </mesh>
            <mesh position={[0.12, 0.02, 0]} rotation={[0, 0, -0.55]} castShadow>
              <cylinderGeometry args={[0.018, 0.028, 0.14, 8]} />
              <meshStandardMaterial
                color="#4aa3e0"
                roughness={0.4}
                metalness={0.25}
              />
            </mesh>
          </group>
        ) : (
          <group position={[0.16, -0.08, 0.08]} rotation={[0.2, 0.4, -0.8]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.025, 0.55, 6]} />
              <meshStandardMaterial color="#6b4423" roughness={0.85} />
            </mesh>
            <mesh position={[0.02, -0.22, 0.05]} rotation={[0.3, 0, 0.4]} castShadow>
              <boxGeometry args={[0.22, 0.03, 0.08]} />
              <meshStandardMaterial
                color="#c0c8d0"
                roughness={0.35}
                metalness={0.55}
              />
            </mesh>
          </group>
        )}
      </group>
      {/* Head */}
      <mesh position={[0, headY, 0]} castShadow>
        <sphereGeometry args={[0.19, 12, 12]} />
        <meshStandardMaterial color="#f0c8a8" roughness={0.65} />
      </mesh>
      <mesh position={[-0.06, headY + 0.04, 0.16]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
      </mesh>
      <mesh position={[0.06, headY + 0.04, 0.16]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, hatY, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.15, 12]} />
        <meshStandardMaterial color={outfit.hat} roughness={0.8} />
      </mesh>
      <mesh position={[0, hatY - 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 16]} />
        <meshStandardMaterial color={outfit.hat} roughness={0.85} />
      </mesh>
      <mesh position={[0, hatY - 0.05, 0]}>
        <torusGeometry args={[0.25, 0.02, 6, 14]} />
        <meshStandardMaterial color={outfit.hatBand} roughness={0.7} />
      </mesh>
    </group>
  );
}

const WATER_OUTFIT: Outfit = {
  pants: "#3b6ea5",
  shirt: "#d6453d",
  hat: "#e8c86a",
  hatBand: "#c45c4a",
};

const HARVEST_OUTFIT: Outfit = {
  pants: "#3d8b4a",
  shirt: "#f0a020",
  hat: "#6b8f3a",
  hatBand: "#2f5a28",
};

/** Watering farmhand — left side of plot while working, rests under umbrella */
export function WateringWorker({
  plotIndex,
  watering,
  seatIndex,
}: {
  plotIndex: number | null;
  watering: boolean;
  seatIndex: number;
}) {
  const working = watering && plotIndex != null;
  const seat = waterSeat(seatIndex);
  const target = working
    ? (() => {
        const [x, , z] = plotPosition(plotIndex!);
        return [x - 0.88, 0, z + 0.05] as [number, number, number];
      })()
    : seat;

  const { posX, posZ, sit } = useSpring({
    posX: target[0],
    posZ: target[2],
    sit: working ? 0 : 1,
    config: { tension: 110, friction: 20 },
  });

  const armRef = useRef<Group>(null);
  const dropsRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (armRef.current) {
      armRef.current.rotation.z = working
        ? -0.9 + Math.sin(t * 4.5) * 0.14
        : -0.15 + Math.sin(t * 1.2) * 0.05;
    }
    if (dropsRef.current) {
      dropsRef.current.visible = working;
      if (!working) return;
      dropsRef.current.children.forEach((child, i) => {
        const phase = (t * 2.2 + i * 0.33) % 1;
        child.position.set(
          0.38 + (i % 3) * 0.03 - phase * 0.05,
          0.85 - phase * 0.65,
          0.1 + ((i % 5) - 2) * 0.035,
        );
        child.scale.setScalar(Math.max(0.1, (1 - phase) * 0.85));
        child.visible = phase < 0.9;
      });
    }
  });

  return (
    <a.group position-x={posX} position-y={0} position-z={posZ} scale={HAND_SCALE}>
      <group rotation={[0, working ? 0.85 : Math.PI - 0.15, 0]}>
        <a.group position-y={sit.to((v) => v * 0.12)}>
          <MiniFarmerBody
            outfit={WATER_OUTFIT}
            sitting={!working}
            armRef={armRef}
            tool="can"
          />
        </a.group>
        <group ref={dropsRef}>
          {Array.from({ length: DROP_COUNT }, (_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.028, 6, 6]} />
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

/** Harvesting farmhand — right side of plot while working, rests under umbrella */
export function HarvestingWorker({
  plotIndex,
  harvesting,
  seatIndex,
}: {
  plotIndex: number | null;
  harvesting: boolean;
  seatIndex: number;
}) {
  const working = harvesting && plotIndex != null;
  const seat = harvestSeat(seatIndex);
  const target = working
    ? (() => {
        const [x, , z] = plotPosition(plotIndex!);
        return [x + 0.88, 0, z + 0.05] as [number, number, number];
      })()
    : seat;

  const { posX, posZ } = useSpring({
    posX: target[0],
    posZ: target[2],
    config: { tension: 110, friction: 20 },
  });

  const armRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!armRef.current) return;
    if (working) {
      armRef.current.rotation.x = Math.sin(t * 7) * 0.55;
      armRef.current.rotation.z = -0.35 + Math.sin(t * 7) * 0.25;
    } else {
      armRef.current.rotation.x *= 0.9;
      armRef.current.rotation.z = -0.15;
    }
  });

  return (
    <a.group position-x={posX} position-y={0} position-z={posZ} scale={HAND_SCALE}>
      <group rotation={[0, working ? -0.85 : Math.PI + 0.2, 0]}>
        <group position={[0, working ? 0 : 0.12, 0]}>
          <MiniFarmerBody
            outfit={HARVEST_OUTFIT}
            sitting={!working}
            armRef={armRef}
            tool="sickle"
          />
        </group>
      </group>
    </a.group>
  );
}

export function FarmHands({
  waterWorkers,
  harvestWorkers,
  wateringPlotIndexes,
  harvestingPlotIndexes,
}: {
  waterWorkers: number;
  harvestWorkers: number;
  wateringPlotIndexes: (number | null)[];
  harvestingPlotIndexes: (number | null)[];
}) {
  if (waterWorkers <= 0 && harvestWorkers <= 0) return null;

  return (
    <group>
      <RestArea waterSeats={waterWorkers} harvestSeats={harvestWorkers} />
      {Array.from({ length: waterWorkers }, (_, i) => (
        <WateringWorker
          key={`water-${i}`}
          seatIndex={i}
          plotIndex={wateringPlotIndexes[i] ?? null}
          watering={wateringPlotIndexes[i] != null}
        />
      ))}
      {Array.from({ length: harvestWorkers }, (_, i) => (
        <HarvestingWorker
          key={`harvest-${i}`}
          seatIndex={i}
          plotIndex={harvestingPlotIndexes[i] ?? null}
          harvesting={harvestingPlotIndexes[i] != null}
        />
      ))}
    </group>
  );
}
