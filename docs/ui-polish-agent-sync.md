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
- Main menu now includes `选择赛道` and `设置`.
- Main menu, track cards, settings cards, pause actions, help actions, and result actions now use programmatic icons.
- `RacerUiIcons` owns fallback programmatic icons for play, track, leaderboard, help, settings, music, minimap, coach, sensitivity, reset, back, and share.
- `RacerUiIcons` avoids `roundRect` and uses internal paths for better WeChat Canvas compatibility.
- The old simple cycle-track behavior has been replaced with a dedicated track-select screen.
- The dedicated track-select screen shows track cards, target laps, current selected state, and `返回菜单`.
- The dedicated settings screen centralizes music, minimap, first-race operation-guide controls, and control sensitivity.
- The settings screen renders settings cards with title, description, status pill, enabled/disabled state, pressed feedback, and programmatic icons.
- `RacerControlSensitivity` owns three control sensitivity profiles: `舒适`, `标准`, and `灵敏`.
- The settings screen cycles control sensitivity and persists the selected profile.
- `RacerJoystick` applies selected `joystickGain` and `steerInputLimit`.
- `RacerState` applies selected `steerResponse` and input clamp.
- `RacerTrackDefinition` owns a three-track registry: `极速公路`, `海岸冲刺`, and `城市夜跑`.
- `RacerScene` opens the dedicated track-select screen from the menu and rebuilds `RacerState` with the selected track.
- `RacerScene` opens the dedicated settings screen from the menu and persists setting changes.
- `RacerSettings` persists the selected track id, audio state, minimap state, control coach state, control sensitivity id, and whether the first-race coach has already been shown.
- `RacerScene` restores the last selected track and control sensitivity at launch.
- `RacerStorage` stores best lap records per track id.
- `RaceResult` includes `trackId` and `trackName` for share / leaderboard payloads.
- Touch start/move/end handlers tolerate empty platform touch arrays.
- First race shows a short control coach hint during gameplay and persists that it has already been shown.
- The settings screen can disable or reset the first-race operation guide.
- `RacerUiFlags` exposes `showMiniMap` and `showFirstRaceCoach` release toggles.
- The persisted minimap setting controls whether the independent minimap renders during gameplay.
- `RacerUiRenderer` owns HUD, controls, overlays, help, onboarding UI, track-select UI, settings UI, and programmatic icon placement.
- `RacerMiniMap` owns the independent track radar / curve preview component.
- `Pseudo3DRenderer` focuses on backdrop, road, world sprites, and player car rendering, then delegates UI drawing.

## Agent A: UX Director

Focus:

- Verify the press-to-confirm flow feels natural.
- Confirm menu copy, pause copy, result copy, help copy, minimap labels, track-select copy, and settings copy are player-facing and not technical.
- Confirm programmatic icons improve scan speed without confusing casual players.
- Decide whether `极速公路` is final or temporary branding.

Checklist:

- Start button is the clearest menu action.
- Track selection is clear but does not compete with `开始比赛`.
- Settings is easy to find but does not compete with `开始比赛`.
- Help is easy to find but does not compete with `开始比赛`.
- Pause screen primary action is `继续比赛`.
- Result screen primary action is `再来一局`.
- Minimap label `赛道雷达` is understandable and not distracting.
- Control sensitivity labels `舒适 / 标准 / 灵敏` are understandable to casual players.
- Settings card titles and descriptions explain the impact of each setting quickly.
- Programmatic icons match their action meanings.
- First-race coach should only appear once per player unless reset in settings.
- No debug or placeholder service copy appears in release mode.

## Agent B: UI Interaction Designer

Focus:

- Button press feedback.
- Touch cancel behavior.
- Button spacing and hit target comfort.
- Icon/text balance.
- Help, track-select, settings, and return-menu safety flows.

Checklist:

- Press down visibly changes button state.
- Releasing inside executes the action.
- Moving outside cancels the action.
- Icon placement does not reduce perceived touch target size.
- `选择赛道` opens the dedicated track-select screen.
- Track cards select exactly one track per confirmed tap.
- Track-select `返回菜单` does not change the selected track.
- `设置` opens the dedicated settings screen.
- Settings cards update status pills immediately after confirmed tap.
- `控制手感` cycles one profile per confirmed tap.
- Settings `返回菜单` returns without changing unrelated state.
- Relaunching the game restores the last selected track and settings.
- Help screen start/back buttons are clear.
- Pause return-menu action does not trigger accidentally.
- Cards and buttons do not feel jumpy or delayed.
- Pause button press is visible but not distracting.

## Agent C: Track Systems Designer

Focus:

- Track registry design.
- Target-lap balance.
- Route difficulty progression.
- Future track unlock / paginated selection screen.
- Per-track progression and score separation.

Checklist:

- `RACER_TRACKS` contains all selectable tracks.
- Each track has a clear name, id, description, sections, road theme, roadside theme, and target laps.
- `海岸冲刺` is shorter and faster than the default track.
- `城市夜跑` has a denser curve rhythm and remains playable on mobile controls.
- Target laps fit session length.
- Track selection resets road state before a race starts.
- Selected track id is saved through `RacerSettings`.
- Best lap display is per track id through `RacerStorage`.
- If more than three tracks are added, the dedicated track-select screen must add pagination or scrolling.

## Agent D: Visual Designer

Focus:

- Commercial style layer.
- Modal hierarchy.
- Button state system.
- Programmatic icon readability.
- Help/onboarding readability.
- Track-select card readability.
- Settings screen readability.
- Settings card and status pill style.
- Minimap / track radar readability.
- Future icon/logo integration through the UI renderer.

Checklist:

- Modal panel has enough contrast over gameplay.
- Primary CTA has stronger visual weight than secondary buttons.
- The gold accent is used consistently.
- Programmatic icons are readable at small sizes.
- Icon stroke weight matches text and button weight.
- Track-select card text and icon fit small screens.
- Settings card titles, descriptions, status pills, and icons fit small screens.
- Enabled status is obvious without looking like debug text.
- Disabled status is readable but visually quieter.
- Control sensitivity row is readable and does not make the settings panel feel crowded.
- Selected track state is obvious without looking like debug text.
- Help screen looks like part of the game, not documentation pasted into the canvas.
- Minimap looks like part of the HUD, not a debug graph.
- Result rating feels rewarding, not debug-like.
- Final icon assets can replace `RacerUiIcons` without changing layout.

## Agent E: Control Feel Designer

Focus:

- Joystick and brake feedback during driving.
- Control sensitivity profile tuning.
- Whether hiding `STEER` improves or hurts first-time understanding.
- Whether the first-race control coach is enough.
- Whether the minimap helps anticipate curves without distracting from controls.
- Whether each selectable track feels fair with current controls.

Checklist:

- `舒适` is stable enough for beginners and small screens.
- `标准` preserves the current default street-racer feel.
- `灵敏` responds quickly without making the car uncontrollable.
- Joystick is easy to find without text.
- Brake button active state is obvious.
- First-race coach does not cover the car or road hazards.
- Settings reset can make the first-race coach appear again on the next race.
- Disabling operation guide prevents the first-race coach from appearing.
- Minimap does not compete with joystick or brake attention.
- Disabling minimap removes the HUD radar during active driving.
- Controls do not block the player car or near-road hazards.
- Left/right steering comfort is acceptable on small devices.
- Track-specific curves remain controllable across all three sensitivity profiles.

## Agent F: Gameplay Readability QA

Focus:

- UI overlap and readability.
- Car visibility under UI and road effects.
- Onboarding flow safety.
- Track-select regression checks.
- Settings regression checks.
- Programmatic icon regression checks.
- Minimap readability and obstruction checks.
- Renderer separation regression checks.

Checklist:

- Player car remains visible during curves, hills, collisions, and lap wraparound on every selectable track.
- HUD/minimap does not cover important traffic.
- Minimap curve preview gives useful left/right/straight information on every selected track when enabled.
- Nearby traffic dots do not look like debug noise.
- Control coach disappears automatically, can be dismissed by driving input, and does not reappear after it is stored as shown unless reset in settings.
- Overlay transitions do not leave stale pressed states.
- Track-select screen opens from menu, selects a track, and returns safely.
- Settings screen opens from menu, toggles settings, cycles sensitivity, updates status pills, and returns safely.
- Programmatic icons render on all target devices without Canvas API errors.
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
- Keep track registry, selected track flow, settings flow, sensitivity tuning, and icon rendering isolated from rendering internals.

Implemented files:

- `src/scenes/RacerScene.ts`
- `src/racer/Pseudo3DRenderer.ts`
- `src/racer/RacerUiRenderer.ts`
- `src/racer/RacerUiIcons.ts`
- `src/racer/RacerMiniMap.ts`
- `src/racer/RacerControlSensitivity.ts`
- `src/racer/RacerJoystick.ts`
- `src/racer/RacerSettings.ts`
- `src/racer/RacerState.ts`
- `src/racer/RacerStorage.ts`
- `src/racer/RacerServices.ts`
- `src/racer/RacerTrackDefinition.ts`
- `src/racer/RacerUiFlags.ts`
- `src/racer/RacerUiLayout.ts`
- `scripts/validate-production.mjs`

Next recommended implementation pass:

1. Move repeated settings card colors and status pill tokens into `RacerUiTheme.ts` before the final skin pass.
2. Add final UI logo when commercial art is ready.
3. Replace programmatic icons with final assets or keep them as fallback.
4. Tune minimap size/opacity after real-device testing on all selectable tracks.
5. Tune sensitivity presets after device testing.
6. Add pagination or scrolling to the dedicated track-select screen if more than 3 tracks are added.
