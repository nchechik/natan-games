"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group, type Mesh } from "three";

/** Classic red gambrel barn with hayloft, open doors, and hay bales */
export function Barn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.1, 2.4]} />
        <meshStandardMaterial color="#d6453d" roughness={0.78} />
      </mesh>
      {/* White corner trim */}
      {[
        [-1.55, 1.05, 1.15],
        [1.55, 1.05, 1.15],
        [-1.55, 1.05, -1.15],
        [1.55, 1.05, -1.15],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.12, 2.1, 0.12]} />
          <meshStandardMaterial color="#f7f3ea" roughness={0.65} />
        </mesh>
      ))}
      {/* Front white base trim */}
      <mesh position={[0, 0.08, 1.22]} castShadow>
        <boxGeometry args={[3.25, 0.16, 0.08]} />
        <meshStandardMaterial color="#f7f3ea" roughness={0.65} />
      </mesh>
      {/* Gambrel-ish roof (two slopes) */}
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0.38]} castShadow>
        <boxGeometry args={[2.0, 0.14, 2.55]} />
        <meshStandardMaterial color="#6b3a28" roughness={0.72} />
      </mesh>
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, -0.38]} castShadow>
        <boxGeometry args={[2.0, 0.14, 2.55]} />
        <meshStandardMaterial color="#5a3020" roughness={0.72} />
      </mesh>
      {/* Roof ridge cap */}
      <mesh position={[0, 2.72, 0]} castShadow>
        <boxGeometry args={[0.35, 0.12, 2.6]} />
        <meshStandardMaterial color="#4a2818" roughness={0.7} />
      </mesh>
      {/* Hayloft window frame */}
      <mesh position={[0, 2.05, 1.22]} castShadow>
        <boxGeometry args={[0.7, 0.55, 0.08]} />
        <meshStandardMaterial color="#f7f3ea" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.05, 1.26]}>
        <boxGeometry args={[0.48, 0.38, 0.04]} />
        <meshStandardMaterial color="#3d2418" roughness={0.9} />
      </mesh>
      {/* Open barn doors */}
      <mesh position={[-0.95, 0.75, 1.28]} rotation={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.7, 1.4, 0.08]} />
        <meshStandardMaterial color="#8b4a38" roughness={0.8} />
      </mesh>
      <mesh position={[0.95, 0.75, 1.28]} rotation={[0, -0.55, 0]} castShadow>
        <boxGeometry args={[0.7, 1.4, 0.08]} />
        <meshStandardMaterial color="#7a3f30" roughness={0.8} />
      </mesh>
      {/* Dark doorway interior */}
      <mesh position={[0, 0.7, 1.1]}>
        <boxGeometry args={[1.1, 1.35, 0.1]} />
        <meshStandardMaterial color="#3a2218" roughness={1} />
      </mesh>
      {/* Hay bales inside */}
      <mesh position={[-0.25, 0.35, 0.55]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.4]} />
        <meshStandardMaterial color="#e8c86a" roughness={0.85} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.4]} castShadow>
        <boxGeometry args={[0.5, 0.38, 0.38]} />
        <meshStandardMaterial color="#d4b45a" roughness={0.85} />
      </mesh>
      <mesh position={[0.05, 0.72, 0.5]} castShadow>
        <boxGeometry args={[0.48, 0.35, 0.35]} />
        <meshStandardMaterial color="#f0d478" roughness={0.85} />
      </mesh>
      {/* Side window */}
      <mesh position={[1.62, 1.2, 0]} castShadow>
        <boxGeometry args={[0.06, 0.45, 0.55]} />
        <meshStandardMaterial color="#f7f3ea" roughness={0.6} />
      </mesh>
      <mesh position={[1.66, 1.2, 0]}>
        <boxGeometry args={[0.04, 0.32, 0.4]} />
        <meshStandardMaterial color="#7ec8e8" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

/** Round chibi-style spotted cow */
export function Cow({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 1.6) * 0.015;
    ref.current.rotation.y =
      -0.35 + Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
  });

  return (
    <group ref={ref} position={position} scale={1.05}>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} scale={[1.15, 0.95, 0.85]} castShadow>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color="#f7f4ef" roughness={0.75} />
      </mesh>
      {/* Spots */}
      <mesh position={[0.22, 0.62, 0.28]} castShadow>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.25, 0.48, 0.22]} castShadow>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0.05, 0.7, -0.25]} castShadow>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0.42, 0.72, 0.12]} castShadow>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial color="#f7f4ef" roughness={0.75} />
      </mesh>
      {/* Snout */}
      <mesh position={[0.62, 0.62, 0.18]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#f4a7b8" roughness={0.65} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[0.72, 0.64, 0.12]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#c47888" roughness={0.7} />
      </mesh>
      <mesh position={[0.7, 0.64, 0.24]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#c47888" roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.55, 0.82, 0.28]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      <mesh position={[0.58, 0.82, 0.02]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      <mesh position={[0.58, 0.84, 0.3]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.35, 0.92, 0.32]} rotation={[0.3, 0, 0.4]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f7f4ef" roughness={0.75} />
      </mesh>
      <mesh position={[0.35, 0.92, -0.08]} rotation={[-0.3, 0, 0.4]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.75} />
      </mesh>
      {/* Legs */}
      {[
        [0.22, 0.18, 0.22],
        [0.22, 0.18, -0.18],
        [-0.28, 0.18, 0.2],
        [-0.28, 0.18, -0.16],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.35, 8]} />
          <meshStandardMaterial color="#1f1f1f" roughness={0.85} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-0.48, 0.55, 0]} rotation={[0, 0, 0.8]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.35, 6]} />
        <meshStandardMaterial color="#f7f4ef" roughness={0.75} />
      </mesh>
      <mesh position={[-0.62, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Cartoon farmer with straw hat, red shirt, overalls, and rake */
export function Farmer({ position }: { position: [number, number, number] }) {
  const arm = useRef<Group>(null);
  useFrame((state) => {
    if (!arm.current) return;
    arm.current.rotation.z =
      -0.4 + Math.sin(state.clock.elapsedTime * 1.2) * 0.12;
  });

  return (
    <group position={position} scale={0.95}>
      {/* Legs / overalls bottom */}
      <mesh position={[-0.1, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.45, 8]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.45, 8]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.8} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.1, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#4a3020" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#4a3020" roughness={0.85} />
      </mesh>
      {/* Torso overalls */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.42, 0.5, 0.28]} />
        <meshStandardMaterial color="#4a82ba" roughness={0.75} />
      </mesh>
      {/* Red shirt sleeves / shoulders */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.48, 0.22, 0.3]} />
        <meshStandardMaterial color="#d6453d" roughness={0.7} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.32, 0.78, 0]} rotation={[0, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.4, 8]} />
        <meshStandardMaterial color="#e8b896" roughness={0.7} />
      </mesh>
      <group ref={arm} position={[0.28, 0.88, 0.05]}>
        <mesh rotation={[0.2, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.42, 8]} />
          <meshStandardMaterial color="#e8b896" roughness={0.7} />
        </mesh>
        {/* Rake handle */}
        <mesh position={[0.15, -0.15, 0.25]} rotation={[0.6, 0.2, -0.3]} castShadow>
          <cylinderGeometry args={[0.025, 0.03, 1.15, 6]} />
          <meshStandardMaterial color="#8b5e3c" roughness={0.85} />
        </mesh>
        {/* Rake head */}
        <mesh position={[0.38, -0.55, 0.55]} rotation={[0.6, 0.2, -0.3]} castShadow>
          <boxGeometry args={[0.28, 0.04, 0.08]} />
          <meshStandardMaterial color="#6b4423" roughness={0.8} />
        </mesh>
        {[-0.1, 0, 0.1].map((ox, i) => (
          <mesh
            key={i}
            position={[0.38 + ox * 0.3, -0.62, 0.58]}
            rotation={[0.6, 0.2, -0.3]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.01, 0.14, 4]} />
            <meshStandardMaterial color="#5a3a20" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Head */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color="#f0c8a8" roughness={0.65} />
      </mesh>
      {/* Mustache */}
      <mesh position={[0, 1.14, 0.18]} scale={[1.4, 0.45, 0.6]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.07, 1.26, 0.18]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
      </mesh>
      <mesh position={[0.07, 1.26, 0.18]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
      </mesh>
      {/* Straw hat */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.18, 12]} />
        <meshStandardMaterial color="#e8c86a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.32, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 16]} />
        <meshStandardMaterial color="#d4b45a" roughness={0.85} />
      </mesh>
      {/* Hat band */}
      <mesh position={[0, 1.34, 0]}>
        <torusGeometry args={[0.29, 0.025, 6, 16]} />
        <meshStandardMaterial color="#c45c4a" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function WoodenCrate({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.55, 0.55]} />
        <meshStandardMaterial color="#b8884a" roughness={0.85} />
      </mesh>
      {/* Lid edges */}
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[0.74, 0.06, 0.58]} />
        <meshStandardMaterial color="#9a7038" roughness={0.8} />
      </mesh>
      {/* Vertical slat lines */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.28, 0.28]}>
          <boxGeometry args={[0.04, 0.5, 0.02]} />
          <meshStandardMaterial color="#8b5e3c" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export function GrainSack({
  position,
  color = "#e8d5a8",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} scale={[1, 1.15, 0.85]} castShadow>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.12, 8]} />
        <meshStandardMaterial color="#c4a574" roughness={0.85} />
      </mesh>
      {/* Overflow grains */}
      <mesh position={[0.08, 0.58, 0.05]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#e8c86a" roughness={0.7} />
      </mesh>
      <mesh position={[-0.05, 0.6, -0.04]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#d4b45a" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.65 + position[0]) * 0.025;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.35, 7]} />
        <meshStandardMaterial color="#7a4a28" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.72, 12, 12]} />
        <meshStandardMaterial color="#3d9a45" roughness={0.85} />
      </mesh>
      <mesh position={[0.35, 1.95, 0.15]} castShadow>
        <sphereGeometry args={[0.48, 10, 10]} />
        <meshStandardMaterial color="#52b35a" roughness={0.85} />
      </mesh>
      <mesh position={[-0.3, 1.85, -0.2]} castShadow>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#2f8a38" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function FenceSegment({
  position,
  rotation = 0,
  length = 2,
}: {
  position: [number, number, number];
  rotation?: number;
  length?: number;
}) {
  const posts = Math.max(2, Math.round(length));
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: posts }, (_, i) => {
        const x = -length / 2 + (i / (posts - 1)) * length;
        return (
          <mesh key={i} position={[x, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.7, 6]} />
            <meshStandardMaterial color="#a07040" roughness={0.85} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[length + 0.1, 0.07, 0.05]} />
        <meshStandardMaterial color="#b8884a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[length + 0.1, 0.07, 0.05]} />
        <meshStandardMaterial color="#9a7038" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Stone-lined dirt path ribbon */
export function DirtPath({
  points,
  width = 1.1,
}: {
  points: [number, number, number][];
  width?: number;
}) {
  return (
    <group>
      {points.map((p, i) => {
        const next = points[i + 1];
        if (!next) {
          return (
            <group key={i}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[p[0], 0.015, p[2]]}
                receiveShadow
              >
                <circleGeometry args={[width * 0.55, 16]} />
                <meshStandardMaterial color="#c9a06a" roughness={1} />
              </mesh>
              {Array.from({ length: 6 }, (_, s) => {
                const a = (s / 6) * Math.PI * 2;
                return (
                  <mesh
                    key={s}
                    position={[
                      p[0] + Math.cos(a) * width * 0.55,
                      0.04,
                      p[2] + Math.sin(a) * width * 0.55,
                    ]}
                    castShadow
                  >
                    <sphereGeometry args={[0.07 + (s % 3) * 0.015, 6, 6]} />
                    <meshStandardMaterial
                      color={s % 2 ? "#9a9a9a" : "#b0b0b0"}
                      roughness={0.95}
                    />
                  </mesh>
                );
              })}
            </group>
          );
        }
        const dx = next[0] - p[0];
        const dz = next[2] - p[2];
        const len = Math.hypot(dx, dz);
        const mid: [number, number, number] = [
          (p[0] + next[0]) / 2,
          0.012,
          (p[2] + next[2]) / 2,
        ];
        const angle = Math.atan2(dx, dz);
        return (
          <group key={i}>
            <mesh
              position={mid}
              rotation={[-Math.PI / 2, 0, -angle]}
              receiveShadow
            >
              <planeGeometry args={[width, len + 0.15]} />
              <meshStandardMaterial color="#c9a06a" roughness={1} side={DoubleSide} />
            </mesh>
            {/* Side stones */}
            {Array.from({ length: Math.ceil(len * 2.2) }, (_, s) => {
              const t = (s + 0.5) / Math.ceil(len * 2.2);
              const bx = p[0] + dx * t;
              const bz = p[2] + dz * t;
              const nx = -dz / len;
              const nz = dx / len;
              const side = s % 2 === 0 ? 1 : -1;
              return (
                <mesh
                  key={s}
                  position={[
                    bx + nx * side * (width * 0.52),
                    0.04,
                    bz + nz * side * (width * 0.52),
                  ]}
                  castShadow
                >
                  <sphereGeometry
                    args={[0.06 + (s % 3) * 0.012, 6, 6]}
                  />
                  <meshStandardMaterial
                    color={s % 2 ? "#8e8e8e" : "#b5b5b5"}
                    roughness={0.95}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

export function FlowerPatch({
  position,
  color = "#f0a0c0",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[
            Math.cos(i * 2.1) * 0.15,
            0,
            Math.sin(i * 2.1) * 0.15,
          ]}
        >
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.22, 5]} />
            <meshStandardMaterial color="#3d9a45" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Butterfly({ seed }: { seed: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + seed;
    ref.current.position.x = Math.sin(t * 0.35 + seed) * 4.5;
    ref.current.position.z = Math.cos(t * 0.3 + seed) * 3.2 - 0.5;
    ref.current.position.y = 1.35 + Math.sin(t * 2.1) * 0.4;
    ref.current.rotation.y = t * 0.45;
    const flap = Math.sin(t * 14) * 0.65;
    const left = ref.current.children[0] as Mesh | undefined;
    const right = ref.current.children[1] as Mesh | undefined;
    if (left) left.rotation.y = flap;
    if (right) right.rotation.y = -flap;
  });
  return (
    <group ref={ref}>
      <mesh position={[-0.09, 0, 0]}>
        <planeGeometry args={[0.18, 0.12]} />
        <meshStandardMaterial
          color="#ff9a40"
          side={DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh position={[0.09, 0, 0]}>
        <planeGeometry args={[0.18, 0.12]} />
        <meshStandardMaterial
          color="#ff7040"
          side={DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  );
}

export function Windmill({ position }: { position: [number, number, number] }) {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (blades.current) blades.current.rotation.z += delta * 0.7;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.42, 2.7, 8]} />
        <meshStandardMaterial color="#f0e6d0" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[0.48, 0.55, 8]} />
        <meshStandardMaterial color="#c45c4a" roughness={0.7} />
      </mesh>
      <group ref={blades} position={[0, 2.15, 0.35]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            rotation={[0, 0, (i * Math.PI) / 2]}
            position={[0, 0.65, 0]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.25, 0.05]} />
            <meshStandardMaterial color="#fff8e8" roughness={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
