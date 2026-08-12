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
  MAX_HANDS,
  createInitialFarmState,
  getGrowthStage,
  nextHarvestWorkerCost,
  nextWaterWorkerCost,
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
  const [marketTab, setMarketTab] = useState<"sell" | "buy">("sell");
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

  useEffect(() => {
    if (!hydrated || state.waterWorkers <= 0) return;
    dispatch({ type: "WORKER_TICK", now });
  }, [hydrated, state.waterWorkers, state.wateringPlotIds, state.plots, now]);

  useEffect(() => {
    if (!hydrated || state.harvestWorkers <= 0) return;
    dispatch({ type: "HARVESTER_TICK", now });
  }, [
    hydrated,
    state.harvestWorkers,
    state.harvestJobs,
    state.plots,
    now,
  ]);

  const flash = (message: string) => setToast(message);

  const goToMarket = (tab: "sell" | "buy" = "sell") => {
    setMarketTab(tab);
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

  const waterCost = nextWaterWorkerCost(state.waterWorkers);
  const harvestCost = nextHarvestWorkerCost(state.harvestWorkers);

  const buyWorker = () => {
    if (state.waterWorkers >= MAX_HANDS) {
      flash("Max water workers hired");
      return;
    }
    if (state.wallet.coins < waterCost) {
      flash(`Need ${waterCost} coins for next water worker`);
      return;
    }
    dispatch({ type: "BUY_WORKER" });
    flash(`Water worker hired! (×${state.waterWorkers + 1})`);
  };

  const buyHarvester = () => {
    if (state.harvestWorkers >= MAX_HANDS) {
      flash("Max harvesters hired");
      return;
    }
    if (state.wallet.coins < harvestCost) {
      flash(`Need ${harvestCost} coins for next harvester`);
      return;
    }
    dispatch({ type: "BUY_HARVESTER" });
    flash(`Harvester hired! (×${state.harvestWorkers + 1})`);
  };

  return (
    <div className={`fg-root fg-root--3d ${view === "market" ? "is-market" : ""}`}>
      <div className={`fg-farm-stage ${view === "market" ? "is-away" : ""}`}>
        <FarmCanvas
          plots={state.plots}
          now={now}
          unlockCosts={PLOT_UNLOCK_COSTS}
          waterWorkers={state.waterWorkers}
          wateringPlotIds={state.wateringPlotIds}
          harvestWorkers={state.harvestWorkers}
          harvestJobs={state.harvestJobs}
          onTapPlot={tapPlot}
          onUnlockPlot={unlockPlot}
        />

        <header className="fg-hud">
          <div className="fg-brand">
            <p className="fg-brand__mark">Sunny Acre</p>
            <p className="fg-brand__sub">
              {state.waterWorkers > 0 || state.harvestWorkers > 0
                ? "Hands at work · Sell · Expand"
                : "Water · Harvest · Sell · Expand"}
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
          onClick={() => goToMarket("sell")}
          aria-label="Go to market"
        >
          <span className="fg-market-fab__icon" aria-hidden>
            🏪
          </span>
          <span className="fg-market-fab__copy">
            <strong>Market</strong>
            <span>
              {state.wheat > 0 ? `Sell ×${state.wheat}` : "Sell & hire hands"}
            </span>
          </span>
        </button>
      </div>

      <div
        className={`fg-market-stage ${view === "market" ? "is-open" : ""}`}
        aria-hidden={view !== "market"}
      >
        <div className="fg-market-card">
          <div className="fg-market-card__header">
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
            <button
              type="button"
              className="fg-market-close"
              onClick={goToFarm}
              aria-label="Close market"
            >
              ×
            </button>
          </div>

          <p className="fg-market-card__eyebrow">Village Market</p>
          <h2 className="fg-market-card__title">Market</h2>

          <div className="fg-market-tabs" role="tablist" aria-label="Market sections">
            <button
              type="button"
              role="tab"
              aria-selected={marketTab === "sell"}
              className={`fg-market-tab ${marketTab === "sell" ? "is-active" : ""}`}
              onClick={() => setMarketTab("sell")}
            >
              Sell
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={marketTab === "buy"}
              className={`fg-market-tab ${marketTab === "buy" ? "is-active" : ""}`}
              onClick={() => setMarketTab("buy")}
            >
              Buy
            </button>
          </div>

          {marketTab === "sell" ? (
            <div className="fg-market-panel" role="tabpanel">
              <p className="fg-market-card__sub">
                Each wheat bundle sells for {CROPS.wheat.sellPrice} coins.
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
            </div>
          ) : (
            <div className="fg-market-panel" role="tabpanel">
              <p className="fg-market-card__sub">
                Hire more hands anytime — each extra worker costs more.
              </p>

              <div className="fg-worker-offer">
                <span className="fg-worker-offer__emoji" aria-hidden>
                  💧
                </span>
                <div className="fg-worker-offer__copy">
                  <strong>Water worker · ×{state.waterWorkers}</strong>
                  <span>
                    Auto-waters one empty field each · next{" "}
                    {state.waterWorkers >= MAX_HANDS ? "MAX" : `${waterCost} coins`}
                  </span>
                </div>
                <button
                  type="button"
                  className="fg-market-btn fg-market-btn--worker"
                  disabled={
                    state.waterWorkers >= MAX_HANDS ||
                    state.wallet.coins < waterCost
                  }
                  onClick={buyWorker}
                >
                  Buy
                  <span className="fg-stat__coin" aria-hidden />
                  {waterCost}
                </button>
              </div>

              <div className="fg-worker-offer fg-worker-offer--harvest">
                <span className="fg-worker-offer__emoji" aria-hidden>
                  🌾
                </span>
                <div className="fg-worker-offer__copy">
                  <strong>Harvester · ×{state.harvestWorkers}</strong>
                  <span>
                    Auto-harvests one ready field each · next{" "}
                    {state.harvestWorkers >= MAX_HANDS
                      ? "MAX"
                      : `${harvestCost} coins`}
                  </span>
                </div>
                <button
                  type="button"
                  className="fg-market-btn fg-market-btn--harvester"
                  disabled={
                    state.harvestWorkers >= MAX_HANDS ||
                    state.wallet.coins < harvestCost
                  }
                  onClick={buyHarvester}
                >
                  Buy
                  <span className="fg-stat__coin" aria-hidden />
                  {harvestCost}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="fg-toast">{toast}</div>}
    </div>
  );
}

export type { FarmState };
