import { applyXp, spend } from "@natan-games/game-core";
import {
  CROPS,
  WORKER_COST,
  getGrowthStage,
  type FarmState,
  type PlotId,
  PLOT_UNLOCK_COSTS,
} from "./types";

export type FarmAction =
  | { type: "TAP_PLOT"; plotId: PlotId; now: number }
  | { type: "SELL_WHEAT"; qty?: number }
  | { type: "SELL_ALL_WHEAT" }
  | { type: "UNLOCK_PLOT"; plotId: PlotId }
  | { type: "BUY_WORKER" }
  | { type: "WORKER_TICK"; now: number }
  | { type: "RENAME_FARM"; name: string }
  | { type: "HYDRATE"; state: FarmState };

function normalizeState(state: FarmState): FarmState {
  return {
    ...state,
    hasWorker: Boolean(state.hasWorker),
    workerPlotId: state.workerPlotId ?? null,
    wheat: state.wheat ?? 0,
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
      if (state.hasWorker) return state;
      const nextWallet = spend(state.wallet, { coins: WORKER_COST });
      if (!nextWallet) return state;
      return { ...state, wallet: nextWallet, hasWorker: true };
    }
    case "WORKER_TICK": {
      if (!state.hasWorker) return state;

      let workerPlotId = state.workerPlotId;
      let plots = state.plots;

      if (workerPlotId) {
        const plot = plots.find((p) => p.id === workerPlotId);
        if (!plot || !plot.unlocked) {
          workerPlotId = null;
        } else {
          const stage = getGrowthStage(plot, action.now);
          // Still watering this field — wait until growth finishes
          if (stage === "seed" || stage === "sprout") {
            return state;
          }
          // Growth finished (grown) or plot cleared — free the worker
          workerPlotId = null;
        }
      }

      if (!workerPlotId) {
        const emptyIdx = plots.findIndex((p) => p.unlocked && !p.cropId);
        if (emptyIdx >= 0) {
          plots = plots.map((p, i) =>
            i === emptyIdx
              ? { ...p, cropId: "wheat" as const, plantedAt: action.now }
              : p,
          );
          workerPlotId = plots[emptyIdx].id;
        }
      }

      if (workerPlotId === state.workerPlotId && plots === state.plots) {
        return state;
      }
      return { ...state, plots, workerPlotId };
    }
    case "TAP_PLOT": {
      const index = state.plots.findIndex((p) => p.id === action.plotId);
      if (index < 0) return state;
      const plot = state.plots[index];
      if (!plot.unlocked) return state;

      // Harvest ready wheat
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
            // If worker was on this plot, they're free after harvest clears it
            workerPlotId:
              state.workerPlotId === plot.id ? null : state.workerPlotId,
          };
        }
        return state;
      }

      // Empty unlocked plot → plant & water wheat (no seed bag)
      if (!plot.cropId) {
        // Don't steal a plot the worker is about to claim mid-tick; player can still plant
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
