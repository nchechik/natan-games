"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { loadSave, persistSave } from "@natan-games/game-core";
import { farmReducer } from "./reducer";
import {
  CROPS,
  createInitialFarmState,
  getGrowthStage,
  SAVE_KEY,
  SAVE_VERSION,
  type FarmState,
  type PlotState,
  PLOT_UNLOCK_COSTS,
} from "./types";
import { FarmCanvas } from "./scene/FarmCanvas";

function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function FarmGame() {
  const [state, dispatch] = useReducer(farmReducer, undefined, createInitialFarmState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<"farm" | "market">("farm");
  const [marketPulse, setMarketPulse] = useState(false);
  const now = useNow(200);
  const skipFirstPersist = useRef(true);

  useEffect(() => {
    const envelope = loadSave(SAVE_KEY, createInitialFarmState, SAVE_VERSION);
    dispatch({ type: "HYDRATE", state: envelope.state });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    persistSave(SAVE_KEY, {
      version: SAVE_VERSION,
      gameId: "farm",
      updatedAt: Date.now(),
      state,
    });
  }, [state, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const flash = (message: string) => setToast(message);

  const goToMarket = () => {
    setView("market");
    setMarketPulse(false);
  };

  const goToFarm = () => setView("farm");

  const tapPlot = (plot: PlotState) => {
    const stage = getGrowthStage(plot, now);
    if (stage === "grown") {
      dispatch({ type: "TAP_PLOT", plotId: plot.id, now });
      flash(`Harvested wheat! Sell it at the market`);
      setMarketPulse(true);
      return;
    }
    if (!plot.cropId) {
      dispatch({ type: "TAP_PLOT", plotId: plot.id, now });
      flash("Watering wheat…");
      return;
    }
  };

  const unlockPlot = (plot: PlotState, index: number) => {
    const cost = PLOT_UNLOCK_COSTS[index] ?? 1000;
    if (state.wallet.coins < cost) {
      flash(`Need ${cost} coins to unlock`);
      return;
    }
    dispatch({ type: "UNLOCK_PLOT", plotId: plot.id });
    flash(`Field unlocked (−${cost} coins)`);
  };

  const sellOne = () => {
    if (state.wheat <= 0) {
      flash("No wheat to sell");
      return;
    }
    dispatch({ type: "SELL_WHEAT", qty: 1 });
    flash(`Sold wheat (+${CROPS.wheat.sellPrice} coins)`);
  };

  const sellAll = () => {
    if (state.wheat <= 0) {
      flash("No wheat to sell");
      return;
    }
    const earned = state.wheat * CROPS.wheat.sellPrice;
    dispatch({ type: "SELL_ALL_WHEAT" });
    flash(`Sold all wheat (+${earned} coins)`);
  };

  return (
    <div className={`fg-root fg-root--3d ${view === "market" ? "is-market" : ""}`}>
      <div className={`fg-farm-stage ${view === "market" ? "is-away" : ""}`}>
        <FarmCanvas
          plots={state.plots}
          now={now}
          unlockCosts={PLOT_UNLOCK_COSTS}
          onTapPlot={tapPlot}
          onUnlockPlot={unlockPlot}
        />

        <header className="fg-hud">
          <div className="fg-brand">
            <p className="fg-brand__mark">Sunny Acre</p>
            <p className="fg-brand__sub">
              Water · Harvest · Sell · Expand
            </p>
          </div>
          <div className="fg-stats">
            <div className="fg-stat" title="Coins">
              <span className="fg-stat__coin" aria-hidden />
              <span>{state.wallet.coins}</span>
            </div>
            <div className="fg-stat fg-stat--wheat" title="Wheat">
              <span className="fg-stat__wheat" aria-hidden>
                🌾
              </span>
              <span>{state.wheat}</span>
            </div>
          </div>
        </header>

        <button
          type="button"
          className={`fg-market-fab ${marketPulse || state.wheat > 0 ? "is-ready" : ""} ${marketPulse ? "is-pulse" : ""}`}
          onClick={goToMarket}
          aria-label="Go to market"
        >
          <span className="fg-market-fab__icon" aria-hidden>
            🏪
          </span>
          <span className="fg-market-fab__copy">
            <strong>Market</strong>
            <span>
              {state.wheat > 0 ? `Sell ×${state.wheat}` : "Sell your harvest"}
            </span>
          </span>
        </button>
      </div>

      <div
        className={`fg-market-stage ${view === "market" ? "is-open" : ""}`}
        aria-hidden={view !== "market"}
      >
        <div className="fg-market-card">
          <div className="fg-market-card__topstats">
            <div className="fg-stat" title="Coins">
              <span className="fg-stat__coin" aria-hidden />
              <span>{state.wallet.coins}</span>
            </div>
            <div className="fg-stat fg-stat--wheat" title="Wheat">
              <span className="fg-stat__wheat" aria-hidden>
                🌾
              </span>
              <span>{state.wheat}</span>
            </div>
          </div>
          <div className="fg-market-card__hero" aria-hidden>
            <span className="fg-market-card__stall">🏪</span>
            <span className="fg-market-card__wheat">🌾</span>
            <span className="fg-market-card__wheat fg-market-card__wheat--2">🌾</span>
          </div>
          <p className="fg-market-card__eyebrow">Village Market</p>
          <h2 className="fg-market-card__title">Sell your wheat</h2>
          <p className="fg-market-card__sub">
            Each bundle sells for {CROPS.wheat.sellPrice} coins — use coins to unlock more fields.
          </p>

          <div className="fg-market-card__stock">
            <span className="fg-market-card__stock-emoji" aria-hidden>
              🌾
            </span>
            <div>
              <strong>Wheat in cart</strong>
              <span>×{state.wheat}</span>
            </div>
            <div className="fg-market-card__stock-value">
              <span className="fg-stat__coin" aria-hidden />
              {state.wheat * CROPS.wheat.sellPrice}
            </div>
          </div>

          <div className="fg-market-card__actions">
            <button
              type="button"
              className="fg-market-btn fg-market-btn--sell"
              disabled={state.wheat <= 0}
              onClick={sellOne}
            >
              Sell 1 (+{CROPS.wheat.sellPrice})
            </button>
            <button
              type="button"
              className="fg-market-btn fg-market-btn--sell-all"
              disabled={state.wheat <= 0}
              onClick={sellAll}
            >
              Sell all
            </button>
          </div>

          <button
            type="button"
            className="fg-market-btn fg-market-btn--back"
            onClick={goToFarm}
          >
            Back to farm
          </button>
        </div>
      </div>

      {toast && <div className="fg-toast">{toast}</div>}
    </div>
  );
}

export type { FarmState };
