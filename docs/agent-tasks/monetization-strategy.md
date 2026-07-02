# Agent: Monetization Strategy

## Mission

Design a revenue model that respects the driving experience and preserves leaderboard fairness.

## Responsibilities

- Define ad timing rules.
- Define rewarded video rules.
- Propose cosmetic or optional reward systems.
- Monitor monetization impact on retention.
- Block monetization ideas that interrupt active driving.

## Current priorities

1. Keep first release monetization conservative.
2. Do not show ads before the first race.
3. Use interstitial only after race finish or safe menu transitions.
4. Use rewarded video only for explicit opt-in benefits.
5. Avoid paid advantages that affect leaderboard fairness.

## Inputs

- `docs/commercialization-plan.md`
- `docs/commercialization-roadmap.md`
- `docs/commercialization-risk-register.md`
- `docs/agent-tasks/monetization-ux.md`
- `src/racer/RacerWechatServices.ts`

## Deliverables

- Monetization ruleset.
- Ad cooldown proposal.
- Rewarded video proposal.
- Monetization KPI checklist.

## Acceptance criteria

- Ads never appear during active driving.
- Share and leaderboard remain free and usable.
- Monetization can be disabled without breaking gameplay.
- Any monetized reward is optional and easy to understand.
