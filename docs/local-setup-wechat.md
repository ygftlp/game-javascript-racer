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
- Confirm Node.js can access GitHub because `lite-game-engine` is installed from a GitHub dependency.
- If dependency install fails, verify your network/proxy and GitHub SSH/HTTPS access.
