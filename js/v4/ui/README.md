# UI

UI and input-facing runtime modules live here.

Current modules:

```text
hud.js       HUD value binding and formatting.
input.js     Keyboard and WASD input mapping.
tweak-ui.js  Developer tuning controls for resolution, road, camera, draw distance, FOV, and fog.
```

Planned modules:

```text
menu.js
result-screen.js
pause-screen.js
settings-screen.js
mobile-controls.js
```

Keep pure gameplay logic in `js/v4/gameplay/` and platform integrations in `js/v4/integrations/`.
