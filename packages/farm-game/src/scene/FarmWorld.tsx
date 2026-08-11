"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Sky } from "@react-three/drei";
import { DoubleSide, type Group, type Mesh } from "three";

function Tree({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.03;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.1, 6]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color="#3f7a3a" roughness={0.85} />
      </mesh>
      <mesh position={[0.25, 1.55, 0.1]} castShadow>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshStandardMaterial color="#4f8f45" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Windmill({ position }: { position: [number, number, number] }) {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (blades.current) blades.current.rotation.z += delta * 0.8;
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.35, 2.4, 8]} />
        <meshStandardMaterial color="#d9c4a0" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.45, 0]} castShadow>
        <coneGeometry args={[0.4, 0.45, 8]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.7} />
      </mesh>
      <group ref={blades} position={[0, 1.85, 0.28]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0.55, 0]}>
            <boxGeometry args={[0.12, 1.1, 0.04]} />
            <meshStandardMaterial color="#f4efe4" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Barn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 1.6]} />
        <meshStandardMaterial color="#c45c4a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.55, 0.9, 4]} />
        <meshStandardMaterial color="#6b4423" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.45, 0.81]}>
        <boxGeometry args={[0.55, 0.9, 0.05]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Butterfly({ seed }: { seed: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + seed;
    ref.current.position.x = Math.sin(t * 0.4 + seed) * 4;
    ref.current.position.z = Math.cos(t * 0.35 + seed) * 3 - 1;
    ref.current.position.y = 1.2 + Math.sin(t * 2.2) * 0.35;
    ref.current.rotation.y = t * 0.5;
    const flap = Math.sin(t * 14) * 0.6;
    const left = ref.current.children[0] as Mesh | undefined;
    const right = ref.current.children[1] as Mesh | undefined;
    if (left) left.rotation.y = flap;
    if (right) right.rotation.y = -flap;
  });
  return (
    <group ref={ref}>
      <mesh position={[-0.08, 0, 0]}>
        <planeGeometry args={[0.16, 0.1]} />
        <meshStandardMaterial color="#f0a040" side={DoubleSide} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.08, 0, 0]}>
        <planeGeometry args={[0.16, 0.1]} />
        <meshStandardMaterial color="#e87830" side={DoubleSide} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export function FarmWorld() {
  const grassPatches = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: ((i * 47) % 17) - 8,
        z: ((i * 31) % 15) - 7,
        s: 0.3 + (i % 5) * 0.08,
      })),
    [],
  );

  return (
    <>
      <Sky
        sunPosition={[8, 12, 4]}
        turbidity={4}
        rayleigh={1.2}
        mieCoefficient={0.01}
        mieDirectionalG={0.8}
      />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <hemisphereLight args={["#b8dff0", "#5a9a4f", 0.35]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#5fa85a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[5.2, 32]} />
        <meshStandardMaterial color="#4f8f45" roughness={0.95} />
      </mesh>

      {/* Field border planks */}
      {[
        [0, 0.08, -2.6, 6.4, 0.16, 0.2],
        [0, 0.08, 2.6, 6.4, 0.16, 0.2],
        [-3.2, 0.08, 0, 0.2, 0.16, 5.4],
        [3.2, 0.08, 0, 0.2, 0.16, 5.4],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#8b5e3c" roughness={0.85} />
        </mesh>
      ))}

      {grassPatches.map((g, i) => (
        <mesh key={i} position={[g.x, 0.05, g.z]} castShadow>
          <coneGeometry args={[0.06, g.s, 5]} />
          <meshStandardMaterial color={i % 2 ? "#6db35a" : "#3f7a3a"} roughness={1} />
        </mesh>
      ))}

      <Barn position={[-6.5, 0, -4.5]} />
      <Windmill position={[6.8, 0, -3.8]} />
      <Tree position={[-5.2, 0, 3.5]} />
      <Tree position={[5.5, 0, 4.2]} />
      <Tree position={[-7.5, 0, 0.5]} />
      <Tree position={[7.2, 0, 1.2]} />

      <Cloud position={[-6, 6, -8]} speed={0.15} opacity={0.45} segments={12} />
      <Cloud position={[5, 7, -10]} speed={0.1} opacity={0.35} segments={10} />
      <Cloud position={[0, 8, -12]} speed={0.12} opacity={0.3} segments={8} />

      <Butterfly seed={1} />
      <Butterfly seed={4.2} />
    </>
  );
}
