---
name: natan-push-deploy
description: Commit current work, push to main, deploy to Vercel production, and print the production URL. Use when the user asks to natan-push-deploy, push and deploy to prod, ship to main and production, or run the natan push-deploy workflow.
disable-model-invocation: true
---

# Natan Push Deploy

Commit current work, push to `main`, deploy to Vercel production, and print the production URL.

## Preconditions

- Working tree changes are intentional and ready to ship
- Vercel CLI is available and authenticated (`vercel whoami`)
- Repo root is linked to the `natan-games` Vercel project (`.vercel/project.json`)
- Monorepo Root Directory on Vercel is `apps/web`

If CLI is missing: install locally (e.g. `npm install vercel --prefix /tmp/vercel-cli --no-save`) and use that binary.

If not authenticated: run `vercel login` (or device login via `vercel whoami`) before continuing.

If not linked: from repo root run `vercel link --yes --project natan-games`.

## Workflow

Copy and track:

```
Natan push-deploy:
- [ ] 1. Inspect git state
- [ ] 2. Commit if needed
- [ ] 3. Sync and push main
- [ ] 4. Deploy production
- [ ] 5. Verify and print URL
```

### 1. Inspect git state

```bash
git status --porcelain
git branch --show-current
git fetch origin main
```

### 2. Commit if needed

If there are changes:

1. Stage relevant files (never stage `.env`, `.env.local`, secrets, or `.vercel` auth artifacts)
2. Commit with a concise message explaining why

```bash
git add -A
git status
git commit -m "$(cat <<'EOF'
<commit message>

EOF
)"
```

If nothing to commit, continue.

### 3. Sync and push main

Goal: `origin/main` contains this ship.

- If already on `main`: `git pull origin main` then `git push -u origin main`
- If on another branch: merge/rebase into `main`, then push `main`

```bash
git checkout main
git pull origin main
git merge <feature-branch>
git push -u origin main
git rev-parse --short HEAD
```

Do not force-push `main`.

### 4. Deploy production

From the **monorepo root** (not `apps/web`):

```bash
vercel deploy --prod --yes
```

Capture:

- Deployment URL (`*.vercel.app` from the command output)
- Production alias (line starting with `Aliased`, if present)
- Inspect URL
- `readyState` / status

### 5. Verify and print URL

```bash
vercel inspect <deployment-url>
vercel curl <production-alias-or-url> -- --max-time 30 -s -o /dev/null -w "%{http_code}\n"
vercel curl <production-alias-or-url>/games/farm -- --max-time 30 -s -o /dev/null -w "%{http_code}\n"
```

Prefer the stable production alias when printing (for example `https://natan-games-nchechiks-projects.vercel.app` or the `Aliased` host from deploy output). Fall back to the deployment URL if no alias exists.

## Required final output

Always end with this block (fill in real values):

```
## Natan Push Deploy
- **Commit**: <short-sha>
- **Branch**: main
- **Status**: READY | ERROR
- **Prod URL**: <production-alias-or-url>
- **Inspect**: <inspector-url>
```

If deploy fails, print the Prod URL as `n/a`, include a short error summary, and the last relevant build log lines.

## Notes

- This skill intentionally ships to **production**. Do not substitute a preview deploy.
- Plain `curl` may get `401`/`302` under Deployment Protection; use `vercel curl` for smoke checks.
- Observability gaps (no drains / error tracking) are warnings only — do not block deploy unless the user asks.
- For monorepo installs, project install command should remain: `cd ../.. && pnpm install`.
