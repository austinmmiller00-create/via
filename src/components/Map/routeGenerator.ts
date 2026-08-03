import {
  cities,
  recommendationConfig,
  type City,
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

type CorridorCandidate = {
  city: City;
  progress: number;
  corridorDistanceKm: number;
  detourKm: number;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function createSeed(value: string) {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
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

function degreesToRadians(value: number) {
  return value * (Math.PI / 180);
}

function toLocalKilometres(
  origin: RoutePoint,
  point: RoutePoint,
  referenceLatitude: number,
) {
  const latitudeKm =
    (point[0] - origin[0]) * 110.574;

  const longitudeKm =
    (point[1] - origin[1]) *
    111.32 *
    Math.cos(
      degreesToRadians(referenceLatitude),
    );

  return {
    x: longitudeKm,
    y: latitudeKm,
  };
}

function getCorridorPosition(
  start: RoutePoint,
  end: RoutePoint,
  point: RoutePoint,
) {
  const referenceLatitude =
    (start[0] + end[0]) / 2;

  const routeEnd = toLocalKilometres(
    start,
    end,
    referenceLatitude,
  );

  const routePoint = toLocalKilometres(
    start,
    point,
    referenceLatitude,
  );

  const routeLengthSquared =
    routeEnd.x ** 2 +
    routeEnd.y ** 2;

  if (routeLengthSquared === 0) {
    return {
      progress: 0,
      corridorDistanceKm: 0,
    };
  }

  const rawProgress =
    (routePoint.x * routeEnd.x +
      routePoint.y * routeEnd.y) /
    routeLengthSquared;

  const progress = clamp(
    rawProgress,
    0,
    1,
  );

  const projectedX =
    routeEnd.x * progress;

  const projectedY =
    routeEnd.y * progress;

  const corridorDistanceKm = Math.hypot(
    routePoint.x - projectedX,
    routePoint.y - projectedY,
  );

  return {
    progress,
    corridorDistanceKm,
  };
}

function getTrainWaypointCount(
  distanceKm: number,
) {
  if (distanceKm < 160) {
    return 0;
  }

  if (distanceKm < 350) {
    return 1;
  }

  if (distanceKm < 650) {
    return 2;
  }

  if (distanceKm < 950) {
    return 3;
  }

  return 4;
}

function getTrainCandidates(
  originId: string,
  destinationId: string,
  start: RoutePoint,
  end: RoutePoint,
) {
  const directDistanceKm =
    getDistanceKm(start, end);

  const corridorWidthKm = clamp(
    directDistanceKm * 0.09,
    28,
    95,
  );

  const maximumDetourKm = Math.max(
    55,
    directDistanceKm * 0.17,
  );

  return cities
    .filter(
      (city) =>
        city.enabled &&
        city.id !== originId &&
        city.id !== destinationId,
    )
    .map((city): CorridorCandidate => {
      const {
        progress,
        corridorDistanceKm,
      } = getCorridorPosition(
        start,
        end,
        city.position,
      );

      const journeyThroughCityKm =
        getDistanceKm(
          start,
          city.position,
        ) +
        getDistanceKm(
          city.position,
          end,
        );

      return {
        city,
        progress,
        corridorDistanceKm,
        detourKm:
          journeyThroughCityKm -
          directDistanceKm,
      };
    })
    .filter(
      (candidate) =>
        candidate.progress >= 0.08 &&
        candidate.progress <= 0.92 &&
        candidate.corridorDistanceKm <=
          corridorWidthKm &&
        candidate.detourKm <=
          maximumDetourKm,
    );
}

function getCityRouteBonus(city: City) {
  const populationBonus = clamp(
    Math.log10(
      Math.max(city.population, 10_000),
    ) - 4,
    0,
    3,
  );

  return (
    city.importance * 2.5 +
    populationBonus * 1.5
  );
}

function getCandidateTieBreaker(
  seed: number,
  cityId: string,
  targetIndex: number,
) {
  const value = createSeed(
    `${seed}:${cityId}:${targetIndex}`,
  );

  return (value % 1000) / 1000;
}

function selectTrainWaypoints(
  candidates: CorridorCandidate[],
  waypointCount: number,
  directDistanceKm: number,
  seed: number,
) {
  const selected: CorridorCandidate[] = [];
  const usedCityIds = new Set<string>();

  for (
    let index = 0;
    index < waypointCount;
    index += 1
  ) {
    const targetProgress =
      (index + 1) /
      (waypointCount + 1);

    const availableCandidates =
      candidates.filter((candidate) => {
        if (
          usedCityIds.has(candidate.city.id)
        ) {
          return false;
        }

        return selected.every(
          (selectedCandidate) =>
            Math.abs(
              selectedCandidate.progress -
                candidate.progress,
            ) >= 0.1,
        );
      });

    if (
      availableCandidates.length === 0
    ) {
      continue;
    }

    const bestCandidate =
      availableCandidates.reduce(
        (best, candidate) => {
          const progressDifferenceKm =
            Math.abs(
              candidate.progress -
                targetProgress,
            ) * directDistanceKm;

          const candidateScore =
            progressDifferenceKm * 0.7 +
            candidate.corridorDistanceKm *
              1.4 +
            candidate.detourKm * 0.55 -
            getCityRouteBonus(
              candidate.city,
            ) +
            getCandidateTieBreaker(
              seed,
              candidate.city.id,
              index,
            ) *
              5;

          const bestScore =
            Math.abs(
              best.progress -
                targetProgress,
            ) *
              directDistanceKm *
              0.7 +
            best.corridorDistanceKm *
              1.4 +
            best.detourKm * 0.55 -
            getCityRouteBonus(best.city) +
            getCandidateTieBreaker(
              seed,
              best.city.id,
              index,
            ) *
              5;

          return candidateScore <
            bestScore
            ? candidate
            : best;
        },
      );

    selected.push(bestCandidate);

    usedCityIds.add(
      bestCandidate.city.id,
    );
  }

  return selected.sort(
    (first, second) =>
      first.progress - second.progress,
  );
}

/*
  Creates sharp, angular bends between two major
  anchors. Every point is joined by a straight segment.
*/

function generateAngularTrainSegment(
  start: RoutePoint,
  end: RoutePoint,
  seed: number,
): RoutePoint[] {
  const distanceKm =
    getDistanceKm(start, end);

  if (distanceKm < 55) {
    return [start, end];
  }

  const bendCount = Math.min(
    5,
    Math.max(
      1,
      Math.round(distanceKm / 90),
    ),
  );

  const segmentCount = bendCount + 1;

  const latitudeDifference =
    end[0] - start[0];

  const longitudeDifference =
    end[1] - start[1];

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
    0.18,
  );

  const random = createRandom(seed);

  const route: RoutePoint[] = [start];

  let previousProgress = 0;

  let offsetDirection =
    random() >= 0.5 ? 1 : -1;

  for (
    let index = 1;
    index < segmentCount;
    index += 1
  ) {
    const baseProgress =
      index / segmentCount;

    const spacingJitter =
      (random() - 0.5) *
      (0.24 / segmentCount);

    const progress = clamp(
      baseProgress + spacingJitter,
      previousProgress + 0.06,
      0.94,
    );

    previousProgress = progress;

    /*
      Occasionally switch sides of the direct line.
      This creates purposeful angular direction changes
      rather than a smooth wave.
    */

    if (random() > 0.58) {
      offsetDirection *= -1;
    }

    const offsetStrength =
      0.4 + random() * 0.6;

    const routeEnvelope = Math.sin(
      Math.PI * progress,
    );

    const offset =
      offsetDirection *
      maximumOffset *
      offsetStrength *
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

function combineAngularTrainSegments(
  anchors: RoutePoint[],
  seed: number,
) {
  if (anchors.length < 2) {
    return anchors;
  }

  const route: RoutePoint[] = [
    anchors[0],
  ];

  for (
    let index = 0;
    index < anchors.length - 1;
    index += 1
  ) {
    const segmentStart = anchors[index];
    const segmentEnd = anchors[index + 1];

    const segmentSeed = createSeed(
      `${seed}:train-segment:${index}`,
    );

    const segment =
      generateAngularTrainSegment(
        segmentStart,
        segmentEnd,
        segmentSeed,
      );

    /*
      Exclude the first point because it is already the
      final point of the previous segment.
    */

    route.push(...segment.slice(1));
  }

  return route;
}

function generateTrainRoute(
  originId: string,
  destinationId: string,
  start: RoutePoint,
  end: RoutePoint,
  seed: number,
): RoutePoint[] {
  const directDistanceKm =
    getDistanceKm(start, end);

  const waypointCount =
    getTrainWaypointCount(
      directDistanceKm,
    );

  const candidates = getTrainCandidates(
    originId,
    destinationId,
    start,
    end,
  );

  const selectedWaypoints =
    selectTrainWaypoints(
      candidates,
      waypointCount,
      directDistanceKm,
      seed,
    );

  const anchors: RoutePoint[] = [
    start,
    ...selectedWaypoints.map(
      (candidate) =>
        candidate.city.position,
    ),
    end,
  ];

  /*
    Hidden towns are major anchors. Smaller sharp
    bends are generated between every pair of anchors.
  */

  return combineAngularTrainSegments(
    anchors,
    seed,
  );
}

function generateBusRoute(
  start: RoutePoint,
  end: RoutePoint,
  seed: number,
): RoutePoint[] {
  const distanceKm =
    getDistanceKm(start, end);

  const waypointSpacing =
    recommendationConfig
      .trainWaypointSpacingKm * 0.75;

  const segmentCount = Math.min(
    10,
    Math.max(
      3,
      Math.round(
        distanceKm / waypointSpacing,
      ),
    ),
  );

  const latitudeDifference =
    end[0] - start[0];

  const longitudeDifference =
    end[1] - start[1];

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
      recommendationConfig
        .trainRandomness,
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
    const baseProgress =
      index / segmentCount;

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
  const latitudeDifference =
    end[0] - start[0];

  const longitudeDifference =
    end[1] - start[1];

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
    const progress =
      index / pointCount;

    const inverseProgress =
      1 - progress;

    route.push([
      inverseProgress ** 2 *
        start[0] +
        2 *
          inverseProgress *
          progress *
          controlPoint[0] +
        progress ** 2 * end[0],

      inverseProgress ** 2 *
        start[1] +
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
  const connectionKey = [
    originId,
    destinationId,
  ]
    .sort()
    .join(":");

  const seed = createSeed(
    `${connectionKey}:${transport}`,
  );

  if (transport === "plane") {
    return generateCurvedRoute(
      start,
      end,
      seed,
      recommendationConfig
        .planeCurveStrength,
    );
  }

  if (transport === "ferry") {
    return generateCurvedRoute(
      start,
      end,
      seed,
      recommendationConfig
        .planeCurveStrength * 0.45,
    );
  }

  if (transport === "train") {
    return generateTrainRoute(
      originId,
      destinationId,
      start,
      end,
      seed,
    );
  }

  return generateBusRoute(
    start,
    end,
    seed,
  );
}