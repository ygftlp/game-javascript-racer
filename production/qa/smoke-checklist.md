# Smoke Checklist — JavaScript Racer

**Status**: Draft  
**Last Updated**: 2026-07-10

Run these checks before and after any gameplay/runtime refactor.

## Browser Setup

- [ ] Open `index.html` in a modern desktop browser.
- [ ] Confirm the page lists links to all four demo versions.
- [ ] Open `v4.final.html`.
- [ ] Confirm the canvas loads without a browser console error.

## Core Playability

- [ ] Press accelerate and confirm the car gains speed.
- [ ] Press brake and confirm speed decreases.
- [ ] Press left/right and confirm the car steers.
- [ ] Drive through curves and confirm centrifugal drift still applies.
- [ ] Leave the road and confirm speed drops.
- [ ] Hit a roadside object and confirm the car slows/stops in front of it.
- [ ] Hit traffic and confirm speed/position adjust.

## HUD

- [ ] Speed value updates while driving.
- [ ] Current lap time updates during a lap.
- [ ] Last lap time appears after completing a lap.
- [ ] Fastest lap display updates when a faster lap is achieved.

## Rendering

- [ ] Road segments draw from near to far without obvious gaps.
- [ ] Hills and curves project correctly.
- [ ] Background layers scroll during curves/hills.
- [ ] Fog still hides distant segments/sprites.
- [ ] Traffic and roadside sprites render at plausible scale.

## Tuning Controls

- [ ] Resolution selector changes the canvas scaling.
- [ ] Lanes selector changes lane rendering.
- [ ] Road width slider changes road width.
- [ ] Camera height slider changes viewpoint.
- [ ] Draw distance slider changes visible segment count.
- [ ] Field of view slider changes projection feel.
- [ ] Fog density slider changes distance fog.

## Audio

- [ ] Music loads if browser autoplay policy allows it.
- [ ] Mute control toggles audio state.

## Regression Notes

Record browser, operating system, and any visible issue when a checklist item fails.
