import {
  barcelonaDestinations,
  valenciaDestinations,
  type Destination,
} from "./destinationData";

export const destinationsByCity: Record<
  string,
  Destination[]
> = {
  barcelona: barcelonaDestinations,
  valencia: valenciaDestinations,
};

export function getCityDestinations(
  cityId: string,
) {
  return destinationsByCity[cityId] ?? [];
}

export function getDestinationFromCity(
  originCityId: string,
  destinationCityId: string,
) {
  return getCityDestinations(originCityId).find(
    (destination) =>
      destination.id === destinationCityId,
  );
}