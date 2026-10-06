const BASE_DIAMETER_RATIOS = [0.085, 0.125, 0.175, 0.24, 0.32, 0.42];
const scaled = (ratios, scale) => ratios.map(value => Number((value * scale).toFixed(4)));

export const CONFIG = {
  width: 420, height: 560,
  imageFill: 0.95,
  weights: [0.55, 0.30, 0.15],
  gravity: 1.35, restitution: 0.12, friction: 0.25,
  frictionStatic: 0.55, frictionAir: 0.008, density: 0.002,
  dangerY: 116, dangerDelay: 1800, spawnGrace: 1300,
  dropY: 52, dropDelay: 430, fixedStep: 1000 / 60,
};

export const STAGES = [
  {
    id: 1, title: '合成大西瓜', displayTitle: '第一关 · 合成大西瓜',
    diameterRatios: scaled([...BASE_DIAMETER_RATIOS, 0.48], 1.05),
    points: [0, 2, 4, 8, 16, 32, 64], maxLevelClearPoints: 128, clearTarget: 5,
    assets: [1,2,3,4,5,6,7].map(n => new URL(`../assets/0${n}.png`, import.meta.url).href),
  },
  {
    id: 2, title: '合成大嫂子', displayTitle: '第二关 · 合成大嫂子',
    diameterRatios: scaled(BASE_DIAMETER_RATIOS, 1.10),
    points: [0, 2, 4, 8, 16, 32], maxLevelClearPoints: 64, clearTarget: null,
    assets: [1,2,3,4,5,6].map(n => new URL(`../assets/${n}.png`, import.meta.url).href),
  },
];
