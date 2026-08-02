import {
  cities,
  getCityById,
  getPopulationBand,
  recommendationConfig,
  type City,
  type PopulationBand,
  type RoutePoint,
} from "./cityDatabase";

export type RecommendedCity = {
  city: City;
  distanceKm: number;
  score: number;
  directionDifferenceDegrees?: number;
};

type ScoredCandidate = RecommendedCity & {
  bearing: number;
  populationBand: PopulationBand;
  targetDifferenceKm: number;
};

function degreesToRadians(value: number) {
  return value * (Math.PI / 180);
}

function radiansToDegrees(value: number) {
  return value * (180 / Math.PI);
}

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

export function getDistanceKm(
  start: RoutePoint,
  end: RoutePoint,
) {
  const earthRadiusKm = 6371;

  const latitudeDifference = degreesToRadians(
    end[0] - start[0],
  );

  const longitudeDifference = degreesToRadians(
    end[1] - start[1],
  );

  const startLatitude = degreesToRadians(
    start[0],
  );

  const endLatitude = degreesToRadians(end[0]);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle =
    2 *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(1 - haversine),
    );

  return earthRadiusKm * centralAngle;
}

function getBearingDegrees(
  start: RoutePoint,
  end: RoutePoint,
) {
  const startLatitude = degreesToRadians(
    start[0],
  );

  const endLatitude = degreesToRadians(end[0]);

  const longitudeDifference = degreesToRadians(
    end[1] - start[1],
  );

  const y =
    Math.sin(longitudeDifference) *
    Math.cos(endLatitude);

  const x =
    Math.cos(startLatitude) *
      Math.sin(endLatitude) -
    Math.sin(startLatitude) *
      Math.cos(endLatitude) *
      Math.cos(longitudeDifference);

  return (
    radiansToDegrees(Math.atan2(y, x)) + 360
  ) % 360;
}

function getAngleDifference(
  firstAngle: number,
  secondAngle: number,
) {
  const difference =
    Math.abs(firstAngle - secondAngle) % 360;

  return difference > 180
    ? 360 - difference
    : difference;
}

function getDirectionScore(
  differenceDegrees?: number,
) {
  if (differenceDegrees === undefined) {
    return 0;
  }

  if (differenceDegrees <= 35) {
    return recommendationConfig
      .forwardDirectionBonus;
  }

  if (differenceDegrees <= 75) {
    return 12;
  }

  if (differenceDegrees <= 115) {
    return 2;
  }

  if (differenceDegrees <= 145) {
    return -14;
  }

  return recommendationConfig
    .strongBacktrackingPenalty;
}

function getTargetDistanceScore(
  targetDifferenceKm: number,
  toleranceKm: number,
) {
  const closeness =
    1 -
    targetDifferenceKm /
      Math.max(toleranceKm, 1);

  return clamp(
    8 + closeness * 38,
    4,
    46,
  );
}

function getDiversityAdjustment(
  candidate: ScoredCandidate,
  selectedCandidates: ScoredCandidate[],
) {
  if (selectedCandidates.length === 0) {
    return 0;
  }

  let adjustment = 0;

  for (const selected of selectedCandidates) {
    const bearingDifference = getAngleDifference(
      candidate.bearing,
      selected.bearing,
    );

    if (bearingDifference < 18) {
      adjustment -= 16;
    } else if (bearingDifference < 35) {
      adjustment -= 9;
    } else if (bearingDifference < 55) {
      adjustment -= 4;
    }

    const citySeparationKm = getDistanceKm(
      candidate.city.position,
      selected.city.position,
    );

    if (citySeparationKm < 110) {
      adjustment -= 18;
    } else if (citySeparationKm < 220) {
      adjustment -= 8;
    }
  }

  const countryAlreadySelected =
    selectedCandidates.some(
      (selected) =>
        selected.city.countryCode ===
        candidate.city.countryCode,
    );

  if (countryAlreadySelected) {
    adjustment -= 2;
  } else {
    adjustment +=
      recommendationConfig
        .countryDiversityBonus;
  }

  const populationBandAlreadySelected =
    selectedCandidates.some(
      (selected) =>
        selected.populationBand ===
        candidate.populationBand,
    );

  if (populationBandAlreadySelected) {
    adjustment -=
      recommendationConfig
        .samePopulationBandPenalty;
  } else {
    adjustment +=
      recommendationConfig
        .newPopulationBandBonus;
  }

  return adjustment;
}

export function getRecommendedCities(
  originCityId: string,
  count = recommendationConfig.recommendationCount,
  excludedCityIds: readonly string[] = [],
  previousCityId?: string,
  targetDistanceKm = 350,
): RecommendedCity[] {
  const originCity = getCityById(originCityId);

  if (!originCity) {
    return [];
  }

  const safeTargetDistanceKm = clamp(
    targetDistanceKm,
    80,
    1800,
  );

  const previousCity = previousCityId
    ? getCityById(previousCityId)
    : undefined;

  const previousJourneyBearing = previousCity
    ? getBearingDegrees(
        previousCity.position,
        originCity.position,
      )
    : undefined;

  const excludedCities = new Set([
    originCity.id,
    ...excludedCityIds,
  ]);

  const allCandidates = cities
    .filter(
      (city) =>
        city.enabled &&
        !excludedCities.has(city.id),
    )
    .map((city) => {
      const distanceKm = getDistanceKm(
        originCity.position,
        city.position,
      );

      const bearing = getBearingDegrees(
        originCity.position,
        city.position,
      );

      const directionDifferenceDegrees =
        previousJourneyBearing === undefined
          ? undefined
          : getAngleDifference(
              previousJourneyBearing,
              bearing,
            );

      return {
        city,
        distanceKm,
        bearing,
        populationBand:
          getPopulationBand(city.population),
        targetDifferenceKm: Math.abs(
          distanceKm - safeTargetDistanceKm,
        ),
        directionDifferenceDegrees,
      };
    })
    .filter(
      ({ distanceKm }) =>
        distanceKm >=
        recommendationConfig.minimumDistanceKm,
    )
    .sort(
      (first, second) =>
        first.targetDifferenceKm -
        second.targetDifferenceKm,
    );

  const desiredPoolSize = Math.min(
    Math.max(count * 3, 15),
    recommendationConfig.candidatePoolSize,
    allCandidates.length,
  );

  let toleranceKm = clamp(
    safeTargetDistanceKm * 0.16,
    60,
    180,
  );

  const maximumToleranceKm = Math.max(
    260,
    safeTargetDistanceKm * 0.45,
  );

  let candidatesNearTarget =
    allCandidates.filter(
      (candidate) =>
        candidate.targetDifferenceKm <=
        toleranceKm,
    );

  while (
    candidatesNearTarget.length <
      desiredPoolSize &&
    toleranceKm < maximumToleranceKm
  ) {
    toleranceKm += Math.max(
      40,
      safeTargetDistanceKm * 0.05,
    );

    candidatesNearTarget =
      allCandidates.filter(
        (candidate) =>
          candidate.targetDifferenceKm <=
          toleranceKm,
      );
  }

  const candidatePool =
    candidatesNearTarget.length >= count
      ? candidatesNearTarget.slice(
          0,
          recommendationConfig
            .candidatePoolSize,
        )
      : allCandidates.slice(
          0,
          recommendationConfig
            .candidatePoolSize,
        );

  const remainingCandidates: ScoredCandidate[] =
    candidatePool.map((candidate) => ({
      ...candidate,
      score:
        candidate.city.importance * 10 +
        getTargetDistanceScore(
          candidate.targetDifferenceKm,
          toleranceKm,
        ) +
        getDirectionScore(
          candidate.directionDifferenceDegrees,
        ),
    }));

  const selectedCandidates: ScoredCandidate[] =
    [];

  while (
    selectedCandidates.length < count &&
    remainingCandidates.length > 0
  ) {
    let bestCandidateIndex = 0;
    let bestFinalScore = -Infinity;

    remainingCandidates.forEach(
      (candidate, index) => {
        const finalScore =
          candidate.score +
          getDiversityAdjustment(
            candidate,
            selectedCandidates,
          );

        if (finalScore > bestFinalScore) {
          bestFinalScore = finalScore;
          bestCandidateIndex = index;
        }
      },
    );

    const [selectedCandidate] =
      remainingCandidates.splice(
        bestCandidateIndex,
        1,
      );

    selectedCandidates.push({
      ...selectedCandidate,
      score: bestFinalScore,
    });
  }

  return selectedCandidates.map(
    ({
      city,
      distanceKm,
      score,
      directionDifferenceDegrees,
    }) => ({
      city,
      distanceKm,
      score,
      directionDifferenceDegrees,
    }),
  );
}

export const getClosestCities =
  getRecommendedCities;