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

export const alicantePosition: RoutePoint = [
  38.3452,
  -0.481,
];

/*
  TRAIN ROUTES

  Mostly directional, with a few uneven bends.
  They are stylised rather than exact railway tracks.
*/

export const barcelonaToValenciaRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.34, 2.03],
  [41.27, 1.78],
  [41.2, 1.5],
  [41.12, 1.25],
  [40.96, 0.91],
  [40.75, 0.58],
  [40.55, 0.34],
  [40.31, 0.14],
  [40.06, -0.02],
  [39.82, -0.19],
  [39.63, -0.3],
  [39.4699, -0.3763],
];

export const barcelonaToZaragozaRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.43, 1.92],
  [41.48, 1.61],
  [41.52, 1.29],
  [41.58, 0.94],
  [41.61, 0.59],
  [41.64, 0.25],
  [41.63, -0.12],
  [41.66, -0.48],
  [41.6488, -0.8891],
];

export const barcelonaToMadridRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.45, 1.83],
  [41.52, 1.47],
  [41.57, 1.08],
  [41.61, 0.68],
  [41.63, 0.26],
  [41.6488, -0.8891],
  [41.56, -1.25],
  [41.39, -1.63],
  [41.17, -2.01],
  [40.94, -2.38],
  [40.72, -2.76],
  [40.57, -3.13],
  [40.47, -3.45],
  [40.4168, -3.7038],
];

export const barcelonaToMontpellierRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.58, 2.35],
  [41.78, 2.54],
  [41.98, 2.82],
  [42.15, 2.9],
  [42.27, 2.96],
  [42.48, 2.92],
  [42.69, 2.89],
  [42.9, 2.94],
  [43.08, 2.98],
  [43.25, 3.1],
  [43.4, 3.35],
  [43.51, 3.61],
  [43.6108, 3.8767],
];

export const valenciaToAlicanteRoute: RoutePoint[] = [
  [39.4699, -0.3763],
  [39.36, -0.43],
  [39.19, -0.55],
  [38.99, -0.52],
  [38.81, -0.66],
  [38.64, -0.86],
  [38.49, -0.73],
  [38.4, -0.59],
  [38.3452, -0.481],
];

export const valenciaToMadridRoute: RoutePoint[] = [
  [39.4699, -0.3763],
  [39.54, -0.72],
  [39.62, -1.08],
  [39.75, -1.43],
  [39.88, -1.78],
  [40.02, -2.12],
  [40.17, -2.46],
  [40.28, -2.79],
  [40.36, -3.12],
  [40.4, -3.43],
  [40.4168, -3.7038],
];

/*
  FLIGHT ROUTE

  Smooth and curved intentionally.
*/

export const barcelonaToPalmaRoute: RoutePoint[] = [
  [41.3874, 2.1686],
  [41.2, 2.35],
  [40.99, 2.51],
  [40.77, 2.63],
  [40.55, 2.71],
  [40.32, 2.75],
  [40.1, 2.74],
  [39.9, 2.71],
  [39.72, 2.67],
  [39.5696, 2.6502],
];