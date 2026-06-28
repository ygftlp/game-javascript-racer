# Agent E: Monetization and Social

## Mission

Implement the real WeChat share, leaderboard, analytics, and ads adapters behind the existing `RacerServices` boundary.

## Owns

- Real adapter behind `src/racer/RacerServices.ts`
- Future WeChat service configuration docs
- Share / leaderboard / ad placement integration

## Immediate tasks

1. Implement share result behavior behind `RacerServices.social.shareResult()`.
2. Implement score submission and leaderboard display behind `RacerServices.leaderboard`.
3. Implement interstitial ad behavior behind `RacerServices.ads.showInterstitial()`.
4. Decide whether rewarded video should be used for continues, bonus rewards, or disabled.
5. Keep app id, ad unit ids, and environment-specific IDs out of reusable gameplay code.
6. Avoid direct `wx` calls inside state or renderer modules.

## Done when

- Result share works or is intentionally disabled by config.
- Leaderboard entry works or is intentionally disabled by config.
- Ads work or are intentionally disabled by config.
- No platform calls leak into `RacerState` or `Pseudo3DRenderer`.
