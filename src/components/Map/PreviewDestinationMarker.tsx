import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";
import {
  CircleMarker,
  Marker,
} from "react-leaflet";

import type { RoutePoint } from "./routeData";
import useFadeIn from "./useFadeIn";

type PreviewDestinationMarkerProps = {
  position: RoutePoint;
  name: string;
  price: string;
};

function PreviewDestinationMarker({
  position,
  name,
  price,
}: PreviewDestinationMarkerProps) {
  const [radius, setRadius] = useState(40);
  const [hovered, setHovered] = useState(false);

  const fadeOpacity = useFadeIn(700);

  const radiusRef = useRef(40);

  const animationFrameRef =
    useRef<number | null>(null);

  const animateRadius = useCallback(
    (targetRadius: number, duration: number) => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }

      const startingRadius = radiusRef.current;
      const startingTime = performance.now();

      const animate = (currentTime: number) => {
        const progress = Math.min(
          (currentTime - startingTime) / duration,
          1,
        );

        const easedProgress =
          1 - Math.pow(1 - progress, 3);

        const nextRadius =
          startingRadius +
          (targetRadius - startingRadius) *
            easedProgress;

        radiusRef.current = nextRadius;
        setRadius(nextRadius);

        if (progress < 1) {
          animationFrameRef.current =
            window.requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current =
        window.requestAnimationFrame(animate);
    },
    [],
  );

  useEffect(() => {
    animateRadius(hovered ? 46 : 40, 180);
  }, [animateRadius, hovered]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, []);

  const priceFontSize = 30 * (radius / 40);

  const priceIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            width: 96px;
            height: 96px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;

            font-family: Manrope, sans-serif;
            font-size: ${priceFontSize}px;
            font-weight: 800;
            letter-spacing: -1.5px;
            line-height: 1;
            color: #24324A;

            text-shadow:
              0 2px 0 rgba(255,255,255,1),
              0 3px 8px rgba(36,50,74,0.18);
          ">
            ${price}
          </div>
        `,
        iconSize: [96, 96],
        iconAnchor: [48, 48],
      }),
    [price, priceFontSize],
  );

  const labelIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            width: 220px;
            text-align: center;
            pointer-events: none;
            white-space: nowrap;

            font-family: Manrope, sans-serif;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: -2px;
            line-height: 1;
            color: #24324A;

            text-shadow:
              0 2px 0 white,
              0 0 10px white,
              0 4px 10px rgba(36,50,74,0.2);
          ">
            ${name}
          </div>
        `,
        iconSize: [220, 60],
        iconAnchor: [110, 92],
      }),
    [name],
  );

  return (
    <>
      <CircleMarker
        center={position}
        radius={radius + 7}
        pathOptions={{
          color: "#FFFFFF",
          fillColor: "#FFFFFF",
          opacity: fadeOpacity,
          fillOpacity: fadeOpacity,
          weight: 0,
          interactive: false,
        }}
      />

      <CircleMarker
        center={position}
        radius={radius}
        pathOptions={{
          color: "#E76F51",
          fillColor: "#FFFFFF",
          opacity: fadeOpacity,
          fillOpacity: fadeOpacity,
          weight: 6,
        }}
        eventHandlers={{
          mouseover: () => setHovered(true),
          mouseout: () => setHovered(false),
        }}
      />

      <Marker
        position={position}
        icon={priceIcon}
        opacity={fadeOpacity}
        interactive={false}
      />

      <Marker
        position={position}
        icon={labelIcon}
        opacity={fadeOpacity}
        interactive={false}
      />
    </>
  );
}

export default PreviewDestinationMarker;