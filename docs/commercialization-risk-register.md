# Commercialization Risk Register

This register tracks risks that can block or weaken commercial release.

## Risk levels

- `P0 blocker`: cannot launch until resolved.
- `P1 high`: launch should wait unless explicitly accepted by Commercialization Director.
- `P2 medium`: can soft-launch with monitoring.
- `P3 low`: track after release.

## Risk 1: unlicensed legacy assets

Level: P0 blocker.

Risk:

The original project includes legacy placeholder art/music patterns that may not be safe for commercial release.

Mitigation:

- Use `commercial-template` asset pack before release.
- Replace background, sprites, music, logo, icons, and sfx with commercial-safe files.
- Record source/license for every asset.
- Keep `npm run assets:commercial` and `npm run assets:commercial:apply` in the deployment flow.

Owner:

- Licensing & Compliance Agent
- Art & Audio Production Agent

## Risk 2: real brand or trademark exposure

Level: P0 blocker.

Risk:

Car shapes, billboards, logos, UI names, or share images could imply real brand affiliation.

Mitigation:

- Use fictional brands only.
- Avoid real car manufacturer names and badges.
- Avoid real sponsor billboards unless licensed.
- Review all share images and icons before launch.

Owner:

- Licensing & Compliance Agent
- Growth & Publishing Agent

## Risk 3: ads interrupt gameplay

Level: P0 blocker.

Risk:

Ads shown during active driving would damage player trust and may violate expected game flow.

Mitigation:

- Only request interstitial after race finish or safe menu transitions.
- Rewarded ads must be explicit opt-in.
- Keep ad calls behind `RacerServices.ads`.
- QA checks must confirm no ad during active driving.

Owner:

- Monetization Strategy Agent
- Commercial QA Agent

## Risk 4: leaderboard mixes tracks

Level: P1 high.

Risk:

Scores from different tracks could be compared incorrectly.

Mitigation:

- Use `trackId` in every score payload.
- Use per-track key `racer.score.${trackId}`.
- Validate open data context stores and reads per-track keys.
- Keep `docs/open-data-leaderboard-protocol.md` as source of truth.

Owner:

- Platform Integration Agent
- LiveOps & Analytics Agent

## Risk 5: poor control feel on target devices

Level: P1 high.

Risk:

Joystick/brake layout or sensitivity presets may feel bad on small phones or high-DPI screens.

Mitigation:

- Test on small, mid-range, and high-DPI devices.
- Tune `舒适 / 标准 / 灵敏` profiles.
- Capture real-device screenshots and videos.
- Do not monetize before controls feel acceptable.

Owner:

- Product & Gameplay Agent
- Commercial QA Agent

## Risk 6: player car visibility regression

Level: P1 high.

Risk:

Player car could disappear or become unclear on hills, curves, traffic, or low-resolution assets.

Mitigation:

- Keep fallback body enabled.
- Test hills, curves, collisions, traffic, and lap wraparound.
- Replace low-resolution assets.
- Tune road/player contrast before release.

Owner:

- Product & Gameplay Agent
- Art & Audio Production Agent
- Commercial QA Agent

## Risk 7: WeChat service misconfiguration

Level: P1 high.

Risk:

Share, leaderboard, ads, or analytics may fail in real WeChat targets even if code builds.

Mitigation:

- Keep `RacerWechatConfig.ts` isolated.
- Do not commit secrets or production-only IDs.
- Test in WeChat DevTools and real devices.
- Keep noop fallback for non-WeChat environments.

Owner:

- Platform Integration Agent

## Risk 8: weak retention after first race

Level: P2 medium.

Risk:

Players may finish one race and not replay.

Mitigation:

- Make result screen replay-first.
- Emphasize friend ranking and best-lap improvement.
- Add track variety only after base loop is stable.
- Track second race start rate.

Owner:

- Product & Gameplay Agent
- LiveOps & Analytics Agent

## Risk 9: poor share conversion

Level: P2 medium.

Risk:

Share copy or image may not attract new players.

Mitigation:

- Include track name and time in share copy.
- Add an attractive share image when final art is ready.
- Track share taps and share-to-open conversion.
- Avoid spammy copy.

Owner:

- Growth & Publishing Agent

## Risk 10: package size or FPS issue

Level: P1 high if severe; P2 medium if manageable.

Risk:

Commercial art/audio could increase package size or hurt performance.

Mitigation:

- Keep art atlases optimized.
- Compress audio.
- Check FPS on low-end and mid-range devices.
- Tune draw distance and traffic count if needed.

Owner:

- Art & Audio Production Agent
- Commercial QA Agent

## Risk 11: policy changes or platform approval issues

Level: P1 high.

Risk:

WeChat rules for ads, sharing, privacy, or mini games can change.

Mitigation:

- Review current WeChat platform rules before release.
- Keep ad and share behavior conservative.
- Do not store unnecessary personal data.
- Use platform-approved APIs only.

Owner:

- Licensing & Compliance Agent
- Platform Integration Agent

## Risk 12: scope creep before first launch

Level: P2 medium.

Risk:

Adding too many tracks, skins, or systems can delay the first commercial release.

Mitigation:

- Keep first launch focused on a small polished package.
- Move expansion ideas to post-launch roadmap.
- Commercialization Director owns scope cuts.

Owner:

- Commercialization Director

## Risk review cadence

Review before every release candidate:

```text
Risk:
Level:
Owner:
Status: open / mitigated / accepted / closed
Evidence:
Next action:
```
