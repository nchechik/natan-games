export type CropId = "wheat" | "corn" | "carrot" | "tomato" | "pumpkin";
export type PlotId = string;

export type GrowthStage = "empty" | "seed" | "sprout" | "grown" | "wilted";

export interface CropDef {
  id: CropId;
  name: string;
  emoji: string;
  seedCost: number;
  sellPrice: number;
  xp: number;
  growMs: number;
  unlockLevel: number;
  tint: string;
}

export interface PlotState {
  id: PlotId;
  unlocked: boolean;
  cropId: CropId | null;
  plantedAt: number | null;
}

export interface FarmInventory {
  seeds: Record<CropId, number>;
  harvest: Record<CropId, number>;
}

export interface FarmState {
  farmName: string;
  wallet: {
    coins: number;
    gems: number;
    xp: number;
    level: number;
  };
  inventory: FarmInventory;
  plots: PlotState[];
  selectedCrop: CropId;
  selectedTool: "plant" | "harvest" | "sell";
}

export const SAVE_KEY = "natan-games:farm:v1";
export const SAVE_VERSION = 1;

export const CROPS: Record<CropId, CropDef> = {
  wheat: {
    id: "wheat",
    name: "Wheat",
    emoji: "🌾",
    seedCost: 5,
    sellPrice: 12,
    xp: 4,
    growMs: 12_000,
    unlockLevel: 1,
    tint: "#d4a017",
  },
  corn: {
    id: "corn",
    name: "Corn",
    emoji: "🌽",
    seedCost: 10,
    sellPrice: 24,
    xp: 8,
    growMs: 22_000,
    unlockLevel: 2,
    tint: "#f0c040",
  },
  carrot: {
    id: "carrot",
    name: "Carrot",
    emoji: "🥕",
    seedCost: 18,
    sellPrice: 42,
    xp: 14,
    growMs: 35_000,
    unlockLevel: 3,
    tint: "#e67a28",
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    seedCost: 28,
    sellPrice: 68,
    xp: 22,
    growMs: 50_000,
    unlockLevel: 4,
    tint: "#d64545",
  },
  pumpkin: {
    id: "pumpkin",
    name: "Pumpkin",
    emoji: "🎃",
    seedCost: 45,
    sellPrice: 110,
    xp: 36,
    growMs: 75_000,
    unlockLevel: 5,
    tint: "#e8891a",
  },
};

export const CROP_LIST = Object.values(CROPS);

export const PLOT_UNLOCK_COSTS = [0, 0, 0, 0, 40, 80, 140, 220, 320, 450, 600, 800];

export function createInitialFarmState(): FarmState {
  const plots: PlotState[] = Array.from({ length: 12 }, (_, i) => ({
    id: `plot-${i}`,
    unlocked: i < 4,
    cropId: null,
    plantedAt: null,
  }));

  return {
    farmName: "Sunny Acre",
    wallet: {
      coins: 80,
      gems: 5,
      xp: 0,
      level: 1,
    },
    inventory: {
      seeds: {
        wheat: 6,
        corn: 2,
        carrot: 0,
        tomato: 0,
        pumpkin: 0,
      },
      harvest: {
        wheat: 0,
        corn: 0,
        carrot: 0,
        tomato: 0,
        pumpkin: 0,
      },
    },
    plots,
    selectedCrop: "wheat",
    selectedTool: "plant",
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
