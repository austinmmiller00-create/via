import {
  connectionOverrides,
  getCityById,
  type ConnectionOverride,
  type TransportType,
} from "./cityDatabase";

import {
  getDistanceKm,
  getRecommendedCities,
} from "./cityRecommendations";

import { generateRoute } from "./routeGenerator";

export type GeneratedDestination = {
  id: string;
  name: string;
  country: string;
  price: string;
  estimatedPriceEur: number;
  distanceKm: number;
  position: [number, number];
  route: [number, number][];
  transport: TransportType;
  active: boolean;
  recommendationScore?: number;
  directionDifferenceDegrees?: number;
};

function findConnectionOverride(
  originCityId: string,
  destinationCityId: string,
): ConnectionOverride | undefined {
  return connectionOverrides.find(
    (connection) => {
      if (!connection.enabled) {
        return false;
      }

      const matchesForward =
        connection.fromCityId === originCityId &&
        connection.toCityId === destinationCityId;

      const matchesReverse =
        connection.bidirectional &&
        connection.fromCityId === destinationCityId &&
        connection.toCityId === originCityId;

      return matchesForward || matchesReverse;
    },
  );
}

function chooseAutomaticTransport(
  originCountryCode: string,
  destinationCountryCode: string,
  distanceKm: number,
): TransportType {
  const sameCountry =
    originCountryCode === destinationCountryCode;

  if (sameCountry && distanceKm <= 650) {
    return "train";
  }

  if (distanceKm <= 350) {
    return "train";
  }

  return "plane";
}

function estimatePrice(
  distanceKm: number,
  transport: TransportType,
) {
  const pricing = {
    train: {
      basePrice: 8,
      pricePerKm: 0.08,
    },
    bus: {
      basePrice: 5,
      pricePerKm: 0.05,
    },
    plane: {
      basePrice: 22,
      pricePerKm: 0.06,
    },
    ferry: {
      basePrice: 12,
      pricePerKm: 0.07,
    },
  }[transport];

  const rawPrice =
    pricing.basePrice +
    distanceKm * pricing.pricePerKm;

  return Math.max(
    10,
    Math.round(rawPrice / 5) * 5,
  );
}

export function getGeneratedDestination(
  originCityId: string,
  destinationCityId: string,
): GeneratedDestination | undefined {
  const originCity = getCityById(originCityId);

  const destinationCity = getCityById(
    destinationCityId,
  );

  if (!originCity || !destinationCity) {
    return undefined;
  }

  const distanceKm = getDistanceKm(
    originCity.position,
    destinationCity.position,
  );

  const connectionOverride =
    findConnectionOverride(
      originCityId,
      destinationCityId,
    );

  const transport =
    connectionOverride?.transport ??
    chooseAutomaticTransport(
      originCity.countryCode,
      destinationCity.countryCode,
      distanceKm,
    );

  const estimatedPriceEur =
    connectionOverride?.estimatedPriceEur ??
    estimatePrice(distanceKm, transport);

  return {
    id: destinationCity.id,
    name: destinationCity.name,
    country: destinationCity.country,
    price: `€${estimatedPriceEur}`,
    estimatedPriceEur,
    distanceKm: Math.round(distanceKm),
    position: destinationCity.position,
    route: generateRoute({
      originId: originCity.id,
      destinationId: destinationCity.id,
      start: originCity.position,
      end: destinationCity.position,
      transport,
    }),
    transport,
    active: true,
  };
}

export function getGeneratedDestinations(
  originCityId: string,
  count?: number,
  excludedCityIds: readonly string[] = [],
  previousCityId?: string,
  targetDistanceKm = 350,
): GeneratedDestination[] {
  return getRecommendedCities(
    originCityId,
    count,
    excludedCityIds,
    previousCityId,
    targetDistanceKm,
  )
    .map((recommendation) => {
      const destination =
        getGeneratedDestination(
          originCityId,
          recommendation.city.id,
        );

      if (!destination) {
        return undefined;
      }

      return {
        ...destination,
        recommendationScore:
          recommendation.score,
        directionDifferenceDegrees:
          recommendation.directionDifferenceDegrees,
      };
    })
    .filter(
      (
        destination,
      ): destination is GeneratedDestination =>
        destination !== undefined,
    );
}