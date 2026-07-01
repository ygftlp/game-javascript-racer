# UI Polish Multi-Agent Sync

This file records the current commercial UI polish pass and assigns concrete follow-up ownership.

## Current pass

The UI has moved from prototype interactions to a commercial mobile-game interaction pattern.

Implemented highlights:

- Buttons have pressed feedback, release-to-confirm behavior, and drag-outside cancellation.
- Main menu includes `选择赛道`, `操作说明`, `排行榜`, and `设置`.
- Main-menu title supports an optional commercial logo asset and a programmatic logo fallback through `RacerUiLogo`.
- `RacerAssetManifest` defines optional `images.brandLogo` and the commercial template path `assets/packs/default/images/ui/logo.png`.
- `RacerAssets` loads the optional commercial logo asset without blocking the required background and sprite atlas.
- Main menu, track cards, settings cards, pause actions, help actions, and result actions support an optional commercial UI icon atlas and programmatic icon fallback.
- `RacerAssetManifest` defines optional `images.uiIconAtlas` and the commercial template path `assets/packs/default/images/ui/icons.png`.
- `RacerUiIconAtlas` owns the 4-column, 64px-cell atlas mapping for play, track, leaderboard, help, settings, music, minimap, coach, sensitivity, reset, back, and share.
- `RacerAssets` loads the optional commercial icon atlas and registers it through `RacerUiIcons.setIconAtlasTexture`.
- `RacerUiIcons` first tries to draw atlas icons, then falls back to programmatic icons if the atlas is missing, still loading, or fails to draw.
- `scripts/use-commercial-assets.mjs` adds a safe commercial asset pack switch flow.
- `npm run assets:commercial` checks required and optional commercial files without changing source.
- `npm run assets:commercial:apply` switches to `COMMERCIAL_TEMPLATE_ASSET_PACK` only when required commercial files exist.
- `npm run assets:legacy:apply` switches back to `LEGACY_RACER_ASSET_PACK` for QA rollback.
- `RacerUiTheme.brandLogo` owns image logo bounds, image shadow, programmatic logo plate, stripes, badge, title, and subtitle styling.
- `RacerUiRenderer` passes `assets.brandLogo` into the menu logo renderer.
- `RacerUiIcons` and `RacerUiLogo` avoid `roundRect` and use internal paths for better WeChat Canvas compatibility.
- `RacerUiTheme` owns theme-tokenized icon and card metrics through `buttonIcon`, `trackCard`, `settingCard`, `statusPill`, and `icon` groups.
- The old simple cycle-track behavior has been replaced with a dedicated track-select screen.
- The dedicated track-select screen shows track cards, target laps, current selected state, and `返回菜单`.
- The dedicated settings screen centralizes music, minimap, first-race operation-guide controls, and control sensitivity.
- The settings screen renders settings cards with title, description, status pill, enabled/disabled state, pressed feedback, and icon support.
- `RacerControlSensitivity` owns three control sensitivity profiles: `舒适`, `标准`, and `灵敏`.
- `RacerSettings` persists the selected track id, audio state, minimap state, control coach state, control sensitivity id, and first-race coach state.
- `RacerScene` restores the last selected track and control sensitivity at launch.
- `RacerMiniMap` owns the independent track radar / curve preview component.
- `Pseudo3DRenderer` focuses on world rendering and delegates UI drawing.

## Agent A: UX Director

Focus:

- Verify menu, pause, result, help, minimap, dedicated track-select screen, and dedicated settings screen copy.
- Confirm optional commercial logo asset and programmatic logo fallback both preserve menu hierarchy.
- Confirm optional commercial UI icon atlas and programmatic icon fallback both preserve action readability.
- Confirm commercial asset pack switching does not expose debug or missing-asset copy in release UI.

Checklist:

- Start button remains the clearest menu action.
- Settings and track selection do not compete with `开始比赛`.
- Commercial logo image and programmatic logo fallback do not obscure current track / target lap information.
- Commercial atlas icons and programmatic icons match their action meanings.
- No debug or placeholder service copy appears in release mode.

## Agent B: UI Interaction Designer

Focus:

- Button press feedback.
- Touch cancel behavior.
- Icon/text balance.
- Brand logo placement.
- Theme-tokenized card and pill metrics.

Checklist:

- Press down visibly changes button state.
- Releasing inside executes the action.
- Moving outside cancels the action.
- Logo image placement does not reduce menu button touch comfort.
- Icon placement does not reduce perceived touch target size.
- `buttonIcon.textOffsetRatio` keeps button labels visually centered.
- Settings cards update status pill states immediately.
- `控制手感` cycles one profile per confirmed tap.

## Agent C: Asset / Track Systems Designer

Focus:

- Optional logo asset path and commercial pack structure.
- Optional UI icon atlas path and atlas frame order.
- Safe commercial pack switch flow.
- Track registry design.
- Per-track progression and score separation.

Checklist:

- Optional commercial logo asset path is `assets/packs/default/images/ui/logo.png`.
- Optional commercial UI icon atlas path is `assets/packs/default/images/ui/icons.png`.
- Required switch files are background, sprites, and music.
- Optional logo, icons, and sfx use runtime fallbacks and do not block switching.
- Missing logo image falls back to the programmatic logo fallback.
- Missing icon atlas falls back to programmatic icons.
- `RACER_TRACKS` contains all selectable tracks.
- Selected track id is saved through `RacerSettings`.
- Best lap display is per track id through `RacerStorage`.

## Agent D: Visual Designer

Focus:

- Commercial style layer.
- Logo image readability.
- UI icon atlas readability.
- Programmatic fallback readability.
- Theme-tokenized logo/icon/card/status-pill tuning.

Checklist:

- Commercial logo image is readable at small sizes.
- Programmatic logo fallback is readable at small sizes.
- Commercial atlas icons are readable at small sizes.
- Programmatic icon fallback is readable at small sizes.
- `brandLogo`, `buttonIcon`, `trackCard`, `settingCard`, and `statusPill` tokens are the main knobs for final skin tuning.

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
- Optional logo image regression checks.
- Optional icon atlas regression checks.
- Programmatic fallback regression checks.
- Safe switch script regression checks.
- Renderer separation regression checks.

Checklist:

- `npm run assets:commercial` blocks missing required commercial files.
- `npm run assets:commercial:apply` switches active pack only after required files exist.
- `npm run assets:legacy:apply` switches active pack back for rollback.
- Optional commercial logo asset renders on target devices without Canvas API errors.
- Optional commercial icon atlas renders on target devices without Canvas API errors.
- Missing logo image falls back to the programmatic logo fallback.
- Missing icon atlas falls back to programmatic icons.
- Theme-tokenized logo, button, track-card, setting-card, and status-pill metrics work on small and high-DPI devices.
- Settings screen opens from menu, toggles settings, cycles sensitivity, updates status pills, and returns safely.
- Track-select screen opens from menu, selects a track, and returns safely.
- Share / leaderboard payloads include selected track metadata.

## Agent G: Implementation Engineer

Focus:

- Keep code maintainable.
- Keep validation updated.
- Preserve shared layout/hitbox source of truth.
- Keep logo asset loading, icon atlas loading, fallback rendering, safe pack switching, and theme-tokenized metrics isolated from gameplay internals.

Implemented files:

- `src/scenes/RacerScene.ts`
- `src/racer/Pseudo3DRenderer.ts`
- `src/racer/RacerAssetManifest.ts`
- `src/racer/RacerAssets.ts`
- `src/racer/RacerUiRenderer.ts`
- `src/racer/RacerUiLogo.ts`
- `src/racer/RacerUiIcons.ts`
- `src/racer/RacerUiIconAtlas.ts`
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
- `scripts/use-commercial-assets.mjs`
- `scripts/validate-production.mjs`

Next recommended implementation pass:

1. Add a WeChat services adapter skeleton for share / leaderboard / rewarded ads.
2. Tune `brandLogo`, `buttonIcon`, `trackCard`, `settingCard`, and `statusPill` from real-device screenshots.
3. Tune minimap size/opacity after real-device testing on all selectable tracks.
4. Tune sensitivity presets after device testing.
5. Add pagination or scrolling to the dedicated track-select screen if more than 3 tracks are added.
