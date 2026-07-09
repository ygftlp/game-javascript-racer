# Claude Project Notes — JavaScript Racer

This repository contains an OutRun-style pseudo-3D racing game implemented with HTML5, JavaScript, CSS, images, and music assets.

## Installed Claude Code skill

A project-level skill has been added at:

- `.claude/skills/claude-code-game-studios/SKILL.md`

Use it for game-production workflows such as:

- project adoption and migration planning;
- gameplay brainstorming and design docs;
- architecture/refactor planning;
- implementation stories;
- code/design/QA/release review;
- commercialization readiness checks.

The skill is a lightweight project adaptation inspired by:

- https://github.com/Donchitos/Claude-Code-Game-Studios

It does **not** claim that the full upstream template has been copied into this repository. It provides a safe entry point for applying that studio-style workflow to this existing racer without overwriting the game source.

## Project guardrails

When editing this project:

1. Preserve the existing tutorial/demo pages unless the user explicitly asks to replace them.
2. Avoid large rewrites without first creating a small migration plan.
3. Keep changes reviewable and easy to test in the browser.
4. Document licensing concerns before using current sprites/music in commercial work.
5. Prefer extracting configuration and modular code before adding major gameplay systems.

## Useful files to inspect first

- `README.md`
- `package.json`
- `index.html`
- `common.js`
- `common.css`
- `stats.js`
- `v1.straight.html`
- `v2.curves.html`
- `v3.hills.html`
- `v4.final.html`

## Suggested artifact locations

- `design/gdd/` for design docs.
- `docs/architecture/` for technical decisions and refactor plans.
- `production/epics/` for epics/stories.
- `production/qa/` for QA plans and playtest notes.
- `production/release/` for launch and patch planning.
