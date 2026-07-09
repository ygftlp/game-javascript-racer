# ADR-0001 — Preserve Browser Canvas Baseline Before Refactor

## Status

Proposed

## Context

The repository already contains a working pseudo-3D racer implemented as static HTML, JavaScript, CSS, and assets. The final playable baseline is currently `v4.final.html`.

The code is educational/demo-oriented and keeps significant game logic inside HTML script blocks. This makes the project approachable, but it also makes larger feature work harder to manage.

`package.json` references `lite-game-engine` from `ygftlp/game-engine#feat/lightweight-2d-game-engine`, but the existing playable demo should remain the behavioral baseline until a migration decision is made.

## Decision

Preserve the existing browser Canvas implementation as the baseline vertical slice before any major refactor or migration.

Refactor work should happen incrementally and should keep the current playable behavior testable after each step.

## Options Considered

### Option A — Preserve static HTML5 Canvas baseline first

Pros:

- Lowest risk to current playability.
- Easy manual testing in a browser.
- Keeps the original tutorial/demo structure intact.
- Allows documentation and QA to catch up before code movement.

Cons:

- Existing global state and embedded scripts remain temporarily.
- New feature work must avoid adding more coupling.

### Option B — Immediately migrate to `lite-game-engine`

Pros:

- Could create cleaner runtime boundaries earlier.
- Aligns with the dependency already present in `package.json`.

Cons:

- Higher risk of breaking the working racer.
- Requires a migration plan and test baseline first.
- May obscure whether regressions come from refactor or engine adoption.

## Consequences

- `v4.final.html` remains the behavioral reference until a later ADR approves migration.
- Before refactoring, create smoke checks that define expected behavior.
- New architecture work should first extract configuration, input, renderer, game loop, and asset loading boundaries without changing gameplay feel.

## ADR Dependencies

None.

## Engine Compatibility

- Browser runtime: HTML5 Canvas 2D.
- JavaScript style: currently ES5/global-script style.
- Future migration candidate: `lite-game-engine`, pending separate ADR.

## GDD Requirements Addressed

- Preserve current player fantasy and arcade driving feel.
- Keep the game playable in-browser.
- Improve maintainability before expanding scope.

## Performance Implications

Preserving the existing renderer avoids introducing unknown performance regressions. Any later modularization must compare frame rate, draw distance behavior, and visual correctness against `v4.final.html`.
