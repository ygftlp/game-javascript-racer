# Agent C: UI Visual Designer

## Mission

Create a cohesive commercial visual style for menus, HUD, buttons, icons, and overlays.

## Owns

- Canvas UI visual style in `src/racer/Pseudo3DRenderer.ts`
- UI layout style tokens in `src/racer/RacerUiLayout.ts`
- Future UI art and icon assets

## Current problems to solve

- Current UI is improved but still mostly Canvas-drawn programmer art.
- Final release needs a logo, icons, consistent color palette, and stronger visual identity.
- Legacy art is not commercially safe and also contributes to a low-quality impression.

## Tasks

1. Produce final color palette:
   - Panel color.
   - Primary accent.
   - Brake accent.
   - Text colors.
   - Stroke/shadow colors.
2. Design required icons:
   - Pause.
   - Music on/off.
   - Share.
   - Leaderboard.
3. Define final button states:
   - Normal.
   - Pressed.
   - Disabled.
4. Define menu/result panel style.
5. Replace placeholder logo/title when commercial branding is ready.

## Acceptance criteria

- UI looks like a game screen, not a debug panel.
- Buttons have consistent style and hierarchy.
- Text remains readable on bright and dark scenes.
- UI art is replaceable and commercial-safe.
