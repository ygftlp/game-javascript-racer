# Agent D: Gameplay Readability QA

## Mission

Protect gameplay readability for commercial release.

## Owns

- Player car visibility.
- Traffic readability.
- Road/hazard readability.
- UI overlap checks.

## Current problems to solve

- The player reported that the car still disappears in some cases.
- Some sprites look unclear because legacy art is low-resolution and Canvas smoothing was previously enabled.
- UI must never cover the player car or immediate driving path.

## Tasks

1. Run long sessions across:
   - Straight sections.
   - Curves.
   - Hills.
   - Collisions.
   - Lap wraparound.
2. Capture screenshots when:
   - Player car disappears.
   - Traffic becomes unreadable.
   - UI covers the driving path.
3. Validate the player fallback body and visibility marker remain visible.
4. Verify smoothing-off rendering improves clarity.
5. Log exact device/screen size and reproduction steps for every issue.

## Acceptance criteria

- Player car never fully disappears.
- Player can distinguish own car from traffic.
- Road edges and lane direction remain readable at speed.
- UI does not cover near-road hazards.
