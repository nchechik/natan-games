export type CropId = "wheat" | "corn" | "carrot" | "tomato" | "pumpkin";
export type PlotId = string;

export type GrowthStage = "empty" | "seed" | "sprout" | "grown" | "wilted";

export interface CropDef {
  id: CropId;
  name: string;
  emoji: string;
  sellPrice: number;
  xp: number;
  growMs: number;
  tint: string;
}

export interface PlotState {
  id: PlotId;
  unlocked: boolean;
  cropId: CropId | null;
  plantedAt: number | null;
}

export interface FarmState {
  farmName: string;
  wallet: {
    coins: number;
    gems: number;
    xp: number;
    level: number;
  };
  /** Harvested wheat waiting to be sold at market */
  wheat: number;
  plots: PlotState[];
  /** Hired hand that auto-waters one empty field at a time */
  hasWorker: boolean;
  /** Plot the water worker is currently watering, if any */
  workerPlotId: PlotId | null;
  /** Hired hand that auto-harvests one ready field at a time */
  hasHarvester: boolean;
  /** Plot the harvester is currently working, if any */
  harvesterPlotId: PlotId | null;
  /** When the current harvest animation started */
  harvesterStartedAt: number | null;
}

export const SAVE_KEY = "natan-games:farm:v4";
export const SAVE_VERSION = 4;

export const WORKER_COST = 100;
export const HARVESTER_COST = 200;
export const HARVEST_ANIM_MS = 1400;

/** Wheat is the starter crop; other defs remain for plant meshes if unlocked later */
export const CROPS: Record<CropId, CropDef> = {
  wheat: {
    id: "wheat",
    name: "Wheat",
    emoji: "🌾",
    sellPrice: 18,
    xp: 4,
    growMs: 10_000,
    tint: "#d4a017",
  },
  corn: {
    id: "corn",
    name: "Corn",
    emoji: "🌽",
    sellPrice: 24,
    xp: 8,
    growMs: 22_000,
    tint: "#f0c040",
  },
  carrot: {
    id: "carrot",
    name: "Carrot",
    emoji: "🥕",
    sellPrice: 42,
    xp: 14,
    growMs: 35_000,
    tint: "#e67a28",
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    sellPrice: 68,
    xp: 22,
    growMs: 50_000,
    tint: "#d64545",
  },
  pumpkin: {
    id: "pumpkin",
    name: "Pumpkin",
    emoji: "🎃",
    sellPrice: 110,
    xp: 36,
    growMs: 75_000,
    tint: "#e8891a",
  },
};

export const CROP_LIST = Object.values(CROPS);

/** Index 0 is free/open; the rest show this coin price when locked */
export const PLOT_UNLOCK_COSTS = [0, 20, 40, 65, 95, 130, 175, 230, 300, 380, 480, 600];

export function createInitialFarmState(): FarmState {
  const plots: PlotState[] = Array.from({ length: 12 }, (_, i) => ({
    id: `plot-${i}`,
    unlocked: i === 0,
    cropId: null,
    plantedAt: null,
  }));

  return {
    farmName: "Sunny Acre",
    wallet: {
      coins: 0,
      gems: 0,
      xp: 0,
      level: 1,
    },
    wheat: 0,
    plots,
    hasWorker: false,
    workerPlotId: null,
    hasHarvester: false,
    harvesterPlotId: null,
    harvesterStartedAt: null,
  };
}

export function getGrowthProgress(plot: PlotState, now: number): number {
  if (!plot.cropId || plot.plantedAt == null) return 0;
  const def = CROPS[plot.cropId];
  return Math.min(1, (now - plot.plantedAt) / def.growMs);
}

export function getGrowthStage(plot: PlotState, now: number): GrowthStage {
  if (!plot.cropId || plot.plantedAt == null) return "empty";
  const progress = getGrowthProgress(plot, now);
  if (progress >= 1) return "grown";
  if (progress >= 0.55) return "sprout";
  return "seed";
}

export function remainingGrowMs(plot: PlotState, now: number): number {
  if (!plot.cropId || plot.plantedAt == null) return 0;
  const def = CROPS[plot.cropId];
  return Math.max(0, def.growMs - (now - plot.plantedAt));
}
