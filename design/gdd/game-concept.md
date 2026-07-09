# Game Concept — JavaScript Racer

**Status**: In Design  
**Stage**: Concept  
**Last Updated**: 2026-07-10

## Overview

JavaScript Racer is an OutRun-style pseudo-3D browser racing game. The current project demonstrates a fast, arcade-like driving loop rendered with HTML5 Canvas, road-segment projection, background parallax, traffic cars, roadside sprites, speed control, lap timing, and tuning controls.

## Player Fantasy

The player fantasy is simple arcade speed: drive a sports car down a stylized road, weave through traffic, stay on track, and chase faster lap times.

## Core Loop

1. Start the playable page.
2. Accelerate with keyboard controls.
3. Steer through curves, hills, traffic, and roadside obstacles.
4. Maintain speed while avoiding collisions and off-road slowdown.
5. Complete laps and compare current, last, and fastest lap times.
6. Adjust tuning controls such as resolution, lanes, road width, draw distance, field of view, and fog density.

## Current MVP Systems

- Road projection and segment rendering.
- Keyboard driving controls.
- Player speed, acceleration, braking, and deceleration.
- Curves, hills, rumble strips, start/finish segments.
- Traffic car placement, movement, and simple avoidance.
- Roadside sprite placement and collision slowdown.
- HUD speed and lap time display.
- Music playback and mute control.
- Browser-based configuration controls.

## Design Goals

- Preserve the immediate arcade feel.
- Keep the game playable directly in the browser.
- Improve maintainability before expanding scope.
- Create clear boundaries between renderer, game loop, input, assets, tuning, and UI.
- Make the project safer for future commercialization by tracking asset/license risks.

## Open Questions

- Should the commercial version stay as a pure static browser game or migrate into `lite-game-engine`?
- Should tutorial demo pages remain part of the product, or move into documentation/examples?
- What is the target platform: browser-only, desktop web, mobile web, or packaged desktop?
- Should future gameplay focus on time attack, traffic dodging, stages, racing opponents, collectibles, or progression?
- Which assets and audio can legally ship in a commercial version?

## Acceptance Criteria

- [ ] The current playable baseline is clearly described.
- [ ] Core systems are listed in `design/gdd/systems-index.md`.
- [ ] Architecture risks are documented before refactoring.
- [ ] QA smoke checks exist before changing runtime behavior.
