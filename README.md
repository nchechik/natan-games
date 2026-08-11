# Natan Games

Monorepo for web games — built to grow into a catalog of playable titles.

## Structure

```
apps/web            Next.js hub + game host
packages/game-core  Shared types, save helpers, economy utilities
packages/farm-game  Hay Day–style farm game (first title)
```

## Games

| Game | Path | Status |
|------|------|--------|
| Sunny Acre Farm | `/games/farm` | Playable MVP |

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — start the web app
- `pnpm build` — build all packages and apps
- `pnpm typecheck` — TypeScript check across the workspace
