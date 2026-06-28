# Local WeChat Mini Game Setup

## Fix `ENOENT package.json`

If npm reports:

```text
npm error code ENOENT
npm error syscall open
npm error path D:\JavaWorkspace\game-javascript-racer\package.json
npm error enoent Could not read package.json
```

It means your current local folder does not contain the branch version that has `package.json`, or you are running npm outside the repository root.

Run these commands from PowerShell or Git Bash:

```bash
cd /d D:\JavaWorkspace\game-javascript-racer
git fetch origin
git checkout codex/modularize-v4-racer
git pull origin codex/modularize-v4-racer
dir package.json
```

If `git checkout codex/modularize-v4-racer` fails because the local branch does not exist, use:

```bash
git checkout -b codex/modularize-v4-racer origin/codex/modularize-v4-racer
```

If the folder is not a git repository or was downloaded as an old zip, re-clone the branch:

```bash
cd /d D:\JavaWorkspace
rmdir /s /q game-javascript-racer
git clone -b codex/modularize-v4-racer https://github.com/ygftlp/game-javascript-racer.git
cd game-javascript-racer
```

## Local engine compatibility mode

This branch currently uses a local engine compatibility layer because the GitHub dependency package `lite-game-engine` points to `dist/lib` and `dist/types`, but that dependency branch does not include those built files.

Current runtime boundary:

```text
src/engine/index.ts
src/engine/local-lite-game-engine.ts
```

Business code should import engine types and classes from:

```ts
import { Engine, WxPlatform } from '../engine';
```

Do not import directly from `lite-game-engine` until the SDK package publishes or commits its built `dist/lib` and `dist/types` files.

When the SDK package is fixed, switch only this file:

```text
src/engine/index.ts
```

from local compatibility mode to real SDK re-export.

## Install and build

```bash
npm install
npm run typecheck
npm run validate:production
npm run build:wx
```

The build creates:

```text
dist/wechat/game.js
dist/wechat/game.json
dist/wechat/images/**
dist/wechat/music/**
dist/wechat/assets/**
```

## Open in WeChat DevTools

Open the repository root:

```text
D:\JavaWorkspace\game-javascript-racer
```

`project.config.json` points WeChat DevTools to:

```text
dist/wechat/
```

## Source structure

```text
src/main.wx.ts                       Mini game source entry
src/engine/index.ts                  Engine import boundary
src/engine/local-lite-game-engine.ts Local compatibility engine for development/builds
src/platforms/wechat/startup.ts      Engine + WxPlatform startup and lifecycle binding
src/platforms/wechat/game.json       WeChat game manifest copied to dist
src/scenes/RacerScene.ts             Main racer scene
src/racer/                           Gameplay, renderer, assets, services, storage, UI layout
scripts/build-wechat.mjs             Bundles src/main.wx.ts to dist/wechat/game.js
project.config.json                  WeChat DevTools project config
```

## Common checks

- Run npm commands from the repository root, not from `src/` or another parent folder.
- Confirm `package.json` exists before running `npm install`.
- Confirm `src/engine/index.ts` exists; this branch intentionally avoids direct `lite-game-engine` imports for local build stability.
- If dependency install fails, delete `node_modules` and `package-lock.json`, then run `npm install` again.
