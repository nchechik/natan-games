export type GameId = "farm" | (string & {});

export type CurrencyId = "coins" | "gems" | "xp";

export interface PlayerWallet {
  coins: number;
  gems: number;
  xp: number;
  level: number;
}

export interface SaveEnvelope<TState> {
  version: number;
  gameId: GameId;
  updatedAt: number;
  state: TState;
}

export function xpForLevel(level: number): number {
  return Math.floor(80 * level * Math.pow(1.35, level - 1));
}

export function applyXp(wallet: PlayerWallet, amount: number): PlayerWallet {
  let { xp, level } = wallet;
  xp += amount;
  let needed = xpForLevel(level);
  while (xp >= needed) {
    xp -= needed;
    level += 1;
    needed = xpForLevel(level);
  }
  return { ...wallet, xp, level };
}

export function canAfford(wallet: PlayerWallet, cost: Partial<PlayerWallet>): boolean {
  if (cost.coins != null && wallet.coins < cost.coins) return false;
  if (cost.gems != null && wallet.gems < cost.gems) return false;
  return true;
}

export function spend(
  wallet: PlayerWallet,
  cost: Partial<Pick<PlayerWallet, "coins" | "gems">>,
): PlayerWallet | null {
  if (!canAfford(wallet, cost)) return null;
  return {
    ...wallet,
    coins: wallet.coins - (cost.coins ?? 0),
    gems: wallet.gems - (cost.gems ?? 0),
  };
}

export function loadSave<TState>(
  key: string,
  fallback: () => TState,
  version = 1,
): SaveEnvelope<TState> {
  if (typeof window === "undefined") {
    return {
      version,
      gameId: "farm",
      updatedAt: Date.now(),
      state: fallback(),
    };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {
        version,
        gameId: "farm",
        updatedAt: Date.now(),
        state: fallback(),
      };
    }
    const parsed = JSON.parse(raw) as SaveEnvelope<TState>;
    if (!parsed?.state || parsed.version !== version) {
      return {
        version,
        gameId: "farm",
        updatedAt: Date.now(),
        state: fallback(),
      };
    }
    return parsed;
  } catch {
    return {
      version,
      gameId: "farm",
      updatedAt: Date.now(),
      state: fallback(),
    };
  }
}

export function persistSave<TState>(key: string, envelope: SaveEnvelope<TState>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    key,
    JSON.stringify({ ...envelope, updatedAt: Date.now() }),
  );
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
