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
};

function degreesToRadians(value: number) {
  return value * (Math.PI / 180);
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

export function getClosestCities(
  originCityId: string,
  count = recommendationConfig.recommendationCount,
): RecommendedCity[] {
  const originCity = getCityById(originCityId);

  if (!originCity) {
    return [];
  }

  const possibleCities = cities
    .filter(
      (city) =>
        city.enabled &&
        city.id !== originCity.id,
    )
    .map((city) => ({
      city,
      distanceKm: getDistanceKm(
        originCity.position,
        city.position,
      ),
    }))
    .filter(
      ({ distanceKm }) =>
        distanceKm >=
        recommendationConfig.minimumDistanceKm,
    )
    .sort(
      (first, second) =>
        first.distanceKm - second.distanceKm,
    );

  const citiesInsideInitialRadius =
    possibleCities.filter(
      ({ distanceKm }) =>
        distanceKm <=
        recommendationConfig.maximumDistanceKm,
    );

  if (citiesInsideInitialRadius.length >= count) {
    return citiesInsideInitialRadius.slice(
      0,
      count,
    );
  }

  return possibleCities.slice(0, count);
}