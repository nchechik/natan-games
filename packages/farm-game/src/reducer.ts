import { applyXp, spend } from "@natan-games/game-core";
import {
  CROPS,
  HARVEST_ANIM_MS,
  MAX_HANDS,
  getGrowthStage,
  nextHarvestWorkerCost,
  nextWaterWorkerCost,
  type FarmState,
  type HarvestJob,
  type PlotId,
  PLOT_UNLOCK_COSTS,
} from "./types";

export type FarmAction =
  | { type: "TAP_PLOT"; plotId: PlotId; now: number }
  | { type: "SELL_WHEAT"; qty?: number }
  | { type: "SELL_ALL_WHEAT" }
  | { type: "UNLOCK_PLOT"; plotId: PlotId }
  | { type: "BUY_WORKER" }
  | { type: "BUY_HARVESTER" }
  | { type: "WORKER_TICK"; now: number }
  | { type: "HARVESTER_TICK"; now: number }
  | { type: "PAUSE_HANDS" }
  | { type: "SHIFT_GROWTH"; pausedMs: number }
  | { type: "RENAME_FARM"; name: string }
  | { type: "HYDRATE"; state: FarmState };

type LegacyFarmState = FarmState & {
  hasWorker?: boolean;
  hasHarvester?: boolean;
  workerPlotId?: PlotId | null;
  harvesterPlotId?: PlotId | null;
  harvesterStartedAt?: number | null;
};

function normalizeState(raw: FarmState): FarmState {
  const state = raw as LegacyFarmState;
  const waterWorkers =
    state.waterWorkers ?? (state.hasWorker ? 1 : 0);
  const harvestWorkers =
    state.harvestWorkers ?? (state.hasHarvester ? 1 : 0);
  const wateringPlotIds =
    state.wateringPlotIds ??
    (state.workerPlotId ? [state.workerPlotId] : []);
  const harvestJobs: HarvestJob[] =
    state.harvestJobs ??
    (state.harvesterPlotId && state.harvesterStartedAt != null
      ? [{ plotId: state.harvesterPlotId, startedAt: state.harvesterStartedAt }]
      : []);

  return {
    farmName: state.farmName,
    wallet: state.wallet,
    wheat: state.wheat ?? 0,
    plots: state.plots,
    waterWorkers,
    wateringPlotIds,
    harvestWorkers,
    harvestJobs,
  };
}

function harvestOne(
  state: FarmState,
  plotId: PlotId,
  now: number,
): FarmState | null {
  const index = state.plots.findIndex((p) => p.id === plotId);
  if (index < 0) return null;
  const plot = state.plots[index];
  if (!plot.unlocked || !plot.cropId || plot.plantedAt == null) return null;
  const def = CROPS[plot.cropId];
  if (now - plot.plantedAt < def.growMs) return null;

  const wallet = applyXp(state.wallet, def.xp);
  const plots = state.plots.map((p, i) =>
    i === index ? { ...p, cropId: null, plantedAt: null } : p,
  );
  return {
    ...state,
    wallet,
    wheat: state.wheat + 1,
    plots,
    wateringPlotIds: state.wateringPlotIds.filter((id) => id !== plotId),
    harvestJobs: state.harvestJobs.filter((j) => j.plotId !== plotId),
  };
}

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case "HYDRATE":
      return normalizeState(action.state);
    case "RENAME_FARM":
      return { ...state, farmName: action.name.trim().slice(0, 24) || state.farmName };
    case "SELL_WHEAT": {
      const qty = Math.min(Math.max(1, action.qty ?? 1), state.wheat);
      if (qty <= 0) return state;
      const price = CROPS.wheat.sellPrice;
      return {
        ...state,
        wheat: state.wheat - qty,
        wallet: {
          ...state.wallet,
          coins: state.wallet.coins + price * qty,
        },
      };
    }
    case "SELL_ALL_WHEAT": {
      if (state.wheat <= 0) return state;
      const price = CROPS.wheat.sellPrice;
      return {
        ...state,
        wheat: 0,
        wallet: {
          ...state.wallet,
          coins: state.wallet.coins + price * state.wheat,
        },
      };
    }
    case "UNLOCK_PLOT": {
      const index = state.plots.findIndex((p) => p.id === action.plotId);
      if (index < 0) return state;
      const plot = state.plots[index];
      if (plot.unlocked) return state;
      const cost = PLOT_UNLOCK_COSTS[index] ?? 1000;
      const nextWallet = spend(state.wallet, { coins: cost });
      if (!nextWallet) return state;
      const plots = state.plots.map((p, i) =>
        i === index ? { ...p, unlocked: true } : p,
      );
      return { ...state, wallet: nextWallet, plots };
    }
    case "BUY_WORKER": {
      if (state.waterWorkers >= MAX_HANDS) return state;
      const cost = nextWaterWorkerCost(state.waterWorkers);
      const nextWallet = spend(state.wallet, { coins: cost });
      if (!nextWallet) return state;
      return {
        ...state,
        wallet: nextWallet,
        waterWorkers: state.waterWorkers + 1,
      };
    }
    case "BUY_HARVESTER": {
      if (state.harvestWorkers >= MAX_HANDS) return state;
      const cost = nextHarvestWorkerCost(state.harvestWorkers);
      const nextWallet = spend(state.wallet, { coins: cost });
      if (!nextWallet) return state;
      return {
        ...state,
        wallet: nextWallet,
        harvestWorkers: state.harvestWorkers + 1,
      };
    }
    case "PAUSE_HANDS": {
      if (state.wateringPlotIds.length === 0 && state.harvestJobs.length === 0) {
        return state;
      }
      return {
        ...state,
        wateringPlotIds: [],
        harvestJobs: [],
      };
    }
    case "SHIFT_GROWTH": {
      const pausedMs = Math.max(0, action.pausedMs);
      if (pausedMs <= 0) return state;
      let changed = false;
      const plots = state.plots.map((p) => {
        if (!p.cropId || p.plantedAt == null) return p;
        changed = true;
        return { ...p, plantedAt: p.plantedAt + pausedMs };
      });
      return changed ? { ...state, plots } : state;
    }
    case "WORKER_TICK": {
      if (state.waterWorkers <= 0) return state;

      let plots = state.plots;
      let wateringPlotIds = state.wateringPlotIds.filter((id) => {
        const plot = plots.find((p) => p.id === id);
        if (!plot || !plot.unlocked) return false;
        const stage = getGrowthStage(plot, action.now);
        return stage === "seed" || stage === "sprout";
      });

      const busy = new Set(wateringPlotIds);
      const freeSlots = state.waterWorkers - wateringPlotIds.length;

      for (let i = 0; i < freeSlots; i++) {
        const emptyIdx = plots.findIndex(
          (p) => p.unlocked && !p.cropId && !busy.has(p.id),
        );
        if (emptyIdx < 0) break;
        const plotId = plots[emptyIdx].id;
        plots = plots.map((p, idx) =>
          idx === emptyIdx
            ? { ...p, cropId: "wheat" as const, plantedAt: action.now }
            : p,
        );
        wateringPlotIds = [...wateringPlotIds, plotId];
        busy.add(plotId);
      }

      const samePlots = plots === state.plots;
      const sameWater =
        wateringPlotIds.length === state.wateringPlotIds.length &&
        wateringPlotIds.every((id, i) => id === state.wateringPlotIds[i]);
      if (samePlots && sameWater) return state;
      return { ...state, plots, wateringPlotIds };
    }
    case "HARVESTER_TICK": {
      if (state.harvestWorkers <= 0) return state;

      let next: FarmState = state;

      // Complete finished harvest animations first
      const pending: HarvestJob[] = [];
      for (const job of state.harvestJobs) {
        if (action.now - job.startedAt < HARVEST_ANIM_MS) {
          pending.push(job);
          continue;
        }
        const harvested = harvestOne(next, job.plotId, action.now);
        if (harvested) next = harvested;
      }
      next = { ...next, harvestJobs: pending };

      // Assign free harvesters to ready fields
      const busy = new Set(next.harvestJobs.map((j) => j.plotId));
      const free = next.harvestWorkers - next.harvestJobs.length;
      const harvestJobs = [...next.harvestJobs];
      for (let i = 0; i < free; i++) {
        const ready = next.plots.find(
          (p) =>
            p.unlocked &&
            !busy.has(p.id) &&
            getGrowthStage(p, action.now) === "grown",
        );
        if (!ready) break;
        harvestJobs.push({ plotId: ready.id, startedAt: action.now });
        busy.add(ready.id);
      }

      const unchanged =
        harvestJobs.length === state.harvestJobs.length &&
        harvestJobs.every(
          (j, i) =>
            j.plotId === state.harvestJobs[i]?.plotId &&
            j.startedAt === state.harvestJobs[i]?.startedAt,
        ) &&
        next.wheat === state.wheat &&
        next.plots === state.plots &&
        next.wallet === state.wallet;

      if (unchanged) return state;
      return { ...next, harvestJobs };
    }
    case "TAP_PLOT": {
      const index = state.plots.findIndex((p) => p.id === action.plotId);
      if (index < 0) return state;
      const plot = state.plots[index];
      if (!plot.unlocked) return state;

      if (plot.cropId && plot.plantedAt != null) {
        const def = CROPS[plot.cropId];
        const ready = action.now - plot.plantedAt >= def.growMs;
        if (ready) {
          const wallet = applyXp(state.wallet, def.xp);
          const plots = state.plots.map((p, i) =>
            i === index ? { ...p, cropId: null, plantedAt: null } : p,
          );
          return {
            ...state,
            wallet,
            wheat: state.wheat + 1,
            plots,
            wateringPlotIds: state.wateringPlotIds.filter((id) => id !== plot.id),
            harvestJobs: state.harvestJobs.filter((j) => j.plotId !== plot.id),
          };
        }
        return state;
      }

      if (!plot.cropId) {
        const plots = state.plots.map((p, i) =>
          i === index
            ? { ...p, cropId: "wheat" as const, plantedAt: action.now }
            : p,
        );
        return { ...state, plots };
      }

      return state;
    }
    default:
      return state;
  }
}
