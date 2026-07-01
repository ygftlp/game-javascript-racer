# UI Polish Multi-Agent Sync

This file records the current commercial UI polish pass and assigns concrete follow-up ownership.

## Current pass

The UI has moved from prototype interactions to a commercial mobile-game interaction pattern.

Implemented highlights:

- Buttons have pressed feedback, release-to-confirm behavior, and drag-outside cancellation.
- Main menu includes `选择赛道`, `操作说明`, `排行榜`, and `设置`.
- Main menu, track cards, settings cards, pause actions, help actions, and result actions use programmatic icons.
- `RacerUiIcons` owns fallback programmatic icons for play, track, leaderboard, help, settings, music, minimap, coach, sensitivity, reset, back, and share.
- `RacerUiIcons` avoids `roundRect` and uses internal paths for better WeChat Canvas compatibility.
- `RacerUiTheme` owns theme-tokenized icon and card metrics through `buttonIcon`, `trackCard`, `settingCard`, `statusPill`, and `icon` groups.
- `RacerUiRenderer` reads icon sizes, text offsets, card font sizes, and status-pill metrics from `RacerUiTheme` instead of hardcoding them in render methods.
- The old simple cycle-track behavior has been replaced with a dedicated track-select screen.
- The dedicated track-select screen shows track cards, target laps, current selected state, and `返回菜单`.
- The dedicated settings screen centralizes music, minimap, first-race operation-guide controls, and control sensitivity.
- The settings screen renders settings cards with title, description, status pill, enabled/disabled state, pressed feedback, and programmatic icons.
- `RacerControlSensitivity` owns three control sensitivity profiles: `舒适`, `标准`, and `灵敏`.
- `RacerSettings` persists the selected track id, audio state, minimap state, control coach state, control sensitivity id, and first-race coach state.
- `RacerScene` restores the last selected track and control sensitivity at launch.
- `RacerMiniMap` owns the independent track radar / curve preview component.
- `Pseudo3DRenderer` focuses on world rendering and delegates UI drawing.

## Agent A: UX Director

Focus:

- Verify menu, pause, result, help, minimap, dedicated track-select screen, and dedicated settings screen copy.
- Confirm programmatic icons improve scan speed without confusing casual players.
- Confirm theme-tokenized spacing preserves readability after future skin changes.

Checklist:

- Start button remains the clearest menu action.
- Settings and track selection do not compete with `开始比赛`.
- Programmatic icons match their action meanings.
- Theme-tokenized icon spacing does not make text look off-center.
- No debug or placeholder service copy appears in release mode.

## Agent B: UI Interaction Designer

Focus:

- Button press feedback.
- Touch cancel behavior.
- Icon/text balance.
- Theme-tokenized card and pill metrics.

Checklist:

- Press down visibly changes button state.
- Releasing inside executes the action.
- Moving outside cancels the action.
- Icon placement does not reduce perceived touch target size.
- `buttonIcon.textOffsetRatio` keeps button labels visually centered.
- Settings cards update status pill states immediately.
- `控制手感` cycles one profile per confirmed tap.

## Agent C: Track Systems Designer

Focus:

- Track registry design.
- Target-lap balance.
- Route difficulty progression.
- Per-track progression and score separation.

Checklist:

- `RACER_TRACKS` contains all selectable tracks.
- Selected track id is saved through `RacerSettings`.
- Best lap display is per track id through `RacerStorage`.
- If more than three tracks are added, the dedicated track-select screen must add pagination or scrolling.

## Agent D: Visual Designer

Focus:

- Commercial style layer.
- Programmatic icon readability.
- Theme-tokenized icon/card/status-pill tuning.
- Settings card and status pill style.

Checklist:

- Programmatic icons are readable at small sizes.
- Icon stroke weight matches text and button weight.
- `buttonIcon`, `trackCard`, `settingCard`, and `statusPill` tokens are the main knobs for final skin tuning.
- Settings card titles, descriptions, status pills, and icons fit small screens.
- Final icon assets can replace `RacerUiIcons` without changing layout.

## Agent E: Control Feel Designer

Focus:

- Joystick and brake feedback during driving.
- Control sensitivity profile tuning.
- Whether each selectable track feels fair with current controls.

Checklist:

- `舒适` is stable enough for beginners and small screens.
- `标准` preserves the current default street-racer feel.
- `灵敏` responds quickly without making the car uncontrollable.
- Track-specific curves remain controllable across all three sensitivity profiles.

## Agent F: Gameplay Readability QA

Focus:

- UI overlap and readability.
- Programmatic icon regression checks.
- Theme-tokenized metric regression checks.
- Renderer separation regression checks.

Checklist:

- Programmatic icons render on all target devices without Canvas API errors.
- Theme-tokenized button, track-card, setting-card, and status-pill metrics work on small and high-DPI devices.
- Settings screen opens from menu, toggles settings, cycles sensitivity, updates status pills, and returns safely.
- Track-select screen opens from menu, selects a track, and returns safely.
- Share / leaderboard payloads include selected track metadata.

## Agent G: Implementation Engineer

Focus:

- Keep code maintainable.
- Keep validation updated.
- Preserve shared layout/hitbox source of truth.
- Keep icon rendering and theme-tokenized metrics isolated from rendering internals.

Implemented files:

- `src/scenes/RacerScene.ts`
- `src/racer/Pseudo3DRenderer.ts`
- `src/racer/RacerUiRenderer.ts`
- `src/racer/RacerUiIcons.ts`
- `src/racer/RacerUiTheme.ts`
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

1. Add final UI logo when commercial art is ready.
2. Replace programmatic icons with final assets or keep them as fallback.
3. Tune `buttonIcon`, `trackCard`, `settingCard`, and `statusPill` from real-device screenshots.
4. Tune minimap size/opacity after real-device testing on all selectable tracks.
5. Tune sensitivity presets after device testing.
6. Add pagination or scrolling to the dedicated track-select screen if more than 3 tracks are added.
