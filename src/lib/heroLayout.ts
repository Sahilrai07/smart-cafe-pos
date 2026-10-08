export interface ElementTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface HeroTextConfig extends ElementTransform {
  width: number;
  fontSize: number;
  textAlign: 'center' | 'left' | 'right';
  headlineText: string;
  subtitleText: string;
}

export interface CardConfig extends ElementTransform {
  width: number;
}

export interface HeroLayoutConfig {
  canvasHeight: number;
  heroText: HeroTextConfig;
  card1: CardConfig;
  card2: CardConfig;
  card3: CardConfig;
}

export const DEFAULT_HERO_LAYOUT: HeroLayoutConfig = {
  canvasHeight: 700,
  heroText: {
    x: 395,
    y: 90,
    width: 650, // Ideal width for clean 3-line layout
    fontSize: 58,
    scale: 1.0,
    rotation: 0,
    zIndex: 10,
    textAlign: 'center',
    headlineText: 'Next-Gen Operating System for Modern Cafes',
    subtitleText:
      'Optimize operations, delight customers, and scale your business with the ultimate cloud-based platform for cafes and small restaurants.',
  },
  card1: {
    x: 50,
    y: 70,
    width: 335,
    scale: 1.0,
    rotation: -2,
    zIndex: 2,
  },
  card2: {
    x: 75,
    y: 385,
    width: 375,
    scale: 1.0,
    rotation: -1,
    zIndex: 2,
  },
  card3: {
    x: 1030,
    y: 175,
    width: 365,
    scale: 1.0,
    rotation: 2,
    zIndex: 2,
  },
};

export const PRESETS: Record<string, HeroLayoutConfig> = {
  'option1-mockup': {
    ...DEFAULT_HERO_LAYOUT,
    heroText: {
      ...DEFAULT_HERO_LAYOUT.heroText,
      x: 395,
      y: 90,
      width: 650,
      fontSize: 58,
    },
    card1: { x: 50, y: 70, width: 335, scale: 1.0, rotation: -2, zIndex: 2 },
    card2: { x: 75, y: 385, width: 375, scale: 1.0, rotation: -1, zIndex: 2 },
    card3: { x: 1030, y: 175, width: 365, scale: 1.0, rotation: 2, zIndex: 2 },
  },
  'two-lines-wide': {
    ...DEFAULT_HERO_LAYOUT,
    heroText: {
      ...DEFAULT_HERO_LAYOUT.heroText,
      x: 270,
      y: 90,
      width: 900, // Wide stretch for 2 lines
      fontSize: 56,
    },
    card1: { x: 30, y: 360, width: 320, scale: 0.95, rotation: -2, zIndex: 2 },
    card2: { x: 370, y: 440, width: 350, scale: 0.95, rotation: 0, zIndex: 3 },
    card3: { x: 1050, y: 360, width: 340, scale: 0.95, rotation: 2, zIndex: 2 },
  },
  'four-lines-compact': {
    ...DEFAULT_HERO_LAYOUT,
    heroText: {
      ...DEFAULT_HERO_LAYOUT.heroText,
      x: 470,
      y: 70,
      width: 500, // Compact stretch for 4 lines
      fontSize: 54,
    },
    card1: { x: 60, y: 60, width: 340, scale: 1.0, rotation: -2, zIndex: 2 },
    card2: { x: 80, y: 370, width: 370, scale: 1.0, rotation: -1, zIndex: 2 },
    card3: { x: 1010, y: 160, width: 360, scale: 1.0, rotation: 2, zIndex: 2 },
  },
};
