import {
  recommendationConfig,
  type RoutePoint,
  type TransportType,
} from "./cityDatabase";

import { getDistanceKm } from "./cityRecommendations";

type GenerateRouteOptions = {
  originId: string;
  destinationId: string;
  start: RoutePoint;
  end: RoutePoint;
  transport: TransportType;
};

function createSeed(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed;

  return () => {
    state =
      (Math.imul(state, 1664525) +
        1013904223) >>>
      0;

    return state / 4294967296;
  };
}

function generateLandRoute(
  start: RoutePoint,
  end: RoutePoint,
  seed: number,
  transport: "train" | "bus",
): RoutePoint[] {
  const distanceKm = getDistanceKm(start, end);

  const waypointSpacing =
    transport === "bus"
      ? recommendationConfig.trainWaypointSpacingKm *
        0.75
      : recommendationConfig.trainWaypointSpacingKm;

  const segmentCount = Math.min(
    10,
    Math.max(
      3,
      Math.round(distanceKm / waypointSpacing),
    ),
  );

  const latitudeDifference = end[0] - start[0];
  const longitudeDifference = end[1] - start[1];

  const routeLength =
    Math.hypot(
      latitudeDifference,
      longitudeDifference,
    ) || 1;

  const perpendicularLatitude =
    -longitudeDifference / routeLength;

  const perpendicularLongitude =
    latitudeDifference / routeLength;

  const maximumOffset = Math.min(
    routeLength *
      recommendationConfig.trainRandomness,
    0.16,
  );

  const random = createRandom(seed);
  const route: RoutePoint[] = [start];

  let previousProgress = 0;
  let offsetDirection = 0;

  for (
    let index = 1;
    index < segmentCount;
    index += 1
  ) {
    const baseProgress = index / segmentCount;

    const spacingJitter =
      (random() - 0.5) *
      (0.35 / segmentCount);

    const progress = Math.min(
      0.95,
      Math.max(
        previousProgress + 0.05,
        baseProgress + spacingJitter,
      ),
    );

    previousProgress = progress;

    const targetDirection =
      (random() - 0.5) * 2;

    offsetDirection =
      offsetDirection * 0.55 +
      targetDirection * 0.45;

    const routeEnvelope = Math.sin(
      Math.PI * progress,
    );

    const offset =
      offsetDirection *
      maximumOffset *
      routeEnvelope;

    route.push([
      start[0] +
        latitudeDifference * progress +
        perpendicularLatitude * offset,

      start[1] +
        longitudeDifference * progress +
        perpendicularLongitude * offset,
    ]);
  }

  route.push(end);

  return route;
}

function generateCurvedRoute(
  start: RoutePoint,
  end: RoutePoint,
  seed: number,
  curveStrength: number,
): RoutePoint[] {
  const latitudeDifference = end[0] - start[0];
  const longitudeDifference = end[1] - start[1];

  const routeLength =
    Math.hypot(
      latitudeDifference,
      longitudeDifference,
    ) || 1;

  const perpendicularLatitude =
    -longitudeDifference / routeLength;

  const perpendicularLongitude =
    latitudeDifference / routeLength;

  const direction =
    seed % 2 === 0 ? 1 : -1;

  const midpointLatitude =
    (start[0] + end[0]) / 2;

  const midpointLongitude =
    (start[1] + end[1]) / 2;

  const controlPoint: RoutePoint = [
    midpointLatitude +
      perpendicularLatitude *
        routeLength *
        curveStrength *
        direction,

    midpointLongitude +
      perpendicularLongitude *
        routeLength *
        curveStrength *
        direction,
  ];

  const route: RoutePoint[] = [];
  const pointCount = 14;

  for (
    let index = 0;
    index <= pointCount;
    index += 1
  ) {
    const progress = index / pointCount;
    const inverseProgress = 1 - progress;

    route.push([
      inverseProgress ** 2 * start[0] +
        2 *
          inverseProgress *
          progress *
          controlPoint[0] +
        progress ** 2 * end[0],

      inverseProgress ** 2 * start[1] +
        2 *
          inverseProgress *
          progress *
          controlPoint[1] +
        progress ** 2 * end[1],
    ]);
  }

  return route;
}

export function generateRoute({
  originId,
  destinationId,
  start,
  end,
  transport,
}: GenerateRouteOptions): RoutePoint[] {
  const seed = createSeed(
    `${originId}:${destinationId}:${transport}`,
  );

  if (transport === "plane") {
    return generateCurvedRoute(
      start,
      end,
      seed,
      recommendationConfig.planeCurveStrength,
    );
  }

  if (transport === "ferry") {
    return generateCurvedRoute(
      start,
      end,
      seed,
      recommendationConfig.planeCurveStrength *
        0.45,
    );
  }

  return generateLandRoute(
    start,
    end,
    seed,
    transport,
  );
}