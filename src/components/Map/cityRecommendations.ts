import {
  cities,
  getCityById,
  recommendationConfig,
  type City,
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
  distanceBand: "near" | "medium" | "far";
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

function getDistanceBand(
  distanceKm: number,
): ScoredCandidate["distanceBand"] {
  if (distanceKm < 180) {
    return "near";
  }

  if (distanceKm < 420) {
    return "medium";
  }

  return "far";
}

function getDistanceScore(distanceKm: number) {
  /*
    Avoids always preferring the absolute closest city.

    Useful medium-distance stops score highest, while
    nearby and adventurous options remain competitive.
  */

  if (distanceKm <= 120) {
    return 22 + distanceKm / 40;
  }

  if (distanceKm <= 320) {
    return 34 - Math.abs(distanceKm - 240) * 0.04;
  }

  if (distanceKm <= 650) {
    return 27 - (distanceKm - 320) * 0.025;
  }

  return clamp(
    18 - (distanceKm - 650) * 0.012,
    4,
    18,
  );
}

function getDirectionScore(
  differenceDegrees?: number,
) {
  if (differenceDegrees === undefined) {
    return 0;
  }

  if (differenceDegrees <= 35) {
    return 22;
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

  return -32;
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

    /*
      Penalise options that head in almost exactly
      the same direction.
    */

    if (bearingDifference < 18) {
      adjustment -= 16;
    } else if (bearingDifference < 35) {
      adjustment -= 9;
    } else if (bearingDifference < 55) {
      adjustment -= 4;
    }

    /*
      Penalise destination cities that are clustered
      closely together.
    */

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

  adjustment += countryAlreadySelected ? -2 : 5;

  const distanceBandAlreadySelected =
    selectedCandidates.some(
      (selected) =>
        selected.distanceBand ===
        candidate.distanceBand,
    );

  adjustment +=
    distanceBandAlreadySelected ? -2 : 5;

  return adjustment;
}

export function getRecommendedCities(
  originCityId: string,
  count = recommendationConfig.recommendationCount,
  excludedCityIds: readonly string[] = [],
  previousCityId?: string,
): RecommendedCity[] {
  const originCity = getCityById(originCityId);

  if (!originCity) {
    return [];
  }

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

  const allCandidates: ScoredCandidate[] =
    cities
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

        const importanceScore =
          city.importance * 12;

        const distanceScore =
          getDistanceScore(distanceKm);

        const directionScore =
          getDirectionScore(
            directionDifferenceDegrees,
          );

        return {
          city,
          distanceKm,
          bearing,
          distanceBand:
            getDistanceBand(distanceKm),
          directionDifferenceDegrees,
          score:
            importanceScore +
            distanceScore +
            directionScore,
        };
      })
      .filter(
        ({ distanceKm }) =>
          distanceKm >=
          recommendationConfig.minimumDistanceKm,
      );

  /*
    Build a wider candidate pool rather than simply
    using the nearest five.
  */

  const nearestCandidates = [...allCandidates]
    .sort(
      (first, second) =>
        first.distanceKm - second.distanceKm,
    )
    .slice(0, 24);

  const qualityCandidates = [...allCandidates]
    .filter(
      ({ distanceKm }) =>
        distanceKm <=
        recommendationConfig.maximumDistanceKm *
          2.5,
    )
    .sort(
      (first, second) =>
        second.city.importance -
          first.city.importance ||
        first.distanceKm - second.distanceKm,
    )
    .slice(0, 14);

  const candidateMap = new Map<
    string,
    ScoredCandidate
  >();

  for (const candidate of [
    ...nearestCandidates,
    ...qualityCandidates,
  ]) {
    candidateMap.set(
      candidate.city.id,
      candidate,
    );
  }

  const remainingCandidates = [
    ...candidateMap.values(),
  ];

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

/*
  Kept temporarily so generatedDestinations.ts
  continues working without changes.
*/

export const getClosestCities =
  getRecommendedCities;