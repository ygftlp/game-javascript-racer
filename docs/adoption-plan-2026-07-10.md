# CCGS Adoption Plan — JavaScript Racer

**Date**: 2026-07-10  
**Project**: `ygftlp/game-javascript-racer`  
**Workflow source**: Inspired by `Donchitos/Claude-Code-Game-Studios`  
**Mode**: Brownfield adoption / lightweight skill integration  
**Review mode**: `lean`

## 1. Current State

This repository already contains a playable browser racer with incremental demo pages and a final version:

- `index.html` links to the playable demo versions.
- `v4.final.html` is the current baseline vertical slice.
- `README.md` identifies the project as an OutRun-style pseudo-3D HTML5/JavaScript racer.
- `package.json` currently references `lite-game-engine` from `ygftlp/game-engine#feat/lightweight-2d-game-engine`.
- `.claude/skills/claude-code-game-studios/SKILL.md` exists as a lightweight project-specific skill.

The project does **not** yet appear to have full CCGS-format artifacts such as complete GDDs, ADRs, sprint plans, QA evidence, or release checklists.

## 2. Stage Decision

Set `production/stage.txt` to:

```text
Concept
```

Reason: although playable code exists, the project has not yet been adopted into the CCGS artifact pipeline. The immediate goal is to document and organize the existing prototype before production-level refactoring or feature expansion.

## 3. Recommended Workflow

Use this order:

1. `/claude-code-game-studios adopt` — audit current files and confirm gaps.
2. `/claude-code-game-studios design` — formalize the current racer into GDD docs.
3. `/claude-code-game-studios architecture` — document runtime, rendering, input, and asset decisions.
4. `/claude-code-game-studios story` — convert approved design/architecture work into small implementation stories.
5. `/claude-code-game-studios qa` — define smoke checks before code refactors.
6. `/claude-code-game-studios dev` — implement one story at a time.
7. `/claude-code-game-studios review` — review design fit, scope fit, architecture fit, playability, and licensing concerns.

## 4. Blocking / High-Priority Gaps

- [ ] Create a concise GDD for the existing racer loop.
- [ ] Create an architecture decision explaining whether to preserve static HTML5 Canvas or migrate to the `lite-game-engine` dependency.
- [ ] Create a manual smoke checklist for the existing demo pages.
- [ ] Document asset and music license risks before commercial use.
- [ ] Decide whether the future commercial version keeps the tutorial demo pages or creates a separate production entry point.

## 5. Suggested First Sprint

### Goal

Stabilize the existing racer as a documented vertical slice without changing gameplay behavior.

### Candidate Stories

1. Document the current game concept and core loop.
2. Document the current rendering/input/audio architecture.
3. Add a smoke checklist for `index.html` and `v4.final.html`.
4. Identify all commercial-use asset risks.
5. Create a refactor plan for separating configuration, game loop, renderer, input, and asset loading.

## 6. Guardrails

- Do not rewrite `v4.final.html` until the baseline has a smoke checklist.
- Do not remove demo pages without a migration decision.
- Do not rely on current placeholder sprites/music for commercial release until licenses are reviewed.
- Keep changes small and browser-testable.

## 7. Next Recommended Action

Run the project skill in adoption mode:

```text
/claude-code-game-studios adopt
```

Then use the findings to create or refine stories under `production/epics/`.
