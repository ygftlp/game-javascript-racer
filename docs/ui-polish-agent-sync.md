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
- Help screen explains steering, braking, pause, and dynamic target-lap objective.
- Pause screen now includes `返回菜单`.
- Main menu now includes `切换赛道`.
- `RacerTrackDefinition` now owns a three-track registry: `极速公路`, `海岸冲刺`, and `城市夜跑`.
- `RacerScene` now cycles selected tracks from the menu and rebuilds `RacerState` with the selected track.
- `RacerSettings` now persists the selected track id.
- `RacerScene` now restores the last selected track at launch.
- `RacerStorage` now stores best lap records per track id.
- `RaceResult` now includes `trackId` and `trackName` for share / leaderboard payloads.
- Touch start/move/end handlers now tolerate empty platform touch arrays.
- First race shows a short control coach hint during gameplay and persists that it has already been shown.
- `RacerUiFlags` now exposes `showMiniMap` and `showFirstRaceCoach` release toggles.
- `RacerUiRenderer` now owns HUD, controls, overlays, help, onboarding UI, and menu track selector UI.
- `RacerMiniMap` now owns the independent track radar / curve preview component.
- `Pseudo3DRenderer` now focuses on backdrop, road, world sprites, and player car rendering, then delegates UI drawing.

## Agent A: UX Director

Focus:

- Verify the press-to-confirm flow feels natural.
- Confirm menu copy, pause copy, result copy, help copy, minimap labels, and track selector labels are player-facing and not technical.
- Decide whether `极速公路` is final or temporary branding.

Checklist:

- Start button is the clearest menu action.
- Track switching is clear but does not compete with `开始比赛`.
- Help is easy to find but does not compete with `开始比赛`.
- Pause screen primary action is `继续比赛`.
- Result screen primary action is `再来一局`.
- Minimap label `赛道雷达` is understandable and not distracting.
- First-race coach should only appear once per player unless storage is cleared.
- No debug or placeholder service copy appears in release mode.

## Agent B: UI Interaction Designer

Focus:

- Button press feedback.
- Touch cancel behavior.
- Button spacing and hit target comfort.
- Help, track selector, and return-menu safety flows.

Checklist:

- Press down visibly changes button state.
- Releasing inside executes the action.
- Moving outside cancels the action.
- Track selector cycles exactly one track per confirmed tap.
- Relaunching the game restores the last selected track.
- Help screen start/back buttons are clear.
- Pause return-menu action does not trigger accidentally.
- Buttons do not feel jumpy or delayed.
- Pause button press is visible but not distracting.

## Agent C: Track Systems Designer

Focus:

- Track registry design.
- Target-lap balance.
- Route difficulty progression.
- Future track unlock / selection screen.
- Per-track progression and score separation.

Checklist:

- `RACER_TRACKS` contains all selectable tracks.
- Each track has a clear name, id, description, sections, road theme, roadside theme, and target laps.
- `海岸冲刺` is shorter and faster than the default track.
- `城市夜跑` has a denser curve rhythm and remains playable on mobile controls.
- Target laps fit session length.
- Track switching resets road state before a race starts.
- Selected track id is saved through `RacerSettings`.
- Best lap display is per track id through `RacerStorage`.

## Agent D: Visual Designer

Focus:

- Commercial style layer.
- Modal hierarchy.
- Button state system.
- Help/onboarding readability.
- Track selector readability.
- Minimap / track radar readability.
- Future icon/logo integration through the UI renderer.

Checklist:

- Modal panel has enough contrast over gameplay.
- Primary CTA has stronger visual weight than secondary buttons.
- The gold accent is used consistently.
- Track selector text fits small screens.
- Help screen looks like part of the game, not documentation pasted into the canvas.
- Minimap looks like part of the HUD, not a debug graph.
- Result rating feels rewarding, not debug-like.
- Future icons can replace text labels without changing layout.

## Agent E: Control Feel Designer

Focus:

- Joystick and brake feedback during driving.
- Whether hiding `STEER` improves or hurts first-time understanding.
- Whether the first-race control coach is enough.
- Whether the minimap helps anticipate curves without distracting from controls.
- Whether each selectable track feels fair with current controls.

Checklist:

- Joystick is easy to find without text.
- Brake button active state is obvious.
- First-race coach does not cover the car or road hazards.
- Minimap does not compete with joystick or brake attention.
- Controls do not block the player car or near-road hazards.
- Left/right steering comfort is acceptable on small devices.
- Track-specific curves remain controllable.

## Agent F: Gameplay Readability QA

Focus:

- UI overlap and readability.
- Car visibility under UI and road effects.
- Onboarding flow safety.
- Track selector regression checks.
- Minimap readability and obstruction checks.
- Renderer separation regression checks.

Checklist:

- Player car remains visible during curves, hills, collisions, and lap wraparound on every selectable track.
- HUD/minimap does not cover important traffic.
- Minimap curve preview gives useful left/right/straight information on every selected track.
- Nearby traffic dots do not look like debug noise.
- Control coach disappears automatically, can be dismissed by driving input, and does not reappear after it is stored as shown.
- Overlay transitions do not leave stale pressed states.
- Result screen appears at the selected track target-lap count.
- Share / leaderboard payloads include selected track metadata.
- Extracting `RacerUiRenderer` does not change visual order: world first, player car, then UI.

## Agent G: Implementation Engineer

Focus:

- Keep code maintainable.
- Keep validation updated.
- Preserve shared layout/hitbox source of truth.
- Keep world rendering and UI rendering separated.
- Keep minimap as an independent component.
- Keep track registry and selected track flow isolated from rendering internals.

Implemented files:

- `src/scenes/RacerScene.ts`
- `src/racer/Pseudo3DRenderer.ts`
- `src/racer/RacerUiRenderer.ts`
- `src/racer/RacerMiniMap.ts`
- `src/racer/RacerSettings.ts`
- `src/racer/RacerStorage.ts`
- `src/racer/RacerServices.ts`
- `src/racer/RacerTrackDefinition.ts`
- `src/racer/RacerUiFlags.ts`
- `src/racer/RacerUiLayout.ts`
- `scripts/validate-production.mjs`

Next recommended implementation pass:

1. Add final icon assets for pause/music/share/leaderboard/help/track.
2. Add optional settings overlay for music, minimap, and control help.
3. Add final UI logo when commercial art is ready.
4. Move repeated visual constants into UI theme tokens before the final skin pass.
5. Tune minimap size/opacity after real-device testing on all selectable tracks.
6. Replace the current simple track-cycle button with a dedicated track-select screen if more than 3 tracks are added.
