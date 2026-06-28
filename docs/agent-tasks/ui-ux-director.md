# Agent A: UX Director

## Mission

Turn the racing game from a playable prototype into a commercially understandable mobile game experience.

## Owns

- Screen hierarchy.
- Player-facing copy.
- Release/debug UI split.
- Main menu, pause overlay, result overlay priorities.

## Current problems to solve

- The current UI still exposes technical/debug information to players.
- Menus need a stronger game identity.
- The first-time player experience needs to explain controls without cluttering the driving view.

## Tasks

1. Finalize release copy for:
   - Main menu.
   - Pause overlay.
   - Result overlay.
   - Control hints.
2. Define which information belongs in release mode vs debug mode.
3. Remove or hide player-facing asset/debug lines from HUD in release mode.
4. Prioritize buttons on every screen:
   - Main menu: Start first.
   - Pause: Continue first.
   - Result: Play again first.
5. Review whether the current name `Retro Racer` should remain or be replaced before release.

## Acceptance criteria

- A player can start the race without reading documentation.
- No debug-only copy is visible in release mode.
- Every overlay has one obvious primary action.
- Copy is consistent in one language unless branding intentionally mixes languages.
