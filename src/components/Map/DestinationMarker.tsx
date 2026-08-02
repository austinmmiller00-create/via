import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";
import { CircleMarker, Marker } from "react-leaflet";
import type { RoutePoint } from "./routeData";

type DestinationMarkerProps = {
  position: RoutePoint;
  name: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
};

function DestinationMarker({
  position,
  name,
  price,
  selected,
  onSelect,
}: DestinationMarkerProps) {
  const [radius, setRadius] = useState(46);
  const [hovered, setHovered] = useState(false);

  const radiusRef = useRef(46);
  const animationFrameRef = useRef<number | null>(null);
  const poppingRef = useRef(false);

  const animateRadius = useCallback(
    (
      targetRadius: number,
      duration: number,
      onComplete?: () => void,
    ) => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
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
          (targetRadius - startingRadius) * easedProgress;

        radiusRef.current = nextRadius;
        setRadius(nextRadius);

        if (progress < 1) {
          animationFrameRef.current =
            window.requestAnimationFrame(animate);
          return;
        }

        animationFrameRef.current = null;
        onComplete?.();
      };

      animationFrameRef.current =
        window.requestAnimationFrame(animate);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (poppingRef.current) {
      return;
    }

    if (hovered) {
      animateRadius(selected ? 55 : 53, 180);
    } else {
      animateRadius(selected ? 50 : 46, 180);
    }
  }, [animateRadius, hovered, selected]);

  const handleClick = useCallback(() => {
    if (selected || poppingRef.current) {
      return;
    }

    poppingRef.current = true;
    onSelect();

    animateRadius(64, 140, () => {
      animateRadius(50, 280, () => {
        poppingRef.current = false;
      });
    });
  }, [animateRadius, onSelect, selected]);

  const priceFontSize = 34 * (radius / 46);

    const priceIcon = useMemo(
    () =>
        L.divIcon({
        className: "",
        html: `
            <div style="
            width: 106px;
            height: 106px;
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
        iconSize: [106, 106],
        iconAnchor: [53, 53],
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
            text-align: right;
            pointer-events: none;
            white-space: nowrap;

            font-family: Manrope, sans-serif;
            font-size: 46px;
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
        iconAnchor: [300, 30],
      }),
    [name],
  );

  return (
    <>
      <CircleMarker
        center={position}
        radius={radius + 8}
        pathOptions={{
          color: "rgba(255,255,255,0.95)",
          fillColor: "rgba(255,255,255,0.95)",
          fillOpacity: 1,
          weight: 0,
          interactive: false,
        }}
      />

      <CircleMarker
        center={position}
        radius={radius}
        pathOptions={{
          color: "#E76F51",
          fillColor: selected ? "#FFF8F5" : "#FFFFFF",
          fillOpacity: 1,
          weight: 7,
        }}
        eventHandlers={{
          mouseover: () => setHovered(true),
          mouseout: () => setHovered(false),
          click: handleClick,
        }}
      />

      <Marker
        position={position}
        icon={priceIcon}
        interactive={false}
      />

      <Marker
        position={position}
        icon={labelIcon}
        interactive={false}
      />
    </>
  );
}

export default DestinationMarker;