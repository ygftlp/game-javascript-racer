# Agent A: Runtime Integration

## Mission

Finish the WeChat runtime so the game feels complete, stable, and platform-safe.

## Owns

- `src/main.wx.ts`
- `src/scenes/`
- `src/racer/RacerAssets.ts`
- `src/racer/RacerServices.ts`
- `src/racer/RacerStorage.ts`

## Immediate tasks

1. Add a loading overlay while image and audio assets are loading.
2. Add a mute / unmute toggle to the menu or pause overlay.
3. Add app hide/show pause once platform lifecycle hooks are available.
4. Keep all business runtime code free of direct DOM and `wx` access.
5. Keep `RacerScene` responsible for scene flow only; keep physics in `RacerState` and rendering in `Pseudo3DRenderer`.

## Done when

- Menu, race, pause, finish, restart, best-lap storage, and audio control work in WeChat DevTools.
- `npm run typecheck` passes.
- `npm run validate:production` passes.
