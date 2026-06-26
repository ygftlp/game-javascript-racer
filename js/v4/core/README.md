# Core

Core runtime modules for the v4 game.

```text
state.js   Shared mutable runtime state.
app.js     Integration facade and lifecycle event bridge.
game.js    Main game controller and game-loop binding.
```

Keep this folder focused on application lifecycle and core runtime coordination. Feature-specific systems should live in sibling folders such as `gameplay/`, `ui/`, `systems/`, `integrations/`, or `content/`.
