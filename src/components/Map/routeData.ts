export type RoutePoint = [number, number];

export const barcelonaPosition: RoutePoint = [
  41.3874,
  2.1686,
];

export const valenciaPosition: RoutePoint = [
  39.4699,
  -0.3763,
];

export const zaragozaPosition: RoutePoint = [
  41.6488,
  -0.8891,
];

export const madridPosition: RoutePoint = [
  40.4168,
  -3.7038,
];

export const montpellierPosition: RoutePoint = [
  43.6108,
  3.8767,
];

export const palmaPosition: RoutePoint = [
  39.5696,
  2.6502,
];

export const barcelonaToValenciaRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.32, 2.05],
  [41.26, 1.93],
  [41.22, 1.72],
  [41.18, 1.52],
  [41.12, 1.25],
  [41.08, 1.08],
  [41.02, 0.92],
  [40.91, 0.82],
  [40.78, 0.72],
  [40.66, 0.61],
  [40.54, 0.48],
  [40.43, 0.36],
  [40.32, 0.26],
  [40.2, 0.15],
  [40.08, 0.03],
  [39.96, -0.08],
  [39.84, -0.16],
  [39.72, -0.23],
  [39.61, -0.3],
  [39.53, -0.34],
  [39.4699, -0.3763],
];

export const barcelonaToZaragozaRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.44, 1.95],
  [41.49, 1.7],
  [41.53, 1.43],
  [41.56, 1.16],
  [41.59, 0.88],
  [41.61, 0.58],
  [41.63, 0.27],
  [41.64, -0.03],
  [41.648, -0.31],
  [41.6485, -0.59],
  [41.6488, -0.8891],
];

export const barcelonaToMadridRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.28, 1.88],
  [41.2, 1.52],
  [41.16, 1.12],
  [41.12, 0.68],
  [41.08, 0.22],
  [41.02, -0.25],
  [40.94, -0.74],
  [40.84, -1.2],
  [40.74, -1.65],
  [40.65, -2.08],
  [40.57, -2.49],
  [40.5, -2.88],
  [40.45, -3.29],
  [40.4168, -3.7038],
];

export const barcelonaToMontpellierRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.55, 2.25],
  [41.75, 2.38],
  [41.98, 2.55],
  [42.2, 2.7],
  [42.42, 2.82],
  [42.65, 2.9],
  [42.88, 3.0],
  [43.1, 3.18],
  [43.3, 3.38],
  [43.47, 3.62],
  [43.6108, 3.8767],
];

/*
  Curved flight arc from Barcelona to Palma.
  The route bows east over the Mediterranean
  before curving back toward Mallorca.
*/
export const barcelonaToPalmaRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.27, 2.43],
  [41.1, 2.68],
  [40.9, 2.9],
  [40.67, 3.07],
  [40.43, 3.16],
  [40.18, 3.15],
  [39.95, 3.05],
  [39.76, 2.88],
  [39.63, 2.72],
  [39.5696, 2.6502],
];