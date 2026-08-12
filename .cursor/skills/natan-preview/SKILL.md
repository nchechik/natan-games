---
name: natan-preview
description: Return an existing Vercel preview URL for the current branch, or create a preview deployment if none exists. Use when the user asks for natan-preview, /natan-preview, a preview URL, preview link, or to deploy a preview (not production).
disable-model-invocation: true
---

# Natan Preview

Return a **preview** URL for the current work. Reuse a ready preview if one already exists for this branch; otherwise create one with `vercel deploy` (never `--prod`).

## Preconditions

- Working tree changes for the preview are intentional (commit + push before deploy when the branch should match remote)
- Vercel CLI is available and authenticated (`vercel whoami`)
- Repo root is linked to the `natan-games` Vercel project (`.vercel/project.json`)
- Monorepo Root Directory on Vercel is `apps/web`

If CLI is missing: install locally (e.g. `npm install vercel --prefix /tmp/vercel-cli --no-save`) and use that binary. Prefer `export PATH="/tmp/vercel-cli/node_modules/.bin:$PATH"`.

If not authenticated: run `vercel login` (or device login via `vercel whoami`) before continuing.

If not linked: from repo root run `vercel link --yes --project natan-games`.

## Workflow

Copy and track:

```
Natan preview:
- [ ] 1. Inspect branch / commit
- [ ] 2. Commit and push if needed
- [ ] 3. Find existing preview
- [ ] 4. Create preview if missing
- [ ] 5. Verify and print URL
```

### 1. Inspect branch / commit

```bash
git status --porcelain
git branch --show-current
git rev-parse --short HEAD
git rev-parse HEAD
```

Note the current branch name and full commit SHA. Prefer staying on the feature branch (do **not** merge to `main` for this skill).

### 2. Commit and push if needed

If there are uncommitted changes that should be in the preview:

1. Stage relevant files (never stage `.env`, `.env.local`, secrets, or `.vercel` auth artifacts)
2. Commit with a concise message
3. Push the current branch: `git push -u origin <branch>`

If the branch has local commits not on the remote, push before deploying so the preview matches the branch HEAD.

If nothing to commit/push, continue.

### 3. Find existing preview

Goal: reuse a **Ready** Preview deployment for this branch when possible.

Try in order:

**A. GitHub PR checks / deployments (if a PR exists)**

```bash
gh pr view --json url,number,statusCheckRollup,headRefName 2>/dev/null
gh pr checks 2>/dev/null
```

If a Vercel Preview check or deployment URL is present and successful, use that URL.

**B. Vercel deployment list**

```bash
vercel ls natan-games
```

Inspect recent **Preview** (not Production) deployments:

```bash
vercel inspect <deployment-host-or-url>
```

Accept a deployment when all of the following hold:

- Environment / target is Preview (not Production)
- `readyState` is `READY` (or status Ready)
- It matches the current branch when meta/git info is available, **or** it was created from the same HEAD commit, **or** (fallback) it is the newest Ready Preview from this agent session for this branch after a push of the same SHA

If a Ready matching preview exists, **skip create** and go to step 5.

Do not treat Production aliases (for example `web-khaki-one-74.vercel.app` or `natan-games-nchechiks-projects.vercel.app`) as the preview URL for this skill.

### 4. Create preview if missing

From the **monorepo root** (not `apps/web`):

```bash
vercel deploy --yes
```

Do **not** pass `--prod`.

Capture from the output:

- Preview URL (`*.vercel.app`)
- Inspect URL
- `readyState` / status

If deploy fails, continue to the required final output with Status `ERROR`.

### 5. Verify and print URL

```bash
vercel inspect <preview-url>
vercel curl <preview-url> -- --max-time 30 -s -o /dev/null -w "%{http_code}\n"
vercel curl <preview-url>/games/farm -- --max-time 30 -s -o /dev/null -w "%{http_code}\n"
```

Also print the farm deep link: `<preview-url>/games/farm`.

## Required final output

Always end with this block (fill in real values):

```
## Natan Preview
- **Commit**: <short-sha>
- **Branch**: <current-branch>
- **Source**: existing | created
- **Status**: READY | ERROR
- **Preview URL**: <preview-url>
- **Farm**: <preview-url>/games/farm
- **Inspect**: <inspector-url>
```

If no preview could be found or created, set Preview URL / Farm / Inspect to `n/a`, Status `ERROR`, and include a short error summary plus the last relevant CLI lines.

## Notes

- This skill is **preview-only**. Never run `vercel deploy --prod` here; use `natan-push-deploy` for production.
- Plain `curl` may get `401`/`302` under Deployment Protection; use `vercel curl` for smoke checks.
- Prefer reusing an existing Ready preview for the same branch/commit over creating duplicate deployments.
- For monorepo installs, project install command should remain: `cd ../.. && pnpm install`.
