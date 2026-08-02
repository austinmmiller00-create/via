import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { RoutePoint } from "./routeData";

type RouteCameraProps = {
  route: RoutePoint[];
  duration: number;
};

function RouteCamera({
  route,
  duration,
}: RouteCameraProps) {
  const map = useMap();

  useEffect(() => {
    const destination = route[route.length - 1];

    if (!destination) {
      return;
    }

    map.stop();

    map.panTo(destination, {
      animate: true,
      duration: duration / 1000,
      easeLinearity: 0.15,
    });

    return () => {
      map.stop();
    };
  }, [duration, map, route]);

  return null;
}

export default RouteCamera;