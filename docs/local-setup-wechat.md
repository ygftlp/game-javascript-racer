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

## Engine modes

This project supports two engine modes.

### Mode A: compatibility engine

This is the default stable mode. It uses:

```text
src/engine/index.ts
src/engine/local-lite-game-engine.ts
```

Use this when you want the racer project to typecheck and build without relying on another local project:

```bash
npm run engine:compat
rmdir /s /q node_modules
del package-lock.json
npm install
npm run typecheck
npm run build:wx
```

### Mode B: your local game engine project

Your real local engine project is expected at:

```text
D:\JavaWorkspace\game-engine
```

From the racer project, that path is:

```text
../game-engine
```

Use this when you want the racer to consume your real local engine package as `lite-game-engine`:

```bash
cd /d D:\JavaWorkspace\game-engine
npm install
npm run build

cd /d D:\JavaWorkspace\game-javascript-racer
npm run engine:local
rmdir /s /q node_modules
del package-lock.json
npm install
npm run typecheck
npm run build:wx
```

`npm run engine:local` changes:

```text
src/engine/index.ts
package.json
```

so that `src/engine/index.ts` re-exports the real SDK package and `package.json` depends on:

```json
{
  "lite-game-engine": "file:../game-engine"
}
```

If the local engine does not have `dist/lib` and `dist/types`, build it first from `D:\JavaWorkspace\game-engine`.

## Source import rule

Business code should always import engine types and classes from the boundary:

```ts
import { Engine, WxPlatform } from '../engine';
```

Do not import directly from `lite-game-engine` in gameplay, renderer, scene, storage, or platform startup files. The boundary lets you switch between compatibility mode and the real local SDK.

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
scripts/use-engine-mode.mjs          Switches compatibility/local-SDK engine modes
project.config.json                  WeChat DevTools project config
```

## Common checks

- Run npm commands from the repository root, not from `src/` or another parent folder.
- Confirm `package.json` exists before running `npm install`.
- Confirm `src/engine/index.ts` exists.
- When using local SDK mode, confirm `D:\JavaWorkspace\game-engine\dist` exists after running `npm run build` in the engine project.
- If dependency install fails, delete `node_modules` and `package-lock.json`, then run `npm install` again.
