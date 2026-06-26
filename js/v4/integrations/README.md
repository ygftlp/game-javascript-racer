# Integrations

Platform and SDK-facing integration modules live here.

Current modules:

```text
platform.js   Standalone/portal/app-wrapper lifecycle abstraction.
ads.js        No-op ad placement abstraction for future SDK integration.
analytics.js  No-op analytics abstraction and event forwarding.
```

Planned provider adapters:

```text
standalone.js
portal.js
crazygames.js
poki.js
capacitor.js
```

Gameplay modules should not call provider adapters directly. They should communicate through `Racer.App`, `Racer.Platform`, `Racer.Ads`, `Racer.Analytics`, and `Racer.Save`.
