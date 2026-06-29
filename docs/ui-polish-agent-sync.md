# UI Polish Multi-Agent Sync

This file records the current commercial UI polish pass and assigns concrete follow-up ownership.

## Current pass

The UI has moved from prototype interactions to a more commercial mobile-game interaction pattern:

- Buttons now have a pressed state.
- Overlay actions execute on touch end, not immediately on touch start.
- Dragging away from a button cancels the pending action.
- Primary buttons have a glow treatment.
- Pause button has a pressed state.
- Brake button has stronger active feedback.
- Modal panels have vignette, shadow, accent stripe, and bottom divider.
- Result screen shows a race grade.
- Main menu now includes `操作说明`.
- Help screen explains steering, braking, pause, and 3-lap objective.
- Pause screen now includes `返回菜单`.
- First race shows a short control coach hint during gameplay.
- `RacerUiRenderer` now owns HUD, controls, overlays, help, and onboarding UI.
- `RacerMiniMap` now owns the independent track radar / curve preview component.
- `Pseudo3DRenderer` now focuses on backdrop, road, world sprites, and player car rendering, then delegates UI drawing.

## Agent A: UX Director

Focus:

- Verify the press-to-confirm flow feels natural.
- Confirm menu copy, pause copy, result copy, help copy, and minimap labels are player-facing and not technical.
- Decide whether `极速公路` is final or temporary branding.

Checklist:

- Start button is the clearest menu action.
- Help is easy to find but does not compete with `开始比赛`.
- Pause screen primary action is `继续比赛`.
- Result screen primary action is `再来一局`.
- Minimap label `赛道雷达` is understandable and not distracting.
- No debug or placeholder service copy appears in release mode.

## Agent B: UI Interaction Designer

Focus:

- Button press feedback.
- Touch cancel behavior.
- Button spacing and hit target comfort.
- Help and return-menu safety flows.

Checklist:

- Press down visibly changes button state.
- Releasing inside executes the action.
- Moving outside cancels the action.
- Help screen start/back buttons are clear.
- Pause return-menu action does not trigger accidentally.
- Buttons do not feel jumpy or delayed.
- Pause button press is visible but not distracting.

## Agent C: Visual Designer

Focus:

- Commercial style layer.
- Modal hierarchy.
- Button state system.
- Help/onboarding readability.
- Minimap / track radar readability.
- Future icon/logo integration through the UI renderer.

Checklist:

- Modal panel has enough contrast over gameplay.
- Primary CTA has stronger visual weight than secondary buttons.
- The gold accent is used consistently.
- Help screen looks like part of the game, not documentation pasted into the canvas.
- Minimap looks like part of the HUD, not a debug graph.
- Result rating feels rewarding, not debug-like.
- Future icons can replace text labels without changing layout.

## Agent D: Control Feel Designer

Focus:

- Joystick and brake feedback during driving.
- Whether hiding `STEER` improves or hurts first-time understanding.
- Whether the first-race control coach is enough.
- Whether the minimap helps anticipate curves without distracting from controls.

Checklist:

- Joystick is easy to find without text.
- Brake button active state is obvious.
- First-race coach does not cover the car or road hazards.
- Minimap does not compete with joystick or brake attention.
- Controls do not block the player car or near-road hazards.
- Left/right steering comfort is acceptable on small devices.

## Agent E: Gameplay Readability QA

Focus:

- UI overlap and readability.
- Car visibility under UI and road effects.
- Onboarding flow safety.
- Minimap readability and obstruction checks.
- Renderer separation regression checks.

Checklist:

- Player car remains visible during curves, hills, collisions, and lap wraparound.
- HUD/minimap does not cover important traffic.
- Minimap curve preview gives useful left/right/straight information.
- Nearby traffic dots do not look like debug noise.
- Control coach disappears automatically and can be dismissed by driving input.
- Overlay transitions do not leave stale pressed states.
- Result screen appears after 3 laps without input glitches.
- Extracting `RacerUiRenderer` does not change visual order: world first, player car, then UI.

## Agent F: Implementation Engineer

Focus:

- Keep code maintainable.
- Keep validation updated.
- Preserve shared layout/hitbox source of truth.
- Keep world rendering and UI rendering separated.
- Keep minimap as an independent component.

Implemented files:

- `src/scenes/RacerScene.ts`
- `src/racer/Pseudo3DRenderer.ts`
- `src/racer/RacerUiRenderer.ts`
- `src/racer/RacerMiniMap.ts`
- `src/racer/RacerUiFlags.ts`
- `src/racer/RacerUiLayout.ts`
- `scripts/validate-production.mjs`

Next recommended implementation pass:

1. Add final icon assets for pause/music/share/leaderboard/help.
2. Add optional settings overlay for music and control help.
3. Persist whether the first-race coach has already been shown.
4. Add final UI logo when commercial art is ready.
5. Move repeated visual constants into UI theme tokens before the final skin pass.
6. Tune minimap size/opacity after real-device testing.
