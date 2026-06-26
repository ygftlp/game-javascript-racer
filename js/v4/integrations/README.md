# Integrations

Future platform and SDK adapters should live here.

Planned modules:

```text
standalone.js
portal.js
crazygames.js
poki.js
capacitor.js
```

Gameplay modules should not call these adapters directly. They should communicate through `Racer.App`, `Racer.Platform`, `Racer.Ads`, `Racer.Analytics`, and `Racer.Save`.
