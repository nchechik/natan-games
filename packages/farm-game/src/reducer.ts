import { applyXp, spend } from "@natan-games/game-core";
import {
  CROPS,
  type FarmState,
  type PlotId,
  PLOT_UNLOCK_COSTS,
} from "./types";

export type FarmAction =
  | { type: "TAP_PLOT"; plotId: PlotId; now: number }
  | { type: "SELL_WHEAT"; qty?: number }
  | { type: "SELL_ALL_WHEAT" }
  | { type: "UNLOCK_PLOT"; plotId: PlotId }
  | { type: "RENAME_FARM"; name: string }
  | { type: "HYDRATE"; state: FarmState };

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
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
          };
        }
        return state;
      }

      // Empty unlocked plot → plant & water wheat (no seed bag)
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
