"use client";

import { useMemo } from "react";
import { Cloud, Sky } from "@react-three/drei";
import {
  Barn,
  Butterfly,
  Cow,
  DirtPath,
  Farmer,
  FenceSegment,
  FlowerPatch,
  GrainSack,
  Tree,
  Windmill,
  WoodenCrate,
} from "./FarmProps";

export function FarmWorld({ hasWorker = false }: { hasWorker?: boolean }) {
  const grassTufts = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        x: ((i * 53) % 19) - 9,
        z: ((i * 37) % 17) - 8,
        s: 0.22 + (i % 6) * 0.06,
        color: i % 3 === 0 ? "#4caf50" : i % 3 === 1 ? "#66bb6a" : "#2e8b3a",
      })).filter((g) => Math.hypot(g.x, g.z) > 3.2),
    [],
  );

  const pathPoints: [number, number, number][] = [
    [-5.2, 0, -3.2],
    [-3.8, 0, -1.8],
    [-2.2, 0, -0.2],
    [-0.4, 0, 1.0],
    [1.6, 0, 2.2],
    [3.4, 0, 3.4],
    [5.0, 0, 4.2],
  ];

  return (
    <>
      <Sky
        sunPosition={[10, 14, 5]}
        turbidity={3.2}
        rayleigh={0.95}
        mieCoefficient={0.008}
        mieDirectionalG={0.85}
      />
      <ambientLight intensity={0.62} />
      <directionalLight
        castShadow
        position={[9, 16, 7]}
        intensity={1.55}
        shadow-mapSize={[1536, 1536]}
        shadow-camera-far={45}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        color="#fff5e0"
      />
      <hemisphereLight args={["#9fd8f0", "#5cb85c", 0.42]} />
      <pointLight position={[-4, 3, 2]} intensity={0.25} color="#ffe8a0" />

      {/* Lush grass meadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#4caf50" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[10.5, 48]} />
        <meshStandardMaterial color="#57b85f" roughness={0.98} />
      </mesh>
      {/* Inner field lawn under plots */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.2]} receiveShadow>
        <planeGeometry args={[7.2, 5.8]} />
        <meshStandardMaterial color="#4a9e52" roughness={0.95} />
      </mesh>

      {grassTufts.map((g, i) => (
        <mesh key={i} position={[g.x, g.s / 2, g.z]} castShadow>
          <coneGeometry args={[0.055, g.s, 5]} />
          <meshStandardMaterial color={g.color} roughness={1} />
        </mesh>
      ))}

      <DirtPath points={pathPoints} width={1.15} />

      {/* Side path near barn */}
      <DirtPath
        points={[
          [-6.2, 0, -2.5],
          [-5.4, 0, -1.2],
          [-4.6, 0, 0.4],
        ]}
        width={0.85}
      />

      <Barn position={[-6.8, 0, -4.8]} />
      <Cow position={[-4.6, 0, -3.6]} />
      {/* Decorative idle farmer — hidden once a hired worker is on the farm */}
      {!hasWorker && <Farmer position={[-2.8, 0, 3.6]} />}

      <WoodenCrate position={[-5.1, 0, -5.6]} />
      <WoodenCrate position={[-4.4, 0, -5.3]} scale={0.85} />
      <GrainSack position={[-5.5, 0, -5.0]} color="#e8d5a8" />
      <GrainSack position={[-5.0, 0, -4.7]} color="#dcc89a" />
      <GrainSack position={[-5.35, 0, -4.55]} color="#f0e0b8" />

      <Windmill position={[7.2, 0, -4.2]} />

      <Tree position={[-8.2, 0, 1.2]} scale={1.1} />
      <Tree position={[-7.0, 0, 4.0]} scale={0.9} />
      <Tree position={[6.5, 0, 4.8]} scale={1.05} />
      <Tree position={[8.0, 0, 1.5]} scale={0.85} />
      <Tree position={[5.8, 0, -6.0]} scale={0.75} />

      <FenceSegment position={[-8.5, 0, -2]} rotation={Math.PI / 2} length={3.5} />
      <FenceSegment position={[8.2, 0, 0]} rotation={Math.PI / 2} length={4} />
      <FenceSegment position={[2, 0, -6.5]} length={5} />

      <FlowerPatch position={[4.2, 0, 5.2]} color="#ff8ab8" />
      <FlowerPatch position={[-3.5, 0, 5.0]} color="#ffd060" />
      <FlowerPatch position={[6.0, 0, 2.8]} color="#ff7a5c" />
      <FlowerPatch position={[-7.5, 0, -1.5]} color="#c080ff" />

      <Cloud position={[-7, 7.5, -10]} speed={0.12} opacity={0.4} segments={14} />
      <Cloud position={[6, 8.5, -12]} speed={0.08} opacity={0.32} segments={12} />
      <Cloud position={[1, 9.5, -14]} speed={0.1} opacity={0.28} segments={10} />

      <Butterfly seed={1} />
      <Butterfly seed={3.8} />
      <Butterfly seed={6.2} />
    </>
  );
}
