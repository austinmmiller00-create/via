import {
  connectionOverrides,
  getCityById,
  type City,
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

/*
  Country pairs that can be travelled between over
  land or through a permanent rail connection.

  France and Great Britain are included because of
  the Channel Tunnel.
*/

const landConnectionPairs: readonly [
  string,
  string,
][] = [
  ["PT", "ES"],
  ["ES", "FR"],
  ["ES", "AD"],
  ["FR", "AD"],
  ["FR", "BE"],
  ["FR", "LU"],
  ["FR", "DE"],
  ["FR", "CH"],
  ["FR", "IT"],
  ["FR", "MC"],
  ["FR", "GB"],

  ["BE", "NL"],
  ["BE", "DE"],
  ["BE", "LU"],

  ["NL", "DE"],

  ["LU", "DE"],

  ["DE", "DK"],
  ["DE", "PL"],
  ["DE", "CZ"],
  ["DE", "AT"],
  ["DE", "CH"],

  ["DK", "SE"],

  ["NO", "SE"],
  ["NO", "FI"],
  ["NO", "RU"],

  ["SE", "FI"],

  ["FI", "RU"],

  ["EE", "LV"],
  ["EE", "RU"],

  ["LV", "LT"],
  ["LV", "RU"],
  ["LV", "BY"],

  ["LT", "PL"],
  ["LT", "BY"],
  ["LT", "RU"],

  ["PL", "CZ"],
  ["PL", "SK"],
  ["PL", "UA"],
  ["PL", "BY"],
  ["PL", "RU"],

  ["CZ", "SK"],
  ["CZ", "AT"],

  ["SK", "AT"],
  ["SK", "HU"],
  ["SK", "UA"],

  ["CH", "AT"],
  ["CH", "IT"],
  ["CH", "LI"],

  ["AT", "LI"],
  ["AT", "IT"],
  ["AT", "SI"],
  ["AT", "HU"],

  ["IT", "SI"],
  ["IT", "SM"],
  ["IT", "VA"],

  ["SI", "HR"],
  ["SI", "HU"],

  ["HR", "HU"],
  ["HR", "RS"],
  ["HR", "BA"],
  ["HR", "ME"],

  ["BA", "RS"],
  ["BA", "ME"],

  ["ME", "RS"],
  ["ME", "AL"],
  ["ME", "XK"],

  ["AL", "XK"],
  ["AL", "MK"],
  ["AL", "GR"],

  ["XK", "RS"],
  ["XK", "MK"],

  ["RS", "HU"],
  ["RS", "RO"],
  ["RS", "BG"],
  ["RS", "MK"],

  ["MK", "BG"],
  ["MK", "GR"],

  ["GR", "BG"],
  ["GR", "TR"],

  ["BG", "RO"],
  ["BG", "TR"],

  ["RO", "HU"],
  ["RO", "UA"],
  ["RO", "MD"],

  ["MD", "UA"],

  ["UA", "BY"],
  ["UA", "RU"],

  ["BY", "RU"],

  ["TR", "GE"],
  ["TR", "AM"],

  ["GE", "AM"],
  ["GE", "AZ"],
  ["GE", "RU"],

  ["AM", "AZ"],
];

function normalizeCountryCode(
  countryCode: string,
) {
  const normalized =
    countryCode.trim().toUpperCase();

  if (normalized === "UK") {
    return "GB";
  }

  return normalized;
}

function isInsideArea(
  position: [number, number],
  minimumLatitude: number,
  maximumLatitude: number,
  minimumLongitude: number,
  maximumLongitude: number,
) {
  const [latitude, longitude] =
    position;

  return (
    latitude >= minimumLatitude &&
    latitude <= maximumLatitude &&
    longitude >= minimumLongitude &&
    longitude <= maximumLongitude
  );
}

function getIslandZone(city: City) {
  const countryCode =
    normalizeCountryCode(
      city.countryCode,
    );

  if (countryCode === "IS") {
    return "iceland";
  }

  if (countryCode === "MT") {
    return "malta";
  }

  if (countryCode === "CY") {
    return "cyprus";
  }

  /*
    Includes the Republic of Ireland and Northern
    Ireland so routes from Ireland to Great Britain
    are recognised as sea crossings.
  */

  if (
    isInsideArea(
      city.position,
      51.2,
      55.6,
      -10.8,
      -5.2,
    )
  ) {
    return "ireland";
  }

  if (
    isInsideArea(
      city.position,
      27.2,
      29.7,
      -18.7,
      -13,
    )
  ) {
    return "canary-islands";
  }

  if (
    isInsideArea(
      city.position,
      38.4,
      40.4,
      0.7,
      4.6,
    )
  ) {
    return "balearic-islands";
  }

  if (
    isInsideArea(
      city.position,
      41.1,
      43.2,
      8.3,
      9.7,
    )
  ) {
    return "corsica";
  }

  if (
    isInsideArea(
      city.position,
      38.7,
      41.4,
      8,
      9.9,
    )
  ) {
    return "sardinia";
  }

  if (
    isInsideArea(
      city.position,
      36.3,
      38.5,
      12.2,
      15.8,
    )
  ) {
    return "sicily";
  }

  if (
    isInsideArea(
      city.position,
      34.7,
      35.8,
      23.2,
      26.7,
    )
  ) {
    return "crete";
  }

  if (
    isInsideArea(
      city.position,
      35.7,
      36.7,
      27.4,
      28.5,
    )
  ) {
    return "rhodes";
  }

  if (
    isInsideArea(
      city.position,
      39.2,
      40,
      19.5,
      20.3,
    )
  ) {
    return "corfu";
  }

  if (
    isInsideArea(
      city.position,
      56.7,
      58.1,
      18,
      19.6,
    )
  ) {
    return "gotland";
  }

  return "mainland";
}

function getCountryNeighbours(
  countryCode: string,
) {
  const neighbours = new Set<string>();

  for (const [
    firstCountry,
    secondCountry,
  ] of landConnectionPairs) {
    if (firstCountry === countryCode) {
      neighbours.add(secondCountry);
    }

    if (secondCountry === countryCode) {
      neighbours.add(firstCountry);
    }
  }

  return [...neighbours];
}

function countriesHaveLandConnection(
  originCountryCode: string,
  destinationCountryCode: string,
) {
  const origin =
    normalizeCountryCode(
      originCountryCode,
    );

  const destination =
    normalizeCountryCode(
      destinationCountryCode,
    );

  if (origin === destination) {
    return true;
  }

  const countriesToCheck = [origin];
  const visitedCountries =
    new Set<string>([origin]);

  while (countriesToCheck.length > 0) {
    const currentCountry =
      countriesToCheck.shift();

    if (!currentCountry) {
      continue;
    }

    for (const neighbour of getCountryNeighbours(
      currentCountry,
    )) {
      if (neighbour === destination) {
        return true;
      }

      if (
        !visitedCountries.has(neighbour)
      ) {
        visitedCountries.add(neighbour);
        countriesToCheck.push(neighbour);
      }
    }
  }

  return false;
}

function requiresSeaCrossing(
  originCity: City,
  destinationCity: City,
) {
  const originIslandZone =
    getIslandZone(originCity);

  const destinationIslandZone =
    getIslandZone(destinationCity);

  /*
    Two cities on the same island can still use land
    transport.
  */

  if (
    originIslandZone ===
    destinationIslandZone &&
    originIslandZone !== "mainland"
  ) {
    return false;
  }

  /*
    Moving between an island and another geographical
    area requires a ferry or plane.
  */

  if (
    originIslandZone !== "mainland" ||
    destinationIslandZone !== "mainland"
  ) {
    return true;
  }

  return !countriesHaveLandConnection(
    originCity.countryCode,
    destinationCity.countryCode,
  );
}

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
        connection.fromCityId ===
          originCityId &&
        connection.toCityId ===
          destinationCityId;

      const matchesReverse =
        connection.bidirectional &&
        connection.fromCityId ===
          destinationCityId &&
        connection.toCityId ===
          originCityId;

      return (
        matchesForward ||
        matchesReverse
      );
    },
  );
}

function chooseAutomaticTransport(
  originCity: City,
  destinationCity: City,
  distanceKm: number,
): TransportType {
  const sameCountry =
    normalizeCountryCode(
      originCity.countryCode,
    ) ===
    normalizeCountryCode(
      destinationCity.countryCode,
    );

  const seaCrossing =
    requiresSeaCrossing(
      originCity,
      destinationCity,
    );

  if (seaCrossing) {
    /*
      Ferries suit shorter sea crossings. Longer
      island and ocean journeys become flights.
    */

    if (distanceKm <= 550) {
      return "ferry";
    }

    return "plane";
  }

  /*
    Buses are used for shorter land journeys.
  */

  if (distanceKm <= 170) {
    return "bus";
  }

  /*
    Domestic rail can remain practical over a slightly
    greater distance than international rail.
  */

  if (
    sameCountry &&
    distanceKm <= 950
  ) {
    return "train";
  }

  if (distanceKm <= 750) {
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
    distanceKm *
      pricing.pricePerKm;

  return Math.max(
    10,
    Math.round(rawPrice / 5) * 5,
  );
}

export function getGeneratedDestination(
  originCityId: string,
  destinationCityId: string,
): GeneratedDestination | undefined {
  const originCity =
    getCityById(originCityId);

  const destinationCity =
    getCityById(destinationCityId);

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
      originCity,
      destinationCity,
      distanceKm,
    );

  const estimatedPriceEur =
    connectionOverride?.estimatedPriceEur ??
    estimatePrice(
      distanceKm,
      transport,
    );

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
      destinationId:
        destinationCity.id,
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
          recommendation
            .directionDifferenceDegrees,
      };
    })
    .filter(
      (
        destination,
      ): destination is GeneratedDestination =>
        destination !== undefined,
    );
}