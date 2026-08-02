import {
  connectionOverrides,
  getCityById,
  type ConnectionOverride,
  type TransportType,
} from "./cityDatabase";

import {
  getClosestCities,
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
        connection.toCityId ===
          destinationCityId;

      const matchesReverse =
        connection.bidirectional &&
        connection.fromCityId ===
          destinationCityId &&
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

export function getGeneratedDestinations(
  originCityId: string,
  count?: number,
): GeneratedDestination[] {
  const originCity = getCityById(originCityId);

  if (!originCity) {
    return [];
  }

  return getClosestCities(originCityId, count).map(
    ({ city, distanceKm }) => {
      const connectionOverride =
        findConnectionOverride(
          originCityId,
          city.id,
        );

      const transport =
        connectionOverride?.transport ??
        chooseAutomaticTransport(
          originCity.countryCode,
          city.countryCode,
          distanceKm,
        );

      const estimatedPriceEur =
        connectionOverride?.estimatedPriceEur ??
        estimatePrice(distanceKm, transport);

      return {
        id: city.id,
        name: city.name,
        country: city.country,
        price: `€${estimatedPriceEur}`,
        estimatedPriceEur,
        distanceKm: Math.round(distanceKm),
        position: city.position,
        route: generateRoute({
          originId: originCity.id,
          destinationId: city.id,
          start: originCity.position,
          end: city.position,
          transport,
        }),
        transport,
        active: true,
      };
    },
  );
}