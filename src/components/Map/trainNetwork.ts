import {
  cities,
  getCityById,
  type City,
  type RoutePoint,
} from "./cityDatabase";

import { getDistanceKm } from "./cityRecommendations";

type TrainEdge = {
  cityId: string;
  distanceKm: number;
  cost: number;
};

type TrainNetwork = Map<
  string,
  TrainEdge[]
>;

type LandMass =
  | "mainland"
  | "great-britain"
  | "ireland"
  | "iceland"
  | "malta"
  | "cyprus"
  | "sicily"
  | "sardinia"
  | "corsica"
  | "balearic-islands"
  | "canary-islands"
  | "madeira"
  | "azores"
  | "crete"
  | "rhodes"
  | "corfu"
  | "cyclades"
  | "gotland"
  | "faroe-islands";

const maximumDomesticEdgeKm = 320;
const maximumBorderEdgeKm = 210;
const maximumFixedLinkKm = 550;

const maximumNeighboursPerCity = 8;
const maximumRouteDetourRatio = 1.85;

let cachedTrainNetwork:
  | TrainNetwork
  | undefined;

function createPairKey(
  firstValue: string,
  secondValue: string,
) {
  return [firstValue, secondValue]
    .sort()
    .join(":");
}

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

/*
  These are countries that share a usable land border.

  Merely being connected somewhere through Europe is
  not enough. Two individual train-network cities may
  only connect across countries that directly border
  one another.
*/

const landBorderPairs = new Set(
  [
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

    ["HU", "UA"],

    ["MD", "UA"],

    ["UA", "BY"],
    ["UA", "RU"],

    ["BY", "RU"],

    ["TR", "GE"],
    ["TR", "AM"],
    ["TR", "AZ"],

    ["GE", "AM"],
    ["GE", "AZ"],
    ["GE", "RU"],

    ["AM", "AZ"],

    ["AZ", "RU"],
  ].map(([firstCountry, secondCountry]) =>
    createPairKey(
      firstCountry,
      secondCountry,
    ),
  ),
);

/*
  These are real fixed connections over water.

  They are kept narrow and city-specific so the
  network cannot create arbitrary ocean shortcuts.
*/

const fixedCityLinks = new Set(
  [
    /*
      Channel Tunnel.
    */

    ["london", "paris"],
    ["london", "lille"],
    ["canterbury", "lille"],
    ["canterbury", "paris"],

    /*
      Øresund connection between Denmark and Sweden.
    */

    ["copenhagen", "malmo"],
    ["copenhagen", "lund"],

    /*
      Great Belt connections inside Denmark.
    */

    ["copenhagen", "odense"],
    ["odense", "aarhus"],
  ].map(([firstCityId, secondCityId]) =>
    createPairKey(
      firstCityId,
      secondCityId,
    ),
  ),
);

function isInsideArea(
  position: RoutePoint,
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

function getLandMass(
  city: City,
): LandMass {
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
  Ireland and Northern Ireland.
*/

if (
  (countryCode === "IE" ||
    countryCode === "GB") &&
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

/*
  Great Britain, excluding Northern Ireland.
*/

if (
  countryCode === "GB" &&
  isInsideArea(
    city.position,
    49.7,
    59,
    -6,
    2.2,
  )
) {
  return "great-britain";
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
      32.2,
      33.3,
      -17.4,
      -16.2,
    )
  ) {
    return "madeira";
  }

  if (
    isInsideArea(
      city.position,
      36.8,
      40.2,
      -31.5,
      -24,
    )
  ) {
    return "azores";
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
      34.6,
      35.9,
      23,
      26.8,
    )
  ) {
    return "crete";
  }

  if (
    isInsideArea(
      city.position,
      35.7,
      36.8,
      27.2,
      28.6,
    )
  ) {
    return "rhodes";
  }

  if (
    isInsideArea(
      city.position,
      39.1,
      40.1,
      19.4,
      20.4,
    )
  ) {
    return "corfu";
  }

  if (
    isInsideArea(
      city.position,
      36.1,
      38.3,
      23.2,
      26.2,
    )
  ) {
    return "cyclades";
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

  if (
    isInsideArea(
      city.position,
      61.2,
      62.5,
      -7.8,
      -6.1,
    )
  ) {
    return "faroe-islands";
  }

  return "mainland";
}

function countriesShareLandBorder(
  firstCountryCode: string,
  secondCountryCode: string,
) {
  const firstCountry =
    normalizeCountryCode(
      firstCountryCode,
    );

  const secondCountry =
    normalizeCountryCode(
      secondCountryCode,
    );

  return landBorderPairs.has(
    createPairKey(
      firstCountry,
      secondCountry,
    ),
  );
}

function isFixedCityLink(
  firstCity: City,
  secondCity: City,
) {
  return fixedCityLinks.has(
    createPairKey(
      firstCity.id,
      secondCity.id,
    ),
  );
}

function canConnectByTrain(
  firstCity: City,
  secondCity: City,
  distanceKm: number,
) {
  const firstLandMass =
    getLandMass(firstCity);

  const secondLandMass =
    getLandMass(secondCity);

  const fixedLink = isFixedCityLink(
    firstCity,
    secondCity,
  );

  if (fixedLink) {
    return (
      distanceKm <= maximumFixedLinkKm
    );
  }

  /*
    Separate land masses cannot connect unless they
    have an explicit fixed train link above.
  */

  if (
    firstLandMass !== secondLandMass
  ) {
    return false;
  }

  /*
    Cities on the same island may connect even when
    their country codes differ, such as Ireland and
    Northern Ireland.
  */

  if (
    firstLandMass !== "mainland"
  ) {
    return (
      distanceKm <=
      maximumDomesticEdgeKm
    );
  }

  const firstCountry =
    normalizeCountryCode(
      firstCity.countryCode,
    );

  const secondCountry =
    normalizeCountryCode(
      secondCity.countryCode,
    );

  if (firstCountry === secondCountry) {
    return (
      distanceKm <=
      maximumDomesticEdgeKm
    );
  }

  if (
    !countriesShareLandBorder(
      firstCountry,
      secondCountry,
    )
  ) {
    return false;
  }

  return (
    distanceKm <=
    maximumBorderEdgeKm
  );
}

function getEdgeCost(
  firstCity: City,
  secondCity: City,
  distanceKm: number,
) {
  const sameCountry =
    normalizeCountryCode(
      firstCity.countryCode,
    ) ===
    normalizeCountryCode(
      secondCity.countryCode,
    );

  const fixedLink = isFixedCityLink(
    firstCity,
    secondCity,
  );

  /*
    A small cost per connection discourages paths with
    unnecessary zigzags.

    Important cities receive a modest preference as
    realistic railway hubs, but distance remains the
    strongest factor.
  */

  const connectionPenalty = 9;

  const borderPenalty =
    sameCountry ? 0 : 7;

  const fixedLinkPenalty =
    fixedLink ? 12 : 0;

  const importancePenalty =
    (5 - secondCity.importance) * 2;

  return (
    distanceKm +
    connectionPenalty +
    borderPenalty +
    fixedLinkPenalty +
    importancePenalty
  );
}

function addUndirectedEdge(
  network: TrainNetwork,
  firstCity: City,
  secondCity: City,
  distanceKm: number,
) {
  const firstEdges =
    network.get(firstCity.id);

  const secondEdges =
    network.get(secondCity.id);

  if (!firstEdges || !secondEdges) {
    return;
  }

  const firstAlreadyConnected =
    firstEdges.some(
      (edge) =>
        edge.cityId === secondCity.id,
    );

  if (!firstAlreadyConnected) {
    firstEdges.push({
      cityId: secondCity.id,
      distanceKm,
      cost: getEdgeCost(
        firstCity,
        secondCity,
        distanceKm,
      ),
    });
  }

  const secondAlreadyConnected =
    secondEdges.some(
      (edge) =>
        edge.cityId === firstCity.id,
    );

  if (!secondAlreadyConnected) {
    secondEdges.push({
      cityId: firstCity.id,
      distanceKm,
      cost: getEdgeCost(
        secondCity,
        firstCity,
        distanceKm,
      ),
    });
  }
}

function buildTrainNetwork() {
  const enabledCities = cities.filter(
    (city) => city.enabled,
  );

  const network: TrainNetwork =
    new Map();

  for (const city of enabledCities) {
    network.set(city.id, []);
  }

  for (const city of enabledCities) {
    const possibleNeighbours =
      enabledCities
        .filter(
          (candidate) =>
            candidate.id !== city.id,
        )
        .map((candidate) => {
          const distanceKm =
            getDistanceKm(
              city.position,
              candidate.position,
            );

          return {
            city: candidate,
            distanceKm,
          };
        })
        .filter(
          ({ city: candidate, distanceKm }) =>
            canConnectByTrain(
              city,
              candidate,
              distanceKm,
            ),
        )
        .sort(
          (first, second) =>
            first.distanceKm -
            second.distanceKm,
        )
        .slice(
          0,
          maximumNeighboursPerCity,
        );

    for (const neighbour of possibleNeighbours) {
      addUndirectedEdge(
        network,
        city,
        neighbour.city,
        neighbour.distanceKm,
      );
    }
  }

  return network;
}

function getTrainNetwork() {
  if (!cachedTrainNetwork) {
    cachedTrainNetwork =
      buildTrainNetwork();
  }

  return cachedTrainNetwork;
}

function getLowestScoreCityId(
  openCityIds: Set<string>,
  scores: Map<string, number>,
) {
  let bestCityId:
    | string
    | undefined;

  let bestScore = Infinity;

  for (const cityId of openCityIds) {
    const score =
      scores.get(cityId) ?? Infinity;

    if (score < bestScore) {
      bestScore = score;
      bestCityId = cityId;
    }
  }

  return bestCityId;
}

function reconstructPath(
  cameFrom: Map<string, string>,
  destinationCityId: string,
) {
  const path = [destinationCityId];

  let currentCityId =
    destinationCityId;

  while (
    cameFrom.has(currentCityId)
  ) {
    const previousCityId =
      cameFrom.get(currentCityId);

    if (!previousCityId) {
      break;
    }

    path.unshift(previousCityId);

    currentCityId =
      previousCityId;
  }

  return path;
}

function getPathDistanceKm(
  cityIds: readonly string[],
) {
  let distanceKm = 0;

  for (
    let index = 0;
    index < cityIds.length - 1;
    index += 1
  ) {
    const firstCity = getCityById(
      cityIds[index],
    );

    const secondCity = getCityById(
      cityIds[index + 1],
    );

    if (!firstCity || !secondCity) {
      return Infinity;
    }

    distanceKm += getDistanceKm(
      firstCity.position,
      secondCity.position,
    );
  }

  return distanceKm;
}

export function findTrainCityPath(
  originCityId: string,
  destinationCityId: string,
): City[] | undefined {
  const originCity =
    getCityById(originCityId);

  const destinationCity =
    getCityById(destinationCityId);

  if (
    !originCity ||
    !destinationCity ||
    !originCity.enabled ||
    !destinationCity.enabled
  ) {
    return undefined;
  }

  if (
    originCity.id === destinationCity.id
  ) {
    return [originCity];
  }

  const network = getTrainNetwork();

  if (
    !network.has(originCity.id) ||
    !network.has(destinationCity.id)
  ) {
    return undefined;
  }

  const openCityIds = new Set<string>([
    originCity.id,
  ]);

  const closedCityIds =
    new Set<string>();

  const cameFrom =
    new Map<string, string>();

  const journeyCost =
    new Map<string, number>([
      [originCity.id, 0],
    ]);

  const estimatedTotalCost =
    new Map<string, number>([
      [
        originCity.id,
        getDistanceKm(
          originCity.position,
          destinationCity.position,
        ),
      ],
    ]);

  while (openCityIds.size > 0) {
    const currentCityId =
      getLowestScoreCityId(
        openCityIds,
        estimatedTotalCost,
      );

    if (!currentCityId) {
      break;
    }

    if (
      currentCityId ===
      destinationCity.id
    ) {
      const cityIds = reconstructPath(
        cameFrom,
        destinationCity.id,
      );

      const directDistanceKm =
        getDistanceKm(
          originCity.position,
          destinationCity.position,
        );

      const pathDistanceKm =
        getPathDistanceKm(cityIds);

      /*
        Reject implausibly large detours. The caller can
        then fall back to the previous route method or
        change the transport type.
      */

      if (
        pathDistanceKm >
        directDistanceKm *
          maximumRouteDetourRatio
      ) {
        return undefined;
      }

      const pathCities = cityIds
        .map((cityId) =>
          getCityById(cityId),
        )
        .filter(
          (city): city is City =>
            city !== undefined,
        );

      return pathCities.length ===
        cityIds.length
        ? pathCities
        : undefined;
    }

    openCityIds.delete(currentCityId);
    closedCityIds.add(currentCityId);

    const currentCity =
      getCityById(currentCityId);

    if (!currentCity) {
      continue;
    }

    const currentJourneyCost =
      journeyCost.get(
        currentCityId,
      ) ?? Infinity;

    const edges =
      network.get(currentCityId) ?? [];

    for (const edge of edges) {
      if (
        closedCityIds.has(edge.cityId)
      ) {
        continue;
      }

      const neighbourCity =
        getCityById(edge.cityId);

      if (!neighbourCity) {
        continue;
      }

      const possibleJourneyCost =
        currentJourneyCost +
        edge.cost;

      const existingJourneyCost =
        journeyCost.get(edge.cityId) ??
        Infinity;

      if (
        possibleJourneyCost >=
        existingJourneyCost
      ) {
        continue;
      }

      cameFrom.set(
        edge.cityId,
        currentCityId,
      );

      journeyCost.set(
        edge.cityId,
        possibleJourneyCost,
      );

      estimatedTotalCost.set(
        edge.cityId,
        possibleJourneyCost +
          getDistanceKm(
            neighbourCity.position,
            destinationCity.position,
          ),
      );

      openCityIds.add(edge.cityId);
    }
  }

  return undefined;
}

export function findTrainRouteAnchors(
  originCityId: string,
  destinationCityId: string,
): RoutePoint[] | undefined {
  const cityPath = findTrainCityPath(
    originCityId,
    destinationCityId,
  );

  if (!cityPath) {
    return undefined;
  }

  return cityPath.map(
    (city) => city.position,
  );
}