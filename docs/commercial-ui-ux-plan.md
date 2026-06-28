# Commercial UI / UX Plan

This document is the source of truth for turning the WeChat racer UI from a functional prototype into a commercial-release interface.

## Product goal

Create a mobile-first arcade racing UI that feels polished, readable, responsive, and monetization-ready without blocking core gameplay.

The target player should understand these things within 3 seconds:

1. How to start.
2. How to steer.
3. How to brake.
4. How to pause.
5. How race progress and result are measured.

## Design pillars

### 1. Gameplay first

The road, player car, traffic, obstacles, and upcoming curves must remain visually dominant. UI should never hide the player car or near-road hazards.

### 2. Thumb-friendly controls

The game is landscape. Controls should match natural thumb positions:

- Left thumb: steering joystick.
- Right thumb: brake / future boost.
- Right upper safe area: pause.

### 3. WeChat-safe layout

No essential button can overlap the top-right WeChat capsule area. All touch targets need a safe margin around the capsule and screen edges.

### 4. Commercial polish

Prototype text boxes are not acceptable for release. Menus need consistent typography, hierarchy, shadows, accent colors, and clear primary actions.

### 5. Replaceable art system

The UI must work with the current legacy placeholder pack, but final release needs commercial-safe art. Do not hardcode visual assumptions that make asset replacement difficult.

## Screen map

### Main menu

Purpose: create a professional first impression and drive the player into the game.

Required layout:

- Background: live or static racing background with dark overlay.
- Title: game logo / `Retro Racer` placeholder until final logo exists.
- Subtitle: short positioning, for example `Arcade Pseudo-3D Racing`.
- Primary CTA: `开始比赛`.
- Secondary CTA: `排行榜`.
- Utility: `音乐：开/关`.
- Small note: only show legacy/commercial-safe status in test builds. Hide it for final release.

Release requirement:

- The primary button must be the most visually obvious element.
- The menu must not look like a debug panel.
- No English/Chinese mixed copy in the final release unless intentionally branded.

### In-game HUD

Purpose: display only what the player needs while driving.

Required layout:

- Top-left compact card:
  - Speed.
  - Lap.
  - Current time.
  - Best time.
- Thin progress bar below the HUD card.
- Right-side capsule-safe pause icon.
- Do not show asset loading/debug text in final release. Move debug status behind a dev flag.

Release requirement:

- HUD opacity should be low enough to preserve road visibility.
- HUD text must remain readable on bright backgrounds.
- HUD must not cover the player car, road center, or near-traffic area.

### Driving controls

Purpose: make input obvious and comfortable.

Required layout:

- Left-bottom virtual joystick.
- Right-bottom brake button.
- Future optional right-side boost button, only after the base controls feel good.

Joystick requirements:

- Large enough for thumbs on small phones.
- Low dead zone.
- Clear active / inactive state.
- Auto-centers on release.
- Must not block the player car.

Brake requirements:

- Large circular target.
- Clear pressed visual state.
- Does not conflict with pause or result buttons.

### Pause overlay

Purpose: let the player recover or restart without confusion.

Required actions:

- Continue.
- Restart.
- Music on/off.
- Optional return to main menu later.

Release requirement:

- `继续` is the primary action.
- Restart must be visually secondary to avoid accidental restarts.
- Overlay should dim gameplay but still feel connected to the racing scene.

### Result overlay

Purpose: reward completion and encourage replay/share.

Required content:

- Completion title.
- Total time.
- Best lap.
- Collision count if exposed in UI.
- Optional rating medal later: S / A / B.

Required actions:

- Play again.
- Share.
- Leaderboard.

Release requirement:

- `再来一局` is the primary action.
- Share and leaderboard entries should be visible but not intrusive.
- The result screen should feel celebratory, not like a debug summary.

## Visual language

### Style direction

Retro arcade racing with modern mobile readability.

### Colors

Recommended palette roles:

- Background panel: dark blue/black, semi-transparent.
- Primary accent: warm yellow/gold.
- Danger/action accent: orange/red for brake.
- Text: white and soft gray.
- Stroke: subtle white translucent outlines.

### Typography

Current Canvas font can stay temporarily, but final UI should use a bundled commercial-safe font or a consistent system fallback.

Hierarchy:

- Game title: largest and boldest.
- Primary CTA: bold and high contrast.
- HUD: compact and readable.
- Notes/debug: hidden in release mode.

### Icons

Required before release:

- Pause icon.
- Music on/off icon.
- Leaderboard icon.
- Share icon.
- Brake can stay text-based if visual style is strong.

## Interaction requirements

### Touch targets

Minimum recommended logical size:

- Primary button: 220 x 52.
- Secondary button: 200 x 48.
- Pause circle: 48 diameter or larger.
- Joystick base: 150 diameter or larger.
- Brake: 96 diameter or larger.

### Feedback

Every interactive control should have immediate feedback:

- Button pressed state.
- Joystick active state.
- Brake active state.
- Menu confirm sound if available.

### Safety

- No accidental restart from tapping outside result buttons.
- No gameplay touch should activate pause accidentally.
- App hide should pause the game.
- Touch end/cancel should reset joystick and brake.

## Debug vs release mode

Debug-only UI:

- Asset status.
- Commercial-safe flag.
- Performance profile.
- Any fallback rendering warning.

Release UI:

- Hide debug status.
- Show only game-facing copy.
- Keep error/fallback details in console or QA overlay, not player-facing HUD.

Recommended next implementation: add `RacerUiMode` or `RACER_UI_FLAGS` so debug lines can be disabled for release builds.

## Multi-agent work plan

### Agent A: UX Director

Owns:

- Overall screen hierarchy.
- Copywriting tone.
- Release vs debug UI decisions.

Deliverables:

- Final screen map.
- Final in-game HUD content.
- Button priority rules.

### Agent B: Control Feel Designer

Owns:

- Joystick size, position, dead zone, sensitivity.
- Brake size, position, feedback.
- Comfort on small and large devices.

Deliverables:

- Control tuning table.
- Device testing notes.
- Recommended values for `RacerUiLayout`, `RacerJoystick`, and `RacerState`.

### Agent C: UI Visual Designer

Owns:

- Panel style.
- Button style.
- Typography hierarchy.
- Icons and final art direction.

Deliverables:

- Visual spec for menus/HUD/buttons.
- Required UI asset list.
- Final color palette.

### Agent D: Gameplay Readability QA

Owns:

- Player car visibility.
- Traffic readability.
- UI overlap checks.
- Road/hazard readability.

Deliverables:

- Screenshot checklist.
- Edge-case videos or screenshots.
- Bug list for visibility and UI obstruction.

### Agent E: Commercial Asset Producer

Owns:

- Replacing legacy art.
- Logo / UI icons.
- Commercial-safe proof.

Deliverables:

- `assets/packs/default` release art.
- UI icon set.
- Licensing notes.

### Agent F: Monetization UX Designer

Owns:

- Share placement.
- Leaderboard placement.
- Ad entry points.
- Non-intrusive monetization flow.

Deliverables:

- Ad timing rules.
- Share/leaderboard copy.
- Fail-safe behavior when ads or platform services are unavailable.

### Agent G: Implementation Engineer

Owns:

- Translating the plan into `RacerUiLayout`, `Pseudo3DRenderer`, and `RacerScene`.
- Maintaining shared hitboxes.
- Keeping validation scripts updated.

Deliverables:

- Code changes.
- Validation checks.
- Build/test notes.

## Release acceptance checklist

The UI/UX can be considered release-ready when:

- A new player can start and understand controls without external instruction.
- Player car never disappears.
- Main menu looks like a game, not a debug tool.
- HUD does not block the road or player car.
- Joystick and brake are comfortable for at least 10 minutes of play.
- Pause, restart, share, leaderboard, and music controls are understandable.
- WeChat capsule does not cover any game control.
- Debug text is hidden in release mode.
- All visible art and UI assets are commercial-safe.
- UI remains readable on low-end and high-DPI devices.
