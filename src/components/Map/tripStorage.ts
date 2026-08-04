import type { TripState } from "./tripTypes";

const tripStorageKey =
  "via-trip-state-v1";

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

function isStoredTripState(
  value: unknown,
): value is TripState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.currentCityId ===
      "string" &&
    Array.isArray(value.stops) &&
    value.stops.every(isStoredStop)
  );
}

export function loadTripState(
  fallbackState: TripState,
): TripState {
  if (typeof window === "undefined") {
    return fallbackState;
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        tripStorageKey,
      );

    if (!storedValue) {
      return fallbackState;
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (!isStoredTripState(parsedValue)) {
      window.localStorage.removeItem(
        tripStorageKey,
      );

      return fallbackState;
    }

    const lastStop =
      parsedValue.stops[
        parsedValue.stops.length - 1
      ];

    return {
      currentCityId:
        lastStop?.cityId ??
        fallbackState.currentCityId,

      selectedDestinationId: null,
      arrivedDestinationId: null,

      stops: parsedValue.stops,
    };
  } catch {
    window.localStorage.removeItem(
      tripStorageKey,
    );

    return fallbackState;
  }
}

export function saveTripState(
  tripState: TripState,
) {
  if (typeof window === "undefined") {
    return;
  }

  const stableState: TripState = {
    currentCityId:
      tripState.currentCityId,

    selectedDestinationId: null,
    arrivedDestinationId: null,

    stops: tripState.stops,
  };

  try {
    window.localStorage.setItem(
      tripStorageKey,
      JSON.stringify(stableState),
    );
  } catch {
    /*
      Ignore browser storage errors so the map
      continues working even when storage is blocked.
    */
  }
}

export function clearSavedTrip() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      tripStorageKey,
    );
  } catch {
    /*
      Ignore browser storage errors.
    */
  }
}