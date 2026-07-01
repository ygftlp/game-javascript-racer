# Production Completion Plan

This plan defines what must be complete before the WeChat racer can be considered a finished, publishable game.

## Goal

Ship a complete WeChat mini game version of the pseudo-3D racer with commercial-safe assets, stable gameplay, mobile UX, platform services, and launch validation.

## Completion gates

### Gate 1: Runtime foundation

Status: mostly implemented.

Required:

- WeChat entry uses `Engine + WxPlatform + RacerScene`.
- Game loop, input, rendering, storage, and audio are routed through the `src/engine` boundary.
- Local builds use `src/engine/local-lite-game-engine.ts` until the external SDK package publishes built `dist/lib` and `dist/types` files.
- Business code does not directly depend on DOM or `wx` globals.
- Legacy HTML demo remains available for reference.

### Gate 2: Core gameplay

Status: implemented as first production pass.

Required:

- Pseudo-3D road rendering.
- Player steering and braking.
- Traffic cars with basic AI avoidance.
- Roadside objects and collision response.
- Lap timer, best lap, total race time.
- Start menu, pause, finish result, restart.
- Tunable draw distance and traffic count.

### Gate 3: Asset replacement

Status: scaffold implemented; real replacement assets still needed.

Required:

- Replace `legacy` art and music before commercial release.
- Provide commercial-safe `assets/packs/default/images/background.png`.
- Provide commercial-safe `assets/packs/default/images/sprites.png`.
- Provide optional commercial logo asset at `assets/packs/default/images/ui/logo.png`.
- Provide optional commercial UI icon atlas at `assets/packs/default/images/ui/icons.png`.
- Provide commercial-safe `assets/packs/default/audio/music/racer.mp3`.
- Optional but recommended: engine loop, crash, and menu confirm sounds.
- Update `SpriteAtlas.ts` if new sprite atlas coordinates differ.
- Update `RacerUiIconAtlas.ts` if the UI icon atlas grid changes.
- Switch `ACTIVE_RACER_ASSET_PACK` to `COMMERCIAL_TEMPLATE_ASSET_PACK` when assets exist.

### Gate 4: Platform services

Status: service boundary implemented; real WeChat adapter still needed.

Required:

- Implement real share adapter behind `RacerServices.social`.
- Implement leaderboard adapter behind `RacerServices.leaderboard`.
- Implement ads adapter behind `RacerServices.ads`.
- Keep AppID, ad unit IDs, and sensitive platform IDs outside public source where possible.
- Avoid direct `wx` usage inside gameplay state or renderer.
- Ads must never appear during active driving.

### Gate 5: Commercial UI / UX polish

Status: release/debug UI split, polished interaction pass, independent minimap component, optional commercial logo asset support with programmatic logo fallback, optional commercial UI icon atlas support with programmatic icon fallback, theme-tokenized card metrics, dedicated track-select screen, dedicated settings screen with settings cards and status pill states, configurable control sensitivity, persisted selected track, per-track best laps, and first commercial road theme implemented; commercial art still needed.

Source of truth:

- `docs/commercial-ui-ux-plan.md`
- `docs/ui-polish-agent-sync.md`
- `docs/road-replacement-guide.md`
- `docs/asset-replacement-guide.md`
- `docs/agent-tasks/ui-ux-director.md`
- `docs/agent-tasks/control-feel-designer.md`
- `docs/agent-tasks/ui-visual-designer.md`
- `docs/agent-tasks/gameplay-readability-qa.md`
- `docs/agent-tasks/monetization-ux.md`

Implemented:

- `src/racer/RacerAssetManifest.ts` defines optional `images.brandLogo` and `images.uiIconAtlas`.
- The commercial template maps Logo to `assets/packs/default/images/ui/logo.png` and UI icons to `assets/packs/default/images/ui/icons.png`.
- `src/racer/RacerUiIconAtlas.ts` defines the 4-column, 64px-cell UI icon atlas frame order.
- `src/racer/RacerAssets.ts` loads the optional commercial Logo texture and optional commercial UI icon atlas without blocking the required background and sprite atlas.
- `src/racer/RacerUiLogo.ts` prefers a loaded commercial Logo texture and falls back to the programmatic Logo when it is missing, still loading, or fails to draw.
- `src/racer/RacerUiIcons.ts` prefers a loaded commercial UI icon atlas and falls back to programmatic icons when it is missing, still loading, or fails to draw.
- `RacerUiLogo` and `RacerUiIcons` avoid `roundRect` so they remain safer for WeChat Canvas compatibility.
- `src/racer/RacerUiTheme.ts` centralizes UI skin tokens for HUD, controls, panels, buttons, overlays, minimap, `brandLogo`, `buttonIcon`, `trackCard`, `settingCard`, `statusPill`, and icon colors.
- `RacerUiRenderer` renders the main-menu title area through `RacerUiLogo` using `极速公路` and `RETRO RACER` as fallback copy.
- `src/racer/RacerUiFlags.ts` defines release/debug UI switches.
- `src/racer/RacerRoadTheme.ts` centralizes road palette tokens and active road theme selection.
- `src/racer/RacerTrackDefinition.ts` defines a selectable track registry.
- `src/racer/RacerControlSensitivity.ts` defines `舒适`, `标准`, and `灵敏` control sensitivity profiles.
- The main menu includes iconized `开始比赛`, `选择赛道`, `排行榜`, `操作说明`, and `设置` actions.
- `RacerUiLayout` defines a dedicated track-select screen with track cards and `返回菜单`.
- `RacerUiRenderer` renders the dedicated track-select screen, card pressed states, track icons, and `已选择` status.
- Track-card icon size, text offsets, font sizes, and metadata offsets come from `RACER_UI_THEME.trackCard`.
- `RacerUiLayout` defines a dedicated settings screen with wider settings cards for music, minimap, operation guide, control sensitivity, reset-guide, and return controls.
- `RacerUiRenderer` renders the dedicated settings screen as iconized settings cards with title, description, status pill, enabled/disabled visual state, and pressed feedback.
- Settings-card icon size, text offsets, font sizes, and description offsets come from `RACER_UI_THEME.settingCard`.
- Status-pill width, height, offsets, font sizes, and text offset come from `RACER_UI_THEME.statusPill`.
- `RacerScene` opens the dedicated track-select screen from the menu and confirms a selected card on touch release.
- `RacerScene` opens the dedicated settings screen from the menu and persists music, minimap, control coach, and control sensitivity settings.
- `RacerSettings` persists the selected track id, audio state, minimap state, control coach state, control sensitivity id, and whether the first-race coach has already been shown.
- `RacerJoystick` applies the selected control sensitivity profile to joystick steering output.
- `RacerState` applies the selected control sensitivity profile to steering response and input clamp.
- `RacerScene` restores the last selected track and control sensitivity at startup.
- `RacerStorage` stores best lap records per track id.
- `RaceResult` includes selected track metadata for share / leaderboard payloads.
- Release mode is the default UI mode.
- Debug-only asset/performance/commercial-safe text is hidden by default.
- Control labels and player visibility marker are hidden by default.
- Menu, pause, HUD, result, track-select, and settings copy are player-facing Chinese by default.
- Buttons have a pressed state and overlay actions execute on touch end.
- Dragging outside a button cancels the pending action.
- Touch start/move/end handlers tolerate empty platform touch arrays.
- `RacerMiniMap` is an independent component for the in-race track radar.
- Minimap rendering is controlled by the persisted settings screen switch.
- First-race operation coach can be disabled or reset from the settings screen.
- `Pseudo3DRenderer` focuses on world rendering and delegates UI drawing.
- `Pseudo3DRenderer` uses the selected track road theme fog color.
- `RacerState` generates segment road colors from the selected track road theme.
- Audio mute state is persisted through platform storage.
- Optional sound effects are wired for engine loop, crash, and menu confirmation audio.
- Player car rendering is stabilized outside segment projection clipping and clamped to a visible vertical range.
- Player car has an always-visible fallback body underneath the sprite frame.
- Canvas image smoothing is disabled for sharper pixel-art sprites and backgrounds.
- Local compatibility engine creates a high-DPI canvas using `pixelRatio` and scales the context back to logical coordinates.

Still required before commercial release:

- Replace placeholder title/logo with commercial-safe branding.
- Add the final commercial Logo image at `assets/packs/default/images/ui/logo.png`, or keep the programmatic logo fallback.
- Add the final commercial UI icon atlas at `assets/packs/default/images/ui/icons.png`, or keep the programmatic icon fallback.
- Replace legacy low-resolution art with a commercial-safe higher-quality asset pack before launch.
- Tune exact joystick/brake/minimap sizes and opacity on real low-end and high-DPI devices.
- Tune the dedicated track-select screen card spacing, copy length, icon size, and pressed-state intensity on small devices.
- Tune the dedicated settings screen settings cards, status pill readability, icon size, labels, and touch comfort on small devices.
- Tune theme-tokenized `brandLogo`, `buttonIcon`, `trackCard`, `settingCard`, and `statusPill` metrics on target devices.
- Tune the `舒适 / 标准 / 灵敏` sensitivity presets from real device feedback.
- Tune the commercial asphalt palette on real devices for readability and contrast.
- Tune all selectable track section layouts on real devices.
- Add final result-screen share copy, ranking entry polish, and optional medal/rating art.
- Switch `src/engine/index.ts` to the real SDK after the SDK package is built/published correctly.

### Gate 6: Quality and validation

Status: scripts added; full validation requires local environment.

Required commands:

```bash
npm install
npm run typecheck
npm run validate
npm run validate:production
npm run build:wx
```

Required manual checks:

- Open project root in WeChat DevTools.
- Confirm `project.config.json` points to `dist/wechat/`.
- Start game from menu without external instructions.
- Confirm missing `assets/packs/default/images/ui/logo.png` falls back to the programmatic Logo.
- Confirm adding `assets/packs/default/images/ui/logo.png` makes the menu use the commercial Logo image.
- Confirm missing `assets/packs/default/images/ui/icons.png` falls back to programmatic icons.
- Confirm adding `assets/packs/default/images/ui/icons.png` makes menu, settings, pause, help, result, and track-select actions use atlas icons.
- Confirm menu actions execute only on release inside the button.
- Confirm moving outside a button cancels the pending action.
- Confirm `选择赛道` opens the dedicated track-select screen.
- Confirm every track card can be selected and returns to the menu.
- Confirm track-select `返回菜单` leaves the selected track unchanged.
- Confirm `设置` opens the dedicated settings screen.
- Confirm settings cards show immediate pressed feedback.
- Confirm theme-tokenized logo, icon sizes, text offsets, and status-pill metrics look correct on small and high-DPI screens.
- Confirm settings screen music, minimap, operation guide, reset guide, and control sensitivity settings persist after reload.
- Confirm `控制手感` cycles through `舒适 -> 标准 -> 灵敏` and persists after reload.
- Confirm relaunch restores the last selected track.
- Confirm each track shows its own best lap record per track id.
- Confirm left-bottom joystick steers the car quickly enough and returns to center on release.
- Confirm player car remains visible through hills, curves, traffic, collisions, lap wraparound, and continuous steering.
- Confirm pixel-art elements look sharper after smoothing is disabled.
- Confirm minimap appears under the HUD only during active driving when enabled.
- Confirm minimap curve preview gives readable left/right/straight information.
- Confirm commercial asphalt road theme improves road/lane/rumble readability.
- Confirm pause button is not blocked by the WeChat capsule and shows pressed feedback.
- Confirm no debug-only UI appears in release mode.
- Confirm share / leaderboard payloads include selected track metadata.
- Confirm ads never appear while driving.
- Finish the configured target lap count on each selectable track and restart.
- Confirm best lap, selected track, audio preference, minimap preference, operation coach preference, and control sensitivity persist after reload.
- Confirm no console errors for missing required assets beyond optional Logo/icon fallback warnings.
- Check FPS on low-end and mid-range devices.
- Check package size.
