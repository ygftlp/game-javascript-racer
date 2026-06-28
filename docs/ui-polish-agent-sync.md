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

## Agent A: UX Director

Focus:

- Verify the press-to-confirm flow feels natural.
- Confirm menu copy, pause copy, result copy, and help copy are player-facing and not technical.
- Decide whether `极速公路` is final or temporary branding.

Checklist:

- Start button is the clearest menu action.
- Help is easy to find but does not compete with `开始比赛`.
- Pause screen primary action is `继续比赛`.
- Result screen primary action is `再来一局`.
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

Checklist:

- Modal panel has enough contrast over gameplay.
- Primary CTA has stronger visual weight than secondary buttons.
- The gold accent is used consistently.
- Help screen looks like part of the game, not documentation pasted into the canvas.
- Result rating feels rewarding, not debug-like.
- Future icons can replace text labels without changing layout.

## Agent D: Control Feel Designer

Focus:

- Joystick and brake feedback during driving.
- Whether hiding `STEER` improves or hurts first-time understanding.
- Whether the first-race control coach is enough.

Checklist:

- Joystick is easy to find without text.
- Brake button active state is obvious.
- First-race coach does not cover the car or road hazards.
- Controls do not block the player car or near-road hazards.
- Left/right steering comfort is acceptable on small devices.

## Agent E: Gameplay Readability QA

Focus:

- UI overlap and readability.
- Car visibility under UI and road effects.
- Onboarding flow safety.

Checklist:

- Player car remains visible during curves, hills, collisions, and lap wraparound.
- HUD does not cover important traffic.
- Control coach disappears automatically and can be dismissed by driving input.
- Overlay transitions do not leave stale pressed states.
- Result screen appears after 3 laps without input glitches.

## Agent F: Implementation Engineer

Focus:

- Keep code maintainable.
- Keep validation updated.
- Preserve shared layout/hitbox source of truth.

Implemented files:

- `src/scenes/RacerScene.ts`
- `src/racer/Pseudo3DRenderer.ts`
- `src/racer/RacerUiFlags.ts`
- `src/racer/RacerUiLayout.ts`
- `scripts/validate-production.mjs`

Next recommended implementation pass:

1. Extract a real `RacerUiRenderer` from `Pseudo3DRenderer` so world rendering and UI rendering are separate.
2. Add final icon assets for pause/music/share/leaderboard/help.
3. Add optional settings overlay for music and control help.
4. Persist whether the first-race coach has already been shown.
5. Add final UI logo when commercial art is ready.
