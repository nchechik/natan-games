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
        camera={{ position: [6.5, 7.5, 8.5], fov: 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#7ec8e8");
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
            opacity={0.35}
            scale={16}
            blur={2.5}
            far={8}
          />
          <OrbitControls
            makeDefault
            enablePan={false}
            minPolarAngle={0.35}
            maxPolarAngle={1.25}
            minDistance={6}
            maxDistance={16}
            target={[0, 0.4, 0]}
            enableDamping
            dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
