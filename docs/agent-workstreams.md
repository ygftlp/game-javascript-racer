# Multi-Agent Workstream Plan

The project can be divided into independent lanes so several contributors or coding agents can work in parallel without mixing responsibilities.

## Lane A: Runtime Integration Agent

Scope:

- `src/main.wx.ts`
- `src/scenes/`
- `src/racer/RacerAssets.ts`
- `src/racer/RacerServices.ts`
- `src/racer/RacerStorage.ts`

Responsibilities:

- Keep gameplay running through `lite-game-engine`.
- Avoid direct `wx` / DOM access in business code.
- Integrate asset-pack selection, service adapters, and platform-safe storage.

Do not own:

- Sprite coordinates.
- Raw art/audio files.
- Commercial asset licensing decisions.

## Lane B: Asset Taxonomy Agent

Scope:

- `src/racer/SpriteAtlas.ts`
- `src/racer/RacerAssetManifest.ts`
- `assets/packs/*/manifest.json`
- `docs/asset-replacement-guide.md`

Responsibilities:

- Maintain stable frame names and category groupings.
- Review atlas coordinate changes.
- Keep replacement instructions accurate.

Do not own:

- Gameplay physics.
- UI flow.
- WeChat service implementation.

## Lane C: Art Replacement Agent

Scope:

- `assets/packs/default/images/`
- Source art files that generate the runtime atlas.

Responsibilities:

- Produce commercial-safe `background.png` and `sprites.png` replacements.
- Preserve atlas frame names or coordinate documentation.
- Verify visual readability in WeChat DevTools.

Do not own:

- TypeScript runtime changes except coordinated atlas coordinate updates.

## Lane D: Audio Replacement Agent

Scope:

- `assets/packs/default/audio/music/`
- `assets/packs/default/audio/sfx/`

Responsibilities:

- Provide commercial-safe music and sound effects.
- Keep package size reasonable for WeChat.
- Validate playback on device.

## Lane E: Monetization and Social Agent

Scope:

- Real implementation behind `RacerServices`.
- Future WeChat share, leaderboard, ads, analytics adapters.

Responsibilities:

- Keep platform APIs behind service boundaries.
- Avoid spreading `wx` calls into gameplay code.
- Document app id, ad unit ids, and open-data-domain assumptions outside source code.

## Lane F: QA and Performance Agent

Scope:

- `src/racer/RacerTuning.ts`
- manual test plans
- WeChat DevTools / real-device validation

Responsibilities:

- Tune draw distance and traffic count.
- Verify FPS, memory, package size, touch controls, audio behavior, and gameplay feel.
- Report regressions with device model and active tuning profile.

## Branching rule

Use focused commits and PRs by lane. A change that touches more than two lanes should include a short migration note in the PR description.
