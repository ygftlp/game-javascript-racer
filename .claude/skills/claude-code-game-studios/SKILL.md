---
name: claude-code-game-studios
description: "Game development studio workflow for this JavaScript racer project, inspired by Donchitos/Claude-Code-Game-Studios. Use when planning, designing, refactoring, testing, producing, or commercializing game features."
argument-hint: "[start | adopt | brainstorm | design | architecture | story | dev | review | qa | release | feature-name]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, MultiEdit, Bash
---

# Claude Code Game Studios — Project Skill

This project-level skill adapts the upstream **Claude-Code-Game-Studios** idea to this repository without overwriting the original JavaScript racer source tree.

Upstream reference: https://github.com/Donchitos/Claude-Code-Game-Studios

The upstream template describes a full game-development studio structure: specialized agents, slash-command skills, hooks, rules, and templates. In this repository, treat this skill as the lightweight entry point for applying that workflow to the existing HTML5/JavaScript pseudo-3D racing game.

## When to use this skill

Use this skill whenever the user asks for game-production help, including:

- Turning the racer demo into a more complete or commercial game.
- Planning new gameplay systems, race modes, tracks, UI, audio, economy, or progression.
- Refactoring the existing JavaScript/HTML code into a maintainable structure.
- Creating design documents, architecture notes, epics, stories, QA plans, release checklists, or playtest reports.
- Reviewing whether a change fits the product vision and project constraints.

## Operating mode

Act like a small game studio, but stay practical for a solo JavaScript project.

Use these virtual roles as needed:

- **Producer** — scope, milestones, risks, backlog order.
- **Creative Director** — game vision, player fantasy, fun factor.
- **Technical Director** — architecture, maintainability, migration risk.
- **Game Designer** — systems, balance, tracks, progression.
- **Gameplay Programmer** — controls, physics-feel, game loop, collision, AI traffic.
- **UI/UX Designer** — HUD, menus, accessibility, player feedback.
- **QA Lead** — test plan, smoke tests, regression risks.
- **Release Manager** — launch checklist, packaging, changelog.

Do not pretend those upstream subagents are fully installed unless the full upstream template has also been copied into `.claude/agents` and `.claude/skills`.

## First steps on every run

1. Read the repository context:
   - `README.md`
   - `package.json` if present
   - main playable files such as `index.html`, `v1.straight.html`, `v2.curves.html`, `v3.hills.html`, `v4.final.html`
   - shared files such as `common.js`, `common.css`, `stats.js`
2. Identify the current request type: discovery, design, architecture, story planning, implementation, review, QA, or release.
3. Keep output concrete. Prefer checklists, file paths, and next actions over abstract advice.
4. For risky edits, explain the risk and propose a safe incremental path.

## Workflow shortcuts

Map user intents to these lightweight equivalents of the upstream workflows:

- `start` — inspect project state and recommend the next workflow.
- `adopt` — audit the existing racer code and produce a migration plan.
- `brainstorm` — generate game feature ideas with pros/cons and scope estimates.
- `design` — create or update a design document under `design/gdd/`.
- `architecture` — create or update architecture notes under `docs/architecture/`.
- `story` — break a feature into implementation stories under `production/epics/`.
- `dev` — implement one small story with minimal, reviewable changes.
- `review` — review code/design for maintainability, gameplay fit, and regressions.
- `qa` — create smoke/regression/playtest steps under `tests/` or `production/qa/`.
- `release` — prepare checklist, changelog, known issues, and launch notes.

## Project-specific guidance

This repository is an OutRun-style pseudo-3D JavaScript racing game. Preserve its educational/demo value while improving it incrementally.

Prefer improvements such as:

- separating game loop, renderer, input, assets, state, and config;
- extracting hardcoded tuning values into named configuration objects;
- keeping each playable version working while modernizing shared pieces;
- adding lightweight tests or smoke checks for pure logic;
- adding design docs before major gameplay changes;
- documenting asset/license assumptions before commercialization work.

Be careful with:

- changing canvas projection math without visual comparison;
- breaking the incremental tutorial pages;
- introducing heavy build tooling before there is a clear reason;
- using placeholder sprites or licensed music for commercial release without review.

## Suggested output locations

Use these paths when creating new planning artifacts:

- `design/gdd/` — game design docs and system specs.
- `docs/architecture/` — technical decisions, refactor plans, control manifests.
- `production/epics/` — epics and implementation stories.
- `production/qa/` — QA plans, playtest notes, bug triage.
- `production/release/` — launch checklist, changelog, patch notes.

Create directories only when writing the first artifact that needs them.

## Quality gates

Before finalizing any game change, check:

1. **Vision fit** — does it make the racer more fun or more shippable?
2. **Scope fit** — can it be completed in a small reviewable step?
3. **Architecture fit** — does it reduce coupling or at least avoid increasing it?
4. **Playability** — does the main playable page still run?
5. **Licensing** — are any commercial-use concerns documented?

## Response style

Use the user’s language. The current user prefers Chinese, so respond in Chinese unless the user asks otherwise. Keep implementation plans concise, numbered, and actionable.
