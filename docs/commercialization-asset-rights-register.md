# Commercialization Asset Rights Register

This register is the commercial-release source of truth for asset ownership, license status, replacement status, and launch approval.

Commercial release must not ship with unclear or unlicensed assets. Any row marked `P0 blocker` must be resolved before upload or public release.

## Status values

- `legacy-risk`: current placeholder / legacy asset is not approved for commercial release.
- `needed`: commercial replacement is required but not provided yet.
- `candidate`: replacement exists but license or QA is not fully approved yet.
- `approved`: replacement is cleared for commercial release.
- `fallback-approved`: optional asset is missing, but runtime fallback is approved for release.

## Approval fields

Every release asset should have:

- owner / creator
- source URL or internal file reference
- license type
- proof location
- modification rights
- commercial use permission
- redistribution permission inside WeChat mini game package
- approval owner
- approval date

## P0 release blockers

These must be `approved` before commercial release:

| Asset | Path | Current status | Required action | Owner |
|---|---|---:|---|---|
| Background atlas | `assets/packs/default/images/background.png` | needed | Provide commercial-safe background image and license proof. | Art & Audio Production Agent |
| Sprite atlas | `assets/packs/default/images/sprites.png` | needed | Provide commercial-safe player car, traffic, road props, and roadside sprites. | Art & Audio Production Agent |
| Background music | `assets/packs/default/audio/music/racer.mp3` | needed | Provide licensed music with commercial WeChat distribution rights. | Art & Audio Production Agent |
| Asset rights proof | `docs/commercialization-asset-rights-register.md` | needed | Fill owner/source/license/proof fields for all release assets. | Licensing & Compliance Agent |

## Optional but recommended assets

These may be `approved` or `fallback-approved` for first release.

| Asset | Path | Current status | Runtime fallback | Required action | Owner |
|---|---|---:|---|---|---|
| Brand logo | `assets/packs/default/images/ui/logo.png` | needed | Programmatic logo fallback | Provide commercial logo or approve fallback. | Art & Audio Production Agent |
| UI icon atlas | `assets/packs/default/images/ui/icons.png` | needed | Programmatic icon fallback | Provide commercial icon atlas or approve fallback. | Art & Audio Production Agent |
| Engine loop sfx | `assets/packs/default/audio/sfx/engine-loop.mp3` | needed | Silent/no optional sound | Provide licensed engine loop or approve no-sfx fallback. | Art & Audio Production Agent |
| Crash sfx | `assets/packs/default/audio/sfx/crash.mp3` | needed | Silent/no optional sound | Provide licensed crash sfx or approve no-sfx fallback. | Art & Audio Production Agent |
| Menu confirm sfx | `assets/packs/default/audio/sfx/menu-confirm.mp3` | needed | Silent/no optional sound | Provide licensed menu sfx or approve no-sfx fallback. | Art & Audio Production Agent |
| Share image | `release-private/share-card.png` or configured URL | needed | Text-only share | Provide commercial-safe share image or approve text-only sharing. | Growth & Publishing Agent |

## Asset register template

Copy one block per asset and fill before release.

```text
Asset id:
Path:
Category: image / audio / UI / share / other
Required for release: yes / no
Current status: legacy-risk / needed / candidate / approved / fallback-approved
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: yes / no / unknown
Modification allowed: yes / no / unknown
Redistribution in WeChat package allowed: yes / no / unknown
Contains real brand/trademark: yes / no / unknown
Contains AI-generated content: yes / no / unknown
AI tool/model and terms, if applicable:
Attribution required: yes / no
Attribution text, if required:
QA notes:
Approval owner:
Approval date:
```

## Commercial template asset rows

### 1. Background atlas

```text
Asset id: background.sky-hills-trees
Path: assets/packs/default/images/background.png
Category: image
Required for release: yes
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Must tile or cover landscape gameplay without visible seams. Must not reduce road readability.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 2. Sprite atlas

```text
Asset id: sprites.player-traffic-roadside
Path: assets/packs/default/images/sprites.png
Category: image
Required for release: yes
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Must include player car, traffic cars, roadside props, and billboard-safe art. Avoid real car brands or trademarked logos.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 3. Brand logo

```text
Asset id: ui.brand-logo
Path: assets/packs/default/images/ui/logo.png
Category: UI image
Required for release: no
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Optional. If missing, runtime uses programmatic logo fallback. Fallback still needs release approval.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 4. UI icon atlas

```text
Asset id: ui.icons
Path: assets/packs/default/images/ui/icons.png
Category: UI image
Required for release: no
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Optional. Recommended 4-column, 64px-cell transparent PNG matching `RacerUiIconAtlas.ts`. If missing, runtime uses programmatic icons fallback.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 5. Background music

```text
Asset id: audio.music
Path: assets/packs/default/audio/music/racer.mp3
Category: audio
Required for release: yes
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: no / unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Must be safe for commercial WeChat mini game distribution. Confirm loop quality and package size.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 6. Engine loop sfx

```text
Asset id: audio.sfx.engine-loop
Path: assets/packs/default/audio/sfx/engine-loop.mp3
Category: audio
Required for release: no
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: no / unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Optional. If missing, gameplay should continue with no engine-loop sfx.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 7. Crash sfx

```text
Asset id: audio.sfx.crash
Path: assets/packs/default/audio/sfx/crash.mp3
Category: audio
Required for release: no
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: no / unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Optional. If missing, gameplay should continue with no crash sfx.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 8. Menu confirm sfx

```text
Asset id: audio.sfx.menu-confirm
Path: assets/packs/default/audio/sfx/menu-confirm.mp3
Category: audio
Required for release: no
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: no / unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Optional. If missing, gameplay should continue with no menu-confirm sfx.
Approval owner: Licensing & Compliance Agent
Approval date:
```

### 9. Share card image

```text
Asset id: share.card
Path: release-private/share-card.png or configured `RacerWechatConfig.ts` imageUrl
Category: share image
Required for release: no
Current status: needed
Owner / creator:
Source:
License type:
License proof location:
Commercial use allowed: unknown
Modification allowed: unknown
Redistribution in WeChat package allowed: unknown
Contains real brand/trademark: unknown
Contains AI-generated content: unknown
AI tool/model and terms, if applicable:
Attribution required: unknown
Attribution text, if required:
QA notes: Optional. If missing, share can use text-only copy. If provided, image must not contain unlicensed logos, real brands, or misleading claims.
Approval owner: Licensing & Compliance Agent
Approval date:
```

## Legacy asset warning

The legacy pack is only acceptable for migration testing. It is not approved for commercial release.

Legacy paths:

```text
images/background.png
images/sprites.png
music/racer.mp3
```

Before release, run:

```bash
npm run assets:commercial
npm run assets:commercial:apply
npm run validate:production
npm run build:wx
```

## Approval rule

Commercial release can proceed only when:

- every required asset is `approved`
- every optional asset is either `approved` or `fallback-approved`
- every asset has owner/source/license/proof fields filled or an explicit fallback approval
- no P0 licensing blocker remains open in `docs/commercialization-risk-register.md`
