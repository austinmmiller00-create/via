export type TripStop = {
  cityId: string;
  cityName: string;
  days: number;
};

export type TripState = {
  currentCityId: string;
  selectedDestinationId: string | null;
  arrivedDestinationId: string | null;
  stops: TripStop[];
};