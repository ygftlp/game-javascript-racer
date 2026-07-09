# Optimization & Troubleshooting Audit — JavaScript Racer

**Date**: 2026-07-10  
**Workflow**: `.claude/skills/claude-code-game-studios/SKILL.md` lightweight CCGS process  
**Focus**: Safe optimization, browser playability, refactor readiness

## Summary

This pass follows the project skill's brownfield rule: preserve the playable baseline first, fix low-risk runtime issues, and document higher-risk changes before larger refactors.

## Files Reviewed

- `README.md`
- `package.json`
- `.claude/skills/claude-code-game-studios/SKILL.md`
- `common.js`
- `v4.final.html`
- `production/qa/smoke-checklist.md`

## Fixes Applied

### 1. Prevent arrow-key page scrolling

**File**: `common.js`

The shared keyboard handler now returns whether it handled a key and calls `ev.preventDefault()` for mapped gameplay keys. This keeps arrow keys focused on steering/acceleration instead of scrolling the page.

### 2. Harden audio autoplay handling

**File**: `common.js`

Modern browsers may block `music.play()` until a user gesture. The shared audio helper now catches the play promise rejection so the game remains playable without noisy unhandled promise errors.

### 3. Add localStorage fallback

**File**: `common.js`

`window.localStorage` access is now wrapped in a small fallback. This avoids breaking mute / fastest-lap storage when local storage is unavailable or blocked by browser settings.

### 4. Add static audit command

**Files**: `package.json`, `tools/audit-racer.js`

New commands:

```text
npm run audit
npm run audit:strict
```

Default mode reports findings and exits successfully for planning. Strict mode fails on high-severity findings and can be used later as a quality gate.

## Findings Still Open

### HIGH — undeclared `index` in traffic update

**File**: `v4.final.html`

`updateCars()` assigns to `index` without a local declaration when moving traffic cars between road segments. This leaks a global variable and should be fixed with a local declaration.

Recommended change:

```js
function updateCars(dt, playerSegment, playerW) {
  var n, car, oldSegment, newSegment, index;
  ...
}
```

This is intentionally tracked by `tools/audit-racer.js` so it stays visible until fixed.

### HIGH — commercial asset risk remains

**Files**: `README.md`, `music/`, `images/`

The README already warns that music is licensed only for this project and current sprites are placeholder/borrowed teaching assets. Do not commercialize this build until replacement assets or clear commercial licenses are available.

## Recommended Next Optimization Stories

1. Fix the local `index` declaration in `v4.final.html`.
2. Run the smoke checklist manually in a browser.
3. Extract gameplay tuning constants from `v4.final.html` into a named config object.
4. Split `v4.final.html` into modules only after smoke checks pass.
5. Add a commercial asset replacement manifest.

## Manual Smoke Checks After This Pass

- [ ] Open `v4.final.html`.
- [ ] Use arrow keys and confirm the page does not scroll while driving.
- [ ] Confirm the game still renders and updates FPS.
- [ ] Toggle mute and confirm no console error is thrown.
- [ ] Run `npm run audit` and review findings.
