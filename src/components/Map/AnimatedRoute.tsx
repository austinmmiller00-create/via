import { mapStyle } from "./mapStyle";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Polyline } from "react-leaflet";

import type { RoutePoint } from "./routeData";

type AnimatedRouteProps = {
  route: RoutePoint[];
  duration: number;
  casingOpacity: number;
  routeOpacity: number;
  reverse?: boolean;
  onComplete?: () => void;
};

type RouteSegment = {
  start: RoutePoint;
  end: RoutePoint;
  length: number;
  startDistance: number;
};

function getDistance(
  start: RoutePoint,
  end: RoutePoint,
) {
  const latitudeDifference = end[0] - start[0];
  const longitudeDifference = end[1] - start[1];

  return Math.sqrt(
    latitudeDifference ** 2 +
      longitudeDifference ** 2,
  );
}

function AnimatedRoute({
  route,
  duration,
  casingOpacity,
  routeOpacity,
  reverse = false,
  onComplete,
}: AnimatedRouteProps) {
  const animationFrameRef =
    useRef<number | null>(null);

  const routeMeasurements = useMemo(() => {
    let accumulatedDistance = 0;

    const segments: RouteSegment[] = route
      .slice(0, -1)
      .map((point, index) => {
        const nextPoint = route[index + 1];
        const length = getDistance(
          point,
          nextPoint,
        );

        const segment: RouteSegment = {
          start: point,
          end: nextPoint,
          length,
          startDistance: accumulatedDistance,
        };

        accumulatedDistance += length;

        return segment;
      });

    return {
      segments,
      totalLength: accumulatedDistance,
    };
  }, [route]);

  const getPartialRoute = (
    progress: number,
  ): RoutePoint[] => {
    if (route.length === 0) {
      return [];
    }

    if (route.length === 1) {
      return route;
    }

    if (progress <= 0) {
      return [route[0], route[0]];
    }

    if (progress >= 1) {
      return route;
    }

    const targetDistance =
      routeMeasurements.totalLength * progress;

    const partialRoute: RoutePoint[] = [route[0]];

    for (const segment of routeMeasurements.segments) {
      const segmentEndDistance =
        segment.startDistance + segment.length;

      if (targetDistance >= segmentEndDistance) {
        partialRoute.push(segment.end);
        continue;
      }

      const distanceIntoSegment =
        targetDistance - segment.startDistance;

      const segmentProgress =
        segment.length === 0
          ? 0
          : distanceIntoSegment / segment.length;

      const partialPoint: RoutePoint = [
        segment.start[0] +
          (segment.end[0] - segment.start[0]) *
            segmentProgress,
        segment.start[1] +
          (segment.end[1] - segment.start[1]) *
            segmentProgress,
      ];

      partialRoute.push(partialPoint);
      break;
    }

    return partialRoute;
  };

  const [visibleRoute, setVisibleRoute] = useState<
    RoutePoint[]
  >(
    reverse
      ? route
      : route.length > 0
        ? [route[0], route[0]]
        : [],
  );

  useEffect(() => {
    let startingTime: number | undefined;

    setVisibleRoute(
      reverse
        ? route
        : route.length > 0
          ? [route[0], route[0]]
          : [],
    );

    const animate = (currentTime: number) => {
      if (startingTime === undefined) {
        startingTime = currentTime;
      }

      const rawProgress = Math.min(
        (currentTime - startingTime) / duration,
        1,
      );

      const visibleProgress = reverse
        ? 1 - rawProgress
        : rawProgress;

      setVisibleRoute(
        getPartialRoute(visibleProgress),
      );

      if (rawProgress < 1) {
        animationFrameRef.current =
          window.requestAnimationFrame(animate);

        return;
      }

      animationFrameRef.current = null;
      onComplete?.();
    };

    animationFrameRef.current =
      window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, [
    duration,
    onComplete,
    reverse,
    route,
    routeMeasurements,
  ]);

  if (visibleRoute.length < 2) {
    return null;
  }

  return (
    <>
      <Polyline
        positions={visibleRoute}
        pathOptions={{
          color: "#FFFFFF",
          weight: mapStyle.route.casingWidth,
          opacity: casingOpacity,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }}
      />

      <Polyline
        positions={visibleRoute}
        pathOptions={{
          color: "#E76F51",
          weight: mapStyle.route.lineWidth,
          opacity: routeOpacity,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }}
      />
    </>
  );
}

export default AnimatedRoute;