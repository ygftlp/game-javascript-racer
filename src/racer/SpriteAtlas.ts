export interface AtlasFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const BACKGROUND = {
  HILLS: { x: 5, y: 5, w: 1280, h: 480 },
  SKY: { x: 5, y: 495, w: 1280, h: 480 },
  TREES: { x: 5, y: 985, w: 1280, h: 480 }
} as const satisfies Record<string, AtlasFrame>;

export const SPRITES = {
  PALM_TREE: { x: 5, y: 5, w: 215, h: 540 },
  BILLBOARD08: { x: 230, y: 5, w: 385, h: 265 },
  TREE1: { x: 625, y: 5, w: 360, h: 360 },
  DEAD_TREE1: { x: 5, y: 555, w: 135, h: 332 },
  BILLBOARD09: { x: 150, y: 555, w: 328, h: 282 },
  BOULDER3: { x: 230, y: 280, w: 320, h: 220 },
  COLUMN: { x: 995, y: 5, w: 200, h: 315 },
  BILLBOARD01: { x: 625, y: 375, w: 300, h: 170 },
  BILLBOARD06: { x: 488, y: 555, w: 298, h: 190 },
  BILLBOARD05: { x: 5, y: 897, w: 298, h: 190 },
  BILLBOARD07: { x: 313, y: 897, w: 298, h: 190 },
  BOULDER2: { x: 621, y: 897, w: 298, h: 140 },
  TREE2: { x: 1205, y: 5, w: 282, h: 295 },
  BILLBOARD04: { x: 1205, y: 310, w: 268, h: 170 },
  DEAD_TREE2: { x: 1205, y: 490, w: 150, h: 260 },
  BOULDER1: { x: 1205, y: 760, w: 168, h: 248 },
  BUSH1: { x: 5, y: 1097, w: 240, h: 155 },
  CACTUS: { x: 929, y: 897, w: 235, h: 118 },
  BUSH2: { x: 255, y: 1097, w: 232, h: 152 },
  BILLBOARD03: { x: 5, y: 1262, w: 230, h: 220 },
  BILLBOARD02: { x: 245, y: 1262, w: 215, h: 220 },
  STUMP: { x: 995, y: 330, w: 195, h: 140 },
  SEMI: { x: 1365, y: 490, w: 122, h: 144 },
  TRUCK: { x: 1365, y: 644, w: 100, h: 78 },
  CAR03: { x: 1383, y: 760, w: 88, h: 55 },
  CAR02: { x: 1383, y: 825, w: 80, h: 59 },
  CAR04: { x: 1383, y: 894, w: 80, h: 57 },
  CAR01: { x: 1205, y: 1018, w: 80, h: 56 },
  PLAYER_UPHILL_LEFT: { x: 1383, y: 961, w: 80, h: 45 },
  PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w: 80, h: 45 },
  PLAYER_UPHILL_RIGHT: { x: 1385, y: 1018, w: 80, h: 45 },
  PLAYER_LEFT: { x: 995, y: 480, w: 80, h: 41 },
  PLAYER_STRAIGHT: { x: 1085, y: 480, w: 80, h: 41 },
  PLAYER_RIGHT: { x: 995, y: 531, w: 80, h: 41 }
} as const satisfies Record<string, AtlasFrame>;

export const SPRITE_SCALE = 0.3 * (1 / SPRITES.PLAYER_STRAIGHT.w);

export const BACKGROUND_LAYERS = {
  sky: BACKGROUND.SKY,
  hills: BACKGROUND.HILLS,
  trees: BACKGROUND.TREES
} as const;

export const PLAYER_SPRITES = {
  left: SPRITES.PLAYER_LEFT,
  straight: SPRITES.PLAYER_STRAIGHT,
  right: SPRITES.PLAYER_RIGHT,
  uphillLeft: SPRITES.PLAYER_UPHILL_LEFT,
  uphillStraight: SPRITES.PLAYER_UPHILL_STRAIGHT,
  uphillRight: SPRITES.PLAYER_UPHILL_RIGHT
} as const;

export const TRAFFIC_SPRITES = {
  car01: SPRITES.CAR01,
  car02: SPRITES.CAR02,
  car03: SPRITES.CAR03,
  car04: SPRITES.CAR04,
  semi: SPRITES.SEMI,
  truck: SPRITES.TRUCK
} as const;

export const BILLBOARD_SPRITES = {
  billboard01: SPRITES.BILLBOARD01,
  billboard02: SPRITES.BILLBOARD02,
  billboard03: SPRITES.BILLBOARD03,
  billboard04: SPRITES.BILLBOARD04,
  billboard05: SPRITES.BILLBOARD05,
  billboard06: SPRITES.BILLBOARD06,
  billboard07: SPRITES.BILLBOARD07,
  billboard08: SPRITES.BILLBOARD08,
  billboard09: SPRITES.BILLBOARD09
} as const;

export const PLANT_SPRITES = {
  tree1: SPRITES.TREE1,
  tree2: SPRITES.TREE2,
  deadTree1: SPRITES.DEAD_TREE1,
  deadTree2: SPRITES.DEAD_TREE2,
  palmTree: SPRITES.PALM_TREE,
  bush1: SPRITES.BUSH1,
  bush2: SPRITES.BUSH2,
  cactus: SPRITES.CACTUS
} as const;

export const PROP_SPRITES = {
  column: SPRITES.COLUMN,
  stump: SPRITES.STUMP,
  boulder1: SPRITES.BOULDER1,
  boulder2: SPRITES.BOULDER2,
  boulder3: SPRITES.BOULDER3
} as const;

export const SPRITE_GROUPS = {
  player: PLAYER_SPRITES,
  traffic: TRAFFIC_SPRITES,
  roadside: {
    billboards: BILLBOARD_SPRITES,
    plants: PLANT_SPRITES,
    props: PROP_SPRITES
  }
} as const;

export const BILLBOARDS = Object.values(BILLBOARD_SPRITES);
export const PLANTS = [...Object.values(PLANT_SPRITES), PROP_SPRITES.stump, PROP_SPRITES.boulder1, PROP_SPRITES.boulder2, PROP_SPRITES.boulder3];
export const PROPS = Object.values(PROP_SPRITES);
export const CARS = Object.values(TRAFFIC_SPRITES);
