# Epic — Racer Modernization Baseline

**Status**: Draft  
**Stage**: Concept → Systems Design  
**Last Updated**: 2026-07-10

## Goal

Prepare JavaScript Racer for safe future development by documenting the current playable baseline, adding smoke checks, and planning small refactors without changing gameplay behavior.

## Why This Matters

The racer already works as a browser demo, but feature expansion and commercial preparation require clearer design docs, architecture decisions, QA checks, and licensing review.

## Scope

In scope:

- Document current game concept and systems.
- Preserve `v4.final.html` as the baseline vertical slice.
- Add browser smoke checks.
- Record the first architecture decision.
- Identify asset/audio license risks.
- Prepare small follow-up stories for modularization.

Out of scope for this epic:

- Rewriting the game into a new engine.
- Replacing sprites or music.
- Adding new gameplay modes.
- Shipping a commercial release.

## Stories

- [ ] Story 1 — Validate CCGS adoption artifacts.
- [ ] Story 2 — Run the browser smoke checklist against the current baseline.
- [ ] Story 3 — Create a refactor plan for separating config, input, game loop, renderer, and assets.
- [ ] Story 4 — Review sprite/music licensing and list replacement needs.
- [ ] Story 5 — Decide whether to preserve static Canvas or migrate to `lite-game-engine` in a later ADR.

## Acceptance Criteria

- [ ] `production/stage.txt` and `production/review-mode.txt` exist.
- [ ] Initial GDD and systems index exist.
- [ ] First ADR exists.
- [ ] Smoke checklist exists.
- [ ] No gameplay source has been changed by the adoption-only work.
