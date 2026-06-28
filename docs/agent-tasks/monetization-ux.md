# Agent E: Monetization UX Designer

## Mission

Plan commercial features without damaging the core racing experience.

## Owns

- Share UX.
- Leaderboard UX.
- Ad timing and placement.
- Service failure behavior.

## Current problems to solve

- Share, leaderboard, and ad services currently exist as placeholders.
- Commercial release needs these entry points to feel natural, not forced.
- Ads must not interrupt active driving.

## Tasks

1. Define share entry points:
   - Result screen.
   - Optional main menu.
2. Define leaderboard entry points:
   - Main menu.
   - Result screen.
3. Define ad rules:
   - Interstitial only after race finish or safe menu transition.
   - Rewarded video only for explicit opt-in rewards.
   - Never show ads while driving.
4. Define failure behavior when WeChat APIs are unavailable.
5. Add final copy for share/leaderboard/ad prompts.

## Acceptance criteria

- Ads never appear during active driving.
- Share and leaderboard do not block restart.
- Player can ignore monetization entries and still enjoy the game.
- All platform service failures degrade gracefully.
