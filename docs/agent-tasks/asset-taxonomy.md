# Agent B: Asset Taxonomy

## Mission

Keep asset categories, frame names, manifests, and replacement rules stable so art and audio can be replaced safely.

## Owns

- `src/racer/SpriteAtlas.ts`
- `src/racer/RacerAssetManifest.ts`
- `assets/packs/*/manifest.json`
- `docs/asset-replacement-guide.md`

## Immediate tasks

1. Freeze frame names for the commercial replacement atlas.
2. Review any new atlas export and update coordinates in `SpriteAtlas.ts`.
3. Keep player, traffic, billboard, plant, prop, background, and audio categories stable.
4. Confirm the active asset pack is not switched to commercial until required files exist.
5. Keep `docs/asset-replacement-guide.md` aligned with the runtime manifest.

## Done when

- `npm run validate:assets` passes for the commercial pack.
- Runtime can switch from legacy to commercial pack with one `ACTIVE_RACER_ASSET_PACK` change.
- All frame names are documented and understood by art production.
