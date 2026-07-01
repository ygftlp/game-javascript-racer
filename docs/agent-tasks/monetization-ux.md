# Agent E: Monetization UX Designer

## Mission

Plan commercial features without damaging the core racing experience.

## Owns

- Share UX.
- Leaderboard UX.
- Open data context message protocol.
- Ad timing and placement.
- Service failure behavior.
- WeChat platform service configuration review.

## Current status

- `RacerServices` now prefers `RacerWechatServices` when `globalThis.wx` exists.
- Non-WeChat and unsupported API environments keep noop fallback services.
- Share uses `wx.shareAppMessage` with race result and selected track metadata.
- Leaderboard submit supports WeChat cloud function or open data context `postMessage`.
- Leaderboard view receives `source`, `trackId`, and `trackName` context for track-specific boards.
- `docs/open-data-leaderboard-protocol.md` defines the open data context message contract.
- `docs/samples/open-data-leaderboard-handler.js` provides a sample `wx.onMessage` handler for open data context integration.
- The sample handler covers `submitRacerScore`, `showRacerLeaderboard`, `wx.setUserCloudStorage`, `wx.getFriendCloudStorage`, per-track keys, empty states, and malformed-message fallback.
- Ads skeleton supports interstitial and rewarded video but only runs when ad unit IDs are configured.
- Interstitial is currently requested only after race finish.

## Current problems to solve

- Real AppID, share image, cloud/open-data setup, and ad unit IDs are not configured yet.
- Open data context Canvas rendering still needs a production visual design.
- Share, leaderboard, and ads need real WeChat DevTools and device verification.
- Commercial release needs these entry points to feel natural, not forced.
- Ads must not interrupt active driving.

## Tasks

1. Define final share copy and optional share image:
   - Result screen share.
   - Include selected track name and best/total time.
2. Define leaderboard entry points:
   - Main menu.
   - Result screen.
   - Track-specific board context through `trackId` and `trackName`.
3. Define leaderboard implementation path:
   - Open data context `postMessage` for friend rankings.
   - Optional cloud function for persistent score submit.
   - Keep message names aligned with `RacerWechatConfig.ts`.
4. Replace sample open data rendering with production Canvas rendering:
   - Track title.
   - Friend avatar/name.
   - Total time.
   - Best lap tie-breaker.
   - Empty state.
5. Define ad rules:
   - Interstitial only after race finish or safe menu transition.
   - Rewarded video only for explicit opt-in rewards.
   - Never show ads while driving.
6. Define failure behavior when WeChat APIs are unavailable:
   - No blocking modal.
   - No broken UI copy.
   - Console fallback is acceptable in dev builds.
7. Add final copy for share/leaderboard/ad prompts.

## Acceptance criteria

- Ads never appear during active driving.
- Share and leaderboard do not block restart.
- Player can ignore monetization entries and still enjoy the game.
- All platform service failures degrade gracefully.
- WeChat adapter is used only when `globalThis.wx` exists.
- Non-WeChat environments keep noop fallback services.
- Share payload includes selected track metadata.
- Leaderboard payload includes selected track metadata.
- Open data context receives and safely handles `submitRacerScore`.
- Open data context receives and safely handles `showRacerLeaderboard`.
- Each track uses a separate ranking key.
