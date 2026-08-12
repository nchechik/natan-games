"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { formatDuration, loadSave, persistSave } from "@natan-games/game-core";
import { farmReducer } from "./reducer";
import {
  CROPS,
  CROP_LIST,
  createInitialFarmState,
  getGrowthStage,
  SAVE_KEY,
  SAVE_VERSION,
  type CropId,
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
  const [bagOpen, setBagOpen] = useState(false);
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

  const totalHarvest = CROP_LIST.reduce(
    (sum, crop) => sum + state.inventory.harvest[crop.id],
    0,
  );

  const flash = (message: string) => setToast(message);

  const tapPlot = (plot: PlotState) => {
    const stage = getGrowthStage(plot, now);
    if (stage === "grown") {
      const crop = plot.cropId ? CROPS[plot.cropId] : null;
      dispatch({ type: "TAP_PLOT", plotId: plot.id, now });
      if (crop) flash(`Harvested ${crop.name} (+${crop.xp} XP)`);
      return;
    }
    if (!plot.cropId && state.selectedTool === "plant") {
      if (state.inventory.seeds[state.selectedCrop] <= 0) {
        flash("Buy more seeds in the shop");
        return;
      }
      dispatch({ type: "TAP_PLOT", plotId: plot.id, now });
      flash(`Planted ${CROPS[state.selectedCrop].name}`);
      return;
    }
    dispatch({ type: "TAP_PLOT", plotId: plot.id, now });
  };

  const unlockPlot = (plot: PlotState, index: number) => {
    const cost = PLOT_UNLOCK_COSTS[index] ?? 1000;
    const next = farmReducer(state, {
      type: "UNLOCK_PLOT",
      plotId: plot.id,
    });
    if (!next.plots[index].unlocked) {
      flash("Not enough coins to expand");
      return;
    }
    dispatch({ type: "UNLOCK_PLOT", plotId: plot.id });
    flash(`Field expanded (−${cost} coins)`);
  };

  const buySeeds = (cropId: CropId) => {
    const before = state.inventory.seeds[cropId];
    const next = farmReducer(state, { type: "BUY_SEEDS", cropId, qty: 1 });
    if (next.inventory.seeds[cropId] === before) {
      flash(
        state.wallet.level < CROPS[cropId].unlockLevel
          ? `Unlocks at farm level ${CROPS[cropId].unlockLevel}`
          : "Not enough coins",
      );
      return;
    }
    dispatch({ type: "BUY_SEEDS", cropId, qty: 1 });
    flash(`Bought ${CROPS[cropId].name} seeds`);
  };

  return (
    <div className="fg-root fg-root--3d">
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
            Farm Level {state.wallet.level}
            <span className="fg-brand__dot" aria-hidden />
            Orbit to look around
          </p>
        </div>
        <div className="fg-stats">
          <div className="fg-stat" title="Coins">
            <span className="fg-stat__coin" aria-hidden />
            <span>{state.wallet.coins}</span>
          </div>
          <div className="fg-stat fg-stat--gem" title="Gems">
            <span className="fg-stat__gem" aria-hidden />
            <span>{state.wallet.gems}</span>
          </div>
          <div className="fg-stat fg-stat--xp" title="Experience">
            <span className="fg-stat__xp-label">XP</span>
            <span>{state.wallet.xp}</span>
          </div>
        </div>
      </header>

      <aside
        className={`fg-panel fg-panel--overlay ${bagOpen ? "is-open" : "is-collapsed"}`}
        aria-label="Seed bag and market"
      >
        {!bagOpen ? (
          <button
            type="button"
            className="fg-bag-toggle"
            onClick={() => setBagOpen(true)}
            aria-expanded={false}
            aria-controls="fg-bag-panel"
          >
            <span className="fg-bag-toggle__emoji" aria-hidden>
              {CROPS[state.selectedCrop].emoji}
            </span>
            <span className="fg-bag-toggle__copy">
              <strong>Seed bag</strong>
              <span>
                {CROPS[state.selectedCrop].name} · ×
                {state.inventory.seeds[state.selectedCrop]}
              </span>
            </span>
            <span className="fg-bag-toggle__chev" aria-hidden>
              ▲
            </span>
          </button>
        ) : (
          <div id="fg-bag-panel" className="fg-panel__body">
            <div className="fg-panel__toolbar">
              <p className="fg-panel__title">Farm tools</p>
              <button
                type="button"
                className="fg-bag-collapse"
                onClick={() => setBagOpen(false)}
                aria-expanded={true}
                aria-controls="fg-bag-panel"
              >
                Hide panel
                <span aria-hidden>▼</span>
              </button>
            </div>

            <section className="fg-section">
              <h2>Seed bag</h2>
              <div className="fg-crop-row">
                {CROP_LIST.map((crop) => {
                  const locked = state.wallet.level < crop.unlockLevel;
                  const selected = state.selectedCrop === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      className={`fg-crop ${selected ? "is-selected" : ""} ${locked ? "is-locked" : ""}`}
                      disabled={locked}
                      onClick={() =>
                        dispatch({ type: "SELECT_CROP", cropId: crop.id })
                      }
                      title={
                        locked
                          ? `Unlocks at level ${crop.unlockLevel}`
                          : `${crop.name} · ${formatDuration(crop.growMs)}`
                      }
                    >
                      <span className="fg-crop__emoji">{crop.emoji}</span>
                      <span className="fg-crop__name">{crop.name}</span>
                      <span className="fg-crop__qty">
                        ×{state.inventory.seeds[crop.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="fg-hint">
                Tap a field to plant · harvest when crops sparkle · expand locked beds with coins
              </p>
            </section>

            <section className="fg-section">
              <div className="fg-section__head">
                <h2>Market</h2>
                <button
                  type="button"
                  className="fg-text-btn"
                  disabled={totalHarvest === 0}
                  onClick={() => {
                    dispatch({ type: "SELL_ALL" });
                    flash("Sold everything at market");
                  }}
                >
                  Sell all
                </button>
              </div>
              <ul className="fg-market">
                {CROP_LIST.map((crop) => {
                  const qty = state.inventory.harvest[crop.id];
                  const locked = state.wallet.level < crop.unlockLevel;
                  return (
                    <li key={crop.id} className="fg-market__row">
                      <div>
                        <strong>
                          {crop.emoji} {crop.name}
                        </strong>
                        <span>
                          Seed {crop.seedCost} · Sell {crop.sellPrice}
                          {locked ? ` · Lv ${crop.unlockLevel}` : ""}
                        </span>
                      </div>
                      <div className="fg-market__actions">
                        <button
                          type="button"
                          onClick={() => buySeeds(crop.id)}
                          disabled={locked}
                        >
                          Buy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (qty <= 0) {
                              flash("Nothing to sell");
                              return;
                            }
                            dispatch({
                              type: "SELL_HARVEST",
                              cropId: crop.id,
                              qty: 1,
                            });
                            flash(`Sold ${crop.name} (+${crop.sellPrice})`);
                          }}
                          disabled={qty <= 0}
                        >
                          Sell ×{qty}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </aside>

      {toast && <div className="fg-toast">{toast}</div>}
    </div>
  );
}

export type { FarmState };
