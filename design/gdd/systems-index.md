# Systems Index — JavaScript Racer

**Status**: In Design  
**Last Updated**: 2026-07-10

| System | Layer | Priority | Status | Notes |
|---|---|---:|---|---|
| Core Game Loop | Gameplay | P0 | In Progress | Update/render loop and fixed timestep behavior. |
| Road Projection Renderer | Rendering | P0 | In Progress | Segment projection, curves, hills, fog, sprites. |
| Input Controls | Gameplay | P0 | In Progress | Keyboard acceleration, braking, steering. |
| Vehicle Physics Feel | Gameplay | P0 | In Progress | Acceleration, braking, deceleration, off-road slowdown, collision speed changes. |
| Track Generation | Gameplay | P0 | In Progress | Road segment creation, hills, curves, start/finish segments. |
| Traffic AI | Gameplay | P1 | In Progress | Simple car placement, movement, and avoidance behavior. |
| Collision Handling | Gameplay | P1 | In Progress | Player vs traffic and roadside sprite overlap checks. |
| HUD and Timing | UI | P1 | In Progress | Speed, current lap, last lap, fastest lap. |
| Audio Playback | Audio | P2 | In Progress | Music sources and mute control. License review needed. |
| Runtime Tuning Controls | Tools/UI | P2 | In Progress | Resolution, lanes, road width, camera height, draw distance, FOV, fog. |
| Asset Pipeline | Production | P0 | Needs Revision | Existing sprites/music need commercial-use review. |
| Commercialization Readiness | Production | P0 | Not Started | Licensing, packaging, release checklist, original assets. |
| Test and QA | QA | P0 | Not Started | Browser smoke checks and regression checklist. |
| Modular Refactor | Architecture | P1 | Not Started | Separate renderer, game loop, input, assets, config. |

## Notes

Use exact status values only: `Not Started`, `In Progress`, `In Review`, `Designed`, `Approved`, `Needs Revision`.
