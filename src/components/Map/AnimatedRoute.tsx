import { useEffect, useMemo, useRef, useState } from "react";
import { Polyline } from "react-leaflet";
import type { RoutePoint } from "./routeData";

type AnimatedRouteProps = {
  route: RoutePoint[];
  duration?: number;
  onComplete: () => void;
};

type RouteSegment = {
  start: RoutePoint;
  end: RoutePoint;
  length: number;
  startDistance: number;
};

function distanceBetweenPoints(
  start: RoutePoint,
  end: RoutePoint,
): number {
  const latitudeDifference = end[0] - start[0];
  const longitudeDifference = end[1] - start[1];

  return Math.sqrt(
    latitudeDifference ** 2 + longitudeDifference ** 2,
  );
}

function getPartialRoute(
  route: RoutePoint[],
  segments: RouteSegment[],
  totalLength: number,
  progress: number,
): RoutePoint[] {
  if (progress >= 1) {
    return route;
  }

  const targetDistance = totalLength * progress;
  const visibleRoute: RoutePoint[] = [route[0]];

  for (const segment of segments) {
    const segmentEndDistance =
      segment.startDistance + segment.length;

    if (targetDistance >= segmentEndDistance) {
      visibleRoute.push(segment.end);
      continue;
    }

    const distanceIntoSegment =
      targetDistance - segment.startDistance;

    const segmentProgress =
      segment.length === 0
        ? 0
        : distanceIntoSegment / segment.length;

    const interpolatedPoint: RoutePoint = [
      segment.start[0] +
        (segment.end[0] - segment.start[0]) * segmentProgress,
      segment.start[1] +
        (segment.end[1] - segment.start[1]) * segmentProgress,
    ];

    visibleRoute.push(interpolatedPoint);
    break;
  }

  return visibleRoute;
}

function AnimatedRoute({
  route,
  duration = 4000,
  onComplete,
}: AnimatedRouteProps) {
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false);

  const { segments, totalLength } = useMemo(() => {
    let accumulatedDistance = 0;

    const calculatedSegments: RouteSegment[] = route
      .slice(0, -1)
      .map((point, index) => {
        const nextPoint = route[index + 1];
        const length = distanceBetweenPoints(point, nextPoint);

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
      segments: calculatedSegments,
      totalLength: accumulatedDistance,
    };
  }, [route]);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | undefined;

    const animate = (currentTime: number) => {
      if (startTime === undefined) {
        startTime = currentTime;
      }

      const elapsedTime = currentTime - startTime;
      const nextProgress = Math.min(elapsedTime / duration, 1);

      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [duration, onComplete]);

  const visibleRoute = getPartialRoute(
    route,
    segments,
    totalLength,
    progress,
  );

  if (visibleRoute.length < 2) {
    return null;
  }

  return (
    <>
      <Polyline
        positions={visibleRoute}
        pathOptions={{
          color: "#ffffff",
          weight: 34,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      <Polyline
        positions={visibleRoute}
        pathOptions={{
          color: "#E76F51",
          weight: 24,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </>
  );
}

export default AnimatedRoute;