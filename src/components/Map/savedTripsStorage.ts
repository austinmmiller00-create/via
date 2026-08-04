import type { TripState } from "./tripTypes";

const savedTripsStorageKey =
  "via-saved-trips-v1";

export type SavedTrip = {
  id: string;
  name: string;
  createdAt: string;
  startingCityId: string;
  stops: TripState["stops"];
};

type SaveCompletedTripOptions = {
  name: string;
  startingCityId: string;
  stops: TripState["stops"];
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isStoredStop(
  value: unknown,
): value is TripState["stops"][number] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.cityId === "string" &&
    typeof value.cityName === "string" &&
    typeof value.days === "number" &&
    Number.isInteger(value.days) &&
    value.days >= 1 &&
    value.days <= 14
  );
}

function isSavedTrip(
  value: unknown,
): value is SavedTrip {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(
      Date.parse(value.createdAt),
    ) &&
    typeof value.startingCityId ===
      "string" &&
    Array.isArray(value.stops) &&
    value.stops.length > 0 &&
    value.stops.every(isStoredStop)
  );
}

function createTripId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2, 10),
  ].join("-");
}

function writeSavedTrips(
  savedTrips: SavedTrip[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      savedTripsStorageKey,
      JSON.stringify(savedTrips),
    );
  } catch {
    /*
      Ignore storage errors so the rest of the app
      continues working if browser storage is blocked.
    */
  }
}

export function loadSavedTrips():
  SavedTrip[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        savedTripsStorageKey,
      );

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      window.localStorage.removeItem(
        savedTripsStorageKey,
      );

      return [];
    }

    const validTrips =
      parsedValue.filter(isSavedTrip);

    /*
      Keep the most recently created trips first.
    */

    return validTrips.sort(
      (first, second) =>
        Date.parse(second.createdAt) -
        Date.parse(first.createdAt),
    );
  } catch {
    window.localStorage.removeItem(
      savedTripsStorageKey,
    );

    return [];
  }
}

export function saveCompletedTrip({
  name,
  startingCityId,
  stops,
}: SaveCompletedTripOptions) {
  const cleanedName =
    name.trim() || "Untitled trip";

  const savedTrip: SavedTrip = {
    id: createTripId(),
    name: cleanedName,
    createdAt: new Date().toISOString(),
    startingCityId,
    stops: stops.map((stop) => ({
      ...stop,
    })),
  };

  const existingTrips =
    loadSavedTrips();

  writeSavedTrips([
    savedTrip,
    ...existingTrips,
  ]);

  return savedTrip;
}

export function renameSavedTrip(
  tripId: string,
  newName: string,
) {
  const cleanedName = newName.trim();

  if (!cleanedName) {
    return loadSavedTrips();
  }

  const updatedTrips =
    loadSavedTrips().map((trip) =>
      trip.id === tripId
        ? {
            ...trip,
            name: cleanedName,
          }
        : trip,
    );

  writeSavedTrips(updatedTrips);

  return updatedTrips;
}

export function deleteSavedTrip(
  tripId: string,
) {
  const updatedTrips =
    loadSavedTrips().filter(
      (trip) => trip.id !== tripId,
    );

  writeSavedTrips(updatedTrips);

  return updatedTrips;
}

export function getSavedTripById(
  tripId: string,
) {
  return loadSavedTrips().find(
    (trip) => trip.id === tripId,
  );
}

export function createTripStateFromSavedTrip(
  savedTrip: SavedTrip,
): TripState {
  const lastStop =
    savedTrip.stops[
      savedTrip.stops.length - 1
    ];

  return {
    currentCityId:
      lastStop?.cityId ??
      savedTrip.startingCityId,

    selectedDestinationId: null,
    arrivedDestinationId: null,

    stops: savedTrip.stops.map(
      (stop) => ({
        ...stop,
      }),
    ),
  };
}