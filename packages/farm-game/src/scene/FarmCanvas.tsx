"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { PlotState } from "../types";
import { FarmWorld } from "./FarmWorld";
import { PlotBed } from "./PlotBed";

export function FarmCanvas({
  plots,
  now,
  unlockCosts,
  onTapPlot,
  onUnlockPlot,
}: {
  plots: PlotState[];
  now: number;
  unlockCosts: number[];
  onTapPlot: (plot: PlotState) => void;
  onUnlockPlot: (plot: PlotState, index: number) => void;
}) {
  return (
    <div className="fg-canvas">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [9.5, 11.5, 9.5], fov: 36, near: 0.1, far: 90 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#87ceeb");
        }}
      >
        <Suspense fallback={null}>
          <FarmWorld />
          {plots.map((plot, index) => (
            <PlotBed
              key={plot.id}
              plot={plot}
              index={index}
              now={now}
              unlockCost={unlockCosts[index] ?? 1000}
              onTap={() => onTapPlot(plot)}
              onUnlock={() => onUnlockPlot(plot, index)}
            />
          ))}
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={20}
            blur={2.8}
            far={10}
          />
          <OrbitControls
            makeDefault
            enablePan={false}
            minPolarAngle={0.42}
            maxPolarAngle={1.05}
            minAzimuthAngle={-0.85}
            maxAzimuthAngle={0.85}
            minDistance={8}
            maxDistance={18}
            target={[0, 0.5, 0.2]}
            enableDamping
            dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
