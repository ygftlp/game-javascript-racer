# Commercialization Notes

This project can use the MIT-licensed game code as a commercial foundation, but the current demo assets are not ready for commercial release.

## Licensing and asset risks

- Keep the original MIT license and copyright notice with any distribution that includes substantial portions of the original code.
- Replace the included music before publishing a commercial derivative. The original README notes that the music is licensed only for the original project.
- Replace the placeholder sprite graphics before publishing a commercial derivative. The original README notes that the sprites were borrowed as teaching placeholders.
- Replace or redesign the visual identity, game title, UI, background art, vehicles, roadside objects, and audio before marketplace submission or client delivery.

## Recommended product direction

Position the game as a lightweight retro arcade racer rather than a large racing simulation.

Good first commercial formats:

- Web arcade game for browser-game portals.
- Branded mini-game template for campaigns and events.
- Embeddable game widget for landing pages.
- Mobile web game with touch controls.
- Later, a wrapped Android/iOS app after the web version is proven.

## Minimum commercial MVP

1. Replace all copyrighted or placeholder art and audio.
2. Add a start screen and result screen.
3. Add touch controls for mobile.
4. Add local best lap and session stats.
5. Add a small set of original vehicle skins.
6. Add configurable track themes.
7. Add platform, ads, analytics, and save abstractions without hard-coding a vendor.
8. Add privacy and attribution pages before using ads or analytics.

## Commercial modules

The v4 modules are intentionally structured so commercial features can be added without changing the core driving model.

- `config.js`: central product, platform, ad, analytics, storage, and gameplay configuration.
- `platform.js`: platform abstraction for standalone web, iframe hosts, portals, and future app wrappers.
- `ads.js`: ad placement abstraction with no-op defaults.
- `analytics.js`: event tracking abstraction with no-op defaults.
- `save.js`: persistence abstraction for local storage and future platform cloud saves.
- `input.js`: keyboard bindings now; touch controls later.
- `track.js`: future stage, map, and theme configuration.
- `renderer.js`: future skin, theme, UI, and visual effect rendering.
- `traffic.js`: future AI difficulty and opponent behavior.

## Suggested monetization path

Start with a clean, asset-safe web version. Then test one or two channels instead of integrating every monetization option at once.

1. Self-hosted demo for validation and client pitching.
2. Portal build using the same platform hooks.
3. Branded white-label template for higher-value early revenue.
4. Ads or rewarded ads only after the game has proven retention.
5. Mobile wrapper only after controls, performance, and privacy are stable.
