"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { TOUCH, type PerspectiveCamera } from "three";
import type { HarvestJob, PlotState } from "../types";
import { FarmWorld } from "./FarmWorld";
import { PlotBed } from "./PlotBed";
import { FarmHands } from "./FarmHands";

function useMobileFarmView() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px), (pointer: coarse)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

function MobileCameraRig({ mobile }: { mobile: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    if (mobile) {
      cam.position.set(6.2, 9.8, 8.4);
      cam.fov = 42;
    } else {
      cam.position.set(9.5, 11.5, 9.5);
      cam.fov = 36;
    }
    cam.updateProjectionMatrix();
  }, [camera, mobile]);

  return null;
}

export function FarmCanvas({
  plots,
  now,
  unlockCosts,
  waterWorkers,
  wateringPlotIds,
  harvestWorkers,
  harvestJobs,
  onTapPlot,
  onUnlockPlot,
}: {
  plots: PlotState[];
  now: number;
  unlockCosts: number[];
  waterWorkers: number;
  wateringPlotIds: string[];
  harvestWorkers: number;
  harvestJobs: HarvestJob[];
  onTapPlot: (plot: PlotState) => void;
  onUnlockPlot: (plot: PlotState, index: number) => void;
}) {
  const mobile = useMobileFarmView();

  const wateringPlotIndexes = Array.from({ length: waterWorkers }, (_, i) => {
    const id = wateringPlotIds[i];
    if (!id) return null;
    const idx = plots.findIndex((p) => p.id === id);
    return idx >= 0 ? idx : null;
  });

  const harvestingPlotIndexes = Array.from(
    { length: harvestWorkers },
    (_, i) => {
      const job = harvestJobs[i];
      if (!job) return null;
      const idx = plots.findIndex((p) => p.id === job.plotId);
      return idx >= 0 ? idx : null;
    },
  );

  return (
    <div className="fg-canvas">
      <Canvas
        shadows={!mobile}
        dpr={mobile ? [1, 1.35] : [1, 1.75]}
        camera={{
          position: [9.5, 11.5, 9.5],
          fov: 36,
          near: 0.1,
          far: 90,
        }}
        gl={{
          antialias: !mobile,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#87ceeb");
        }}
      >
        <Suspense fallback={null}>
          <MobileCameraRig mobile={mobile} />
          <FarmWorld hasWorker={waterWorkers > 0 || harvestWorkers > 0} />
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
          <FarmHands
            waterWorkers={waterWorkers}
            harvestWorkers={harvestWorkers}
            wateringPlotIndexes={wateringPlotIndexes}
            harvestingPlotIndexes={harvestingPlotIndexes}
          />
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={mobile ? 0.28 : 0.4}
            scale={20}
            blur={mobile ? 2 : 2.8}
            far={10}
          />
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom
            minPolarAngle={0.25}
            maxPolarAngle={Math.PI / 2 - 0.08}
            minDistance={mobile ? 6.5 : 8}
            maxDistance={mobile ? 16 : 22}
            target={[0, 0.35, 0.15]}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={mobile ? 0.65 : 0.9}
            zoomSpeed={mobile ? 0.7 : 1}
            touches={{
              ONE: TOUCH.ROTATE,
              TWO: TOUCH.DOLLY_PAN,
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
