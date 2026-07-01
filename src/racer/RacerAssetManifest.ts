import { BACKGROUND_LAYERS, SPRITE_GROUPS } from './SpriteAtlas';

export type RacerAssetPackId = 'legacy' | 'commercial-template';

export interface RacerImageResources {
  backgroundAtlas: string;
  spriteAtlas: string;
  brandLogo?: string;
}

export interface RacerAudioResources {
  music: string;
  engineLoop?: string;
  crash?: string;
  menuConfirm?: string;
}

export interface RacerReplacementCategory {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

export interface RacerAssetPackManifest {
  id: RacerAssetPackId;
  label: string;
  version: string;
  commercialSafe: boolean;
  images: RacerImageResources;
  audio: RacerAudioResources;
  atlas: {
    background: typeof BACKGROUND_LAYERS;
    sprites: typeof SPRITE_GROUPS;
  };
  replacementCategories: RacerReplacementCategory[];
}

export const RACER_REPLACEMENT_CATEGORIES: RacerReplacementCategory[] = [
  {
    id: 'background.sky-hills-trees',
    label: '背景层',
    description: '天空、远山、树线。建议保持横向可循环或足够宽，避免高速行驶时出现明显接缝。',
    required: true
  },
  {
    id: 'sprites.player-car',
    label: '玩家车辆',
    description: '左转、直行、右转、上坡角度。替换时要保持车体朝向和锚点一致。',
    required: true
  },
  {
    id: 'sprites.traffic-cars',
    label: '交通车辆',
    description: '普通车辆、卡车、半挂车。宽度会参与碰撞估算，尺寸变化后需要真机调参。',
    required: true
  },
  {
    id: 'ui.brand-logo',
    label: '品牌 Logo',
    description: '主菜单标题区 Logo。推荐透明 PNG，代码会优先显示图片 Logo，缺失时回退到程序化 Logo。',
    required: false
  },
  {
    id: 'sprites.roadside-billboards',
    label: '路边广告牌',
    description: '可替换为品牌牌、路标、赛道提示牌。注意不要使用未授权商标。',
    required: false
  },
  {
    id: 'sprites.roadside-plants',
    label: '路边植物',
    description: '树、灌木、仙人掌等环境物体。主要影响赛道风格和视觉密度。',
    required: false
  },
  {
    id: 'sprites.roadside-props',
    label: '路边障碍物',
    description: '柱子、树桩、石头等会参与越野碰撞的物体。替换后要检查碰撞手感。',
    required: false
  },
  {
    id: 'audio.music',
    label: '背景音乐',
    description: '微信环境建议提供 mp3，控制包体大小并注意循环点。',
    required: false
  },
  {
    id: 'audio.sfx',
    label: '音效',
    description: '预留引擎声、碰撞、按钮确认音效，目前代码只接入背景音乐。',
    required: false
  }
];

export const LEGACY_RACER_ASSET_PACK: RacerAssetPackManifest = {
  id: 'legacy',
  label: 'Legacy OutRun-style demo assets',
  version: '0.1.0',
  commercialSafe: false,
  images: {
    backgroundAtlas: 'images/background.png',
    spriteAtlas: 'images/sprites.png'
  },
  audio: {
    music: 'music/racer.mp3'
  },
  atlas: {
    background: BACKGROUND_LAYERS,
    sprites: SPRITE_GROUPS
  },
  replacementCategories: RACER_REPLACEMENT_CATEGORIES
};

export const COMMERCIAL_TEMPLATE_ASSET_PACK: RacerAssetPackManifest = {
  ...LEGACY_RACER_ASSET_PACK,
  id: 'commercial-template',
  label: 'Commercial-safe replacement template',
  commercialSafe: true,
  images: {
    backgroundAtlas: 'assets/packs/default/images/background.png',
    spriteAtlas: 'assets/packs/default/images/sprites.png',
    brandLogo: 'assets/packs/default/images/ui/logo.png'
  },
  audio: {
    music: 'assets/packs/default/audio/music/racer.mp3',
    engineLoop: 'assets/packs/default/audio/sfx/engine-loop.mp3',
    crash: 'assets/packs/default/audio/sfx/crash.mp3',
    menuConfirm: 'assets/packs/default/audio/sfx/menu-confirm.mp3'
  }
};

export const ACTIVE_RACER_ASSET_PACK = LEGACY_RACER_ASSET_PACK;
