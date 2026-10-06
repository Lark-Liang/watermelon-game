export const CONFIG = {
  title: '合成大西瓜',
  width: 420, height: 560,
  diameterRatios: [0.085, 0.125, 0.175, 0.24, 0.32, 0.42],
  points: [0, 2, 4, 8, 16, 32],
  maxLevelClearPoints: 64,
  imageFill: 0.95,
  weights: [0.55, 0.30, 0.15],
  gravity: 1.35, restitution: 0.12, friction: 0.25,
  frictionStatic: 0.55, frictionAir: 0.008, density: 0.002,
  dangerY: 116, dangerDelay: 1800, spawnGrace: 1300,
  dropY: 52, dropDelay: 430, fixedStep: 1000 / 60,
};
export const ASSETS = [1,2,3,4,5,6].map(n => new URL(`../assets/${n}.png`, import.meta.url).href);
