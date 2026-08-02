import type { RoutePoint } from "./routeData";

type Transport = "train" | "plane";

type AnimationMode =
  | "preview"
  | "selection"
  | "retraction";

function degreesToRadians(value: number) {
  return value * (Math.PI / 180);
}

function getSegmentDistanceKm(
  start: RoutePoint,
  end: RoutePoint,
) {
  const earthRadiusKm = 6371;

  const startLatitude =
    degreesToRadians(start[0]);

  const endLatitude =
    degreesToRadians(end[0]);

  const latitudeDifference =
    degreesToRadians(end[0] - start[0]);

  const longitudeDifference =
    degreesToRadians(end[1] - start[1]);

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

export function getRouteDistanceKm(
  route: RoutePoint[],
) {
  return route
    .slice(0, -1)
    .reduce((totalDistance, point, index) => {
      const nextPoint = route[index + 1];

      return (
        totalDistance +
        getSegmentDistanceKm(point, nextPoint)
      );
    }, 0);
}

export function getRouteDuration(
  route: RoutePoint[],
  transport: Transport,
  mode: AnimationMode,
) {
  const distanceKm = getRouteDistanceKm(route);

  const millisecondsPerKm = {
    preview: transport === "plane" ? 7 : 9,
    selection: transport === "plane" ? 6 : 8,
    retraction: 4,
  }[mode];

  const calculatedDuration =
    distanceKm * millisecondsPerKm;

  const limits = {
    preview: {
      minimum: 1600,
      maximum: 5600,
    },
    selection: {
      minimum: 1600,
      maximum: 4800,
    },
    retraction: {
      minimum: 650,
      maximum: 1800,
    },
  }[mode];

  return Math.round(
    Math.min(
      limits.maximum,
      Math.max(
        limits.minimum,
        calculatedDuration,
      ),
    ),
  );
}