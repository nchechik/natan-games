import { applyXp, spend } from "@natan-games/game-core";
import {
  CROPS,
  CROP_LIST,
  type CropId,
  type FarmState,
  type PlotId,
  PLOT_UNLOCK_COSTS,
} from "./types";

export type FarmAction =
  | { type: "SELECT_CROP"; cropId: CropId }
  | { type: "SELECT_TOOL"; tool: FarmState["selectedTool"] }
  | { type: "TAP_PLOT"; plotId: PlotId; now: number }
  | { type: "BUY_SEEDS"; cropId: CropId; qty: number }
  | { type: "SELL_HARVEST"; cropId: CropId; qty: number }
  | { type: "SELL_ALL" }
  | { type: "UNLOCK_PLOT"; plotId: PlotId }
  | { type: "RENAME_FARM"; name: string }
  | { type: "HYDRATE"; state: FarmState };

function emptySeeds(): FarmState["inventory"]["seeds"] {
  return {
    wheat: 0,
    corn: 0,
    carrot: 0,
    tomato: 0,
    pumpkin: 0,
  };
}

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "SELECT_CROP":
      return { ...state, selectedCrop: action.cropId, selectedTool: "plant" };
    case "SELECT_TOOL":
      return { ...state, selectedTool: action.tool };
    case "RENAME_FARM":
      return { ...state, farmName: action.name.trim().slice(0, 24) || state.farmName };
    case "BUY_SEEDS": {
      const def = CROPS[action.cropId];
      if (state.wallet.level < def.unlockLevel) return state;
      const qty = Math.max(1, action.qty);
      const cost = def.seedCost * qty;
      const nextWallet = spend(state.wallet, { coins: cost });
      if (!nextWallet) return state;
      return {
        ...state,
        wallet: nextWallet,
        inventory: {
          ...state.inventory,
          seeds: {
            ...state.inventory.seeds,
            [action.cropId]: state.inventory.seeds[action.cropId] + qty,
          },
        },
      };
    }
    case "SELL_HARVEST": {
      const qty = Math.min(
        Math.max(1, action.qty),
        state.inventory.harvest[action.cropId],
      );
      if (qty <= 0) return state;
      const def = CROPS[action.cropId];
      return {
        ...state,
        wallet: {
          ...state.wallet,
          coins: state.wallet.coins + def.sellPrice * qty,
        },
        inventory: {
          ...state.inventory,
          harvest: {
            ...state.inventory.harvest,
            [action.cropId]: state.inventory.harvest[action.cropId] - qty,
          },
        },
      };
    }
    case "SELL_ALL": {
      let coins = state.wallet.coins;
      for (const crop of CROP_LIST) {
        coins += state.inventory.harvest[crop.id] * crop.sellPrice;
      }
      return {
        ...state,
        wallet: { ...state.wallet, coins },
        inventory: {
          ...state.inventory,
          harvest: emptySeeds(),
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

      if (state.selectedTool === "harvest" || (plot.cropId && plot.plantedAt != null)) {
        const def = plot.cropId ? CROPS[plot.cropId] : null;
        const ready =
          def &&
          plot.plantedAt != null &&
          action.now - plot.plantedAt >= def.growMs;

        if (ready && def && plot.cropId) {
          const wallet = applyXp(state.wallet, def.xp);
          const plots = state.plots.map((p, i) =>
            i === index ? { ...p, cropId: null, plantedAt: null } : p,
          );
          return {
            ...state,
            wallet,
            plots,
            inventory: {
              ...state.inventory,
              harvest: {
                ...state.inventory.harvest,
                [plot.cropId]: state.inventory.harvest[plot.cropId] + 1,
              },
            },
          };
        }
      }

      if (state.selectedTool === "plant" && !plot.cropId) {
        const cropId = state.selectedCrop;
        const seeds = state.inventory.seeds[cropId];
        if (seeds <= 0) return state;
        if (state.wallet.level < CROPS[cropId].unlockLevel) return state;
        const plots = state.plots.map((p, i) =>
          i === index
            ? { ...p, cropId, plantedAt: action.now }
            : p,
        );
        return {
          ...state,
          plots,
          inventory: {
            ...state.inventory,
            seeds: {
              ...state.inventory.seeds,
              [cropId]: seeds - 1,
            },
          },
        };
      }

      return state;
    }
    default:
      return state;
  }
}
