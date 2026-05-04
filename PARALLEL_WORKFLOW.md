# Parallel Workflow

This repo is set up for parallel iteration using one branch and one worktree per track.

## Base Branch

- `wip/parallel-base-2026-05-03`
  - current shared base for parallel experiments
  - includes the latest local checkpointed work

## Active Worktrees

- `/Users/as/DesignBuildShip/FinalProject`
  - branch: `wip/parallel-base-2026-05-03`
  - purpose: integration, review, and shared docs

- `/Users/as/DesignBuildShip/FinalProject-ui`
  - branch: `feat/ui-polish`
  - purpose: popup/calendar/content-script UI consistency and polish

- `/Users/as/DesignBuildShip/FinalProject-flow`
  - branch: `feat/registration-feedback-flow`
  - purpose: registration and feedback navigation flow improvements

- `/Users/as/DesignBuildShip/FinalProject-data`
  - branch: `feat/scraper-storage-improvements`
  - purpose: scraper robustness, storage behavior, and schedule naming logic

## Recommended Ownership

- `feat/ui-polish`
  - `src/popup/*`
  - `src/calendar/components/*`
  - visual consistency only

- `feat/registration-feedback-flow`
  - `src/content/components/CourseActions.tsx`
  - registration / feedback links
  - button behavior and navigation flow

- `feat/scraper-storage-improvements`
  - `src/content/scraper.ts`
  - `src/shared/storage.ts`
  - `src/shared/utils.ts`
  - data and naming semantics

Try to avoid editing the same files in multiple worktrees at the same time.

## Common Commands

List worktrees:

```bash
git worktree list
```

Open a specific branch/worktree:

```bash
cd /Users/as/DesignBuildShip/FinalProject-ui
git status
```

Build in a specific worktree:

```bash
cd /Users/as/DesignBuildShip/FinalProject-flow
npm run build
```

Merge a finished branch:

```bash
cd /Users/as/DesignBuildShip/FinalProject
git checkout wip/parallel-base-2026-05-03
git merge feat/ui-polish
```

Remove a finished worktree:

```bash
git worktree remove /Users/as/DesignBuildShip/FinalProject-ui
git branch -d feat/ui-polish
```

## Environment Notes

This project does not currently use checked-in `.env` files.

If a branch needs branch-specific settings later, create an untracked `.env.local` inside that worktree only. For example:

```bash
cd /Users/as/DesignBuildShip/FinalProject-ui
touch .env.local
```

That keeps experiment-specific configuration isolated per worktree.
