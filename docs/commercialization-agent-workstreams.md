# Commercialization Agent Workstreams

This document assigns commercial-release ownership across multiple agents. The goal is to make the game commercially launchable, not just technically playable.

## Agent 1: Commercialization Director

Mission:

- Own the complete commercial release strategy.
- Keep product scope small enough to launch.
- Decide go / no-go with input from all agents.

Owns:

- commercialization plan
- milestone sequencing
- launch readiness score
- release scope decisions
- cross-agent tradeoffs

Deliverables:

- commercial release brief
- launch milestone status
- final go / no-go recommendation

## Agent 2: Licensing & Compliance Agent

Mission:

- Ensure the game can be legally distributed and monetized.
- Remove dependency on unlicensed legacy placeholder assets.

Owns:

- asset rights register
- music and sfx license records
- logo / icon ownership checks
- no real car brand or real ad usage unless licensed
- WeChat platform policy review checklist

Deliverables:

- asset license register
- commercial-safe asset approval checklist
- launch compliance blockers list

## Agent 3: Product & Gameplay Agent

Mission:

- Keep the core race loop fun, readable, and replayable.
- Ensure commercial features do not weaken control feel or fairness.

Owns:

- track selection experience
- target lap / race length tuning
- controls and sensitivity tuning
- per-track best lap fairness
- result screen replay loop

Deliverables:

- race-loop tuning notes
- track-by-track QA report
- control preset recommendation

## Agent 4: Monetization Strategy Agent

Mission:

- Design revenue without interrupting driving or damaging trust.

Owns:

- interstitial rules
- rewarded video rules
- cosmetic / unlock economy proposals
- ad cooldowns
- monetization KPI plan

Deliverables:

- monetization ruleset
- ad placement checklist
- rewarded opt-in proposals

## Agent 5: Growth & Publishing Agent

Mission:

- Plan how the game gets discovered, shared, and retained.

Owns:

- share copy
- share image direction
- leaderboard viral loop
- WeChat group-friendly challenge copy
- launch notes and version record

Deliverables:

- share copy matrix
- launch messaging plan
- distribution checklist

## Agent 6: LiveOps & Analytics Agent

Mission:

- Ensure launch data can guide tuning and future updates.

Owns:

- analytics event catalog
- KPI dashboard requirements
- event naming consistency
- soft-launch tuning plan
- weekly content/event ideas

Deliverables:

- analytics event checklist
- soft-launch measurement plan
- first four-week liveops plan

## Agent 7: Art & Audio Production Agent

Mission:

- Replace placeholder visuals and sound with commercial-safe production assets.

Owns:

- background art
- sprite atlas
- player car and traffic cars
- UI logo
- UI icon atlas
- music and sfx
- package size impact

Deliverables:

- commercial asset pack
- asset replacement report
- visual/audio approval notes

## Agent 8: Platform Integration Agent

Mission:

- Make WeChat services production-ready while keeping gameplay isolated from platform APIs.

Owns:

- `RacerWechatConfig.ts`
- share integration
- open data leaderboard project wiring
- cloud function path if used
- ad unit configuration
- analytics forwarding

Deliverables:

- platform configuration checklist
- open data context integration report
- WeChat DevTools test report

## Agent 9: Commercial QA Agent

Mission:

- Validate that the commercial build is ready to upload and does not regress gameplay.

Owns:

- release checklist execution
- device matrix testing
- performance checks
- package size checks
- missing asset checks
- ad safety checks

Deliverables:

- release QA report
- blocker list
- upload approval recommendation

## Collaboration rules

- No agent may approve launch alone.
- Licensing & Compliance can block launch if rights are unclear.
- Commercial QA can block launch if device testing fails.
- Monetization Strategy cannot add ads during active driving.
- Product & Gameplay can reject monetization ideas that damage fairness.
- Platform Integration must keep gameplay code free from direct WeChat API usage.
- Art & Audio must keep all replacement paths compatible with the existing asset manifest.

## Weekly commercial standup format

Each agent reports:

```text
Status: green / yellow / red
Completed:
Blockers:
Next:
Go/no-go risk:
```

## Handoff map

```text
Art & Audio -> Licensing & Compliance -> Commercial QA
Product & Gameplay -> Monetization Strategy -> Commercialization Director
Platform Integration -> LiveOps & Analytics -> Growth & Publishing
Commercial QA -> Commercialization Director -> launch decision
```
