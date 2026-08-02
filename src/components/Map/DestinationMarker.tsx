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

type DestinationMarkerProps = {
  position: RoutePoint;
  name: string;
  price: string;
  selected: boolean;
  arrived: boolean;
  onSelect: () => void;
};

function DestinationMarker({
  position,
  name,
  price,
  selected,
  arrived,
  onSelect,
}: DestinationMarkerProps) {
  const [radius, setRadius] = useState(40);
  const [hovered, setHovered] = useState(false);

  const radiusRef = useRef(40);

  const animationFrameRef =
    useRef<number | null>(null);

  const poppingRef = useRef(false);

  const animateRadius = useCallback(
    (
      targetRadius: number,
      duration: number,
      onComplete?: () => void,
    ) => {
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

    if (arrived) {
      setHovered(false);
      animateRadius(24, 300);
      return;
    }

    if (hovered) {
      animateRadius(selected ? 48 : 46, 180);
    } else {
      animateRadius(selected ? 43 : 40, 180);
    }
  }, [
    animateRadius,
    arrived,
    hovered,
    selected,
  ]);

  const handleClick = useCallback(() => {
    if (
      selected ||
      arrived ||
      poppingRef.current
    ) {
      return;
    }

    poppingRef.current = true;
    onSelect();

    animateRadius(56, 140, () => {
      animateRadius(43, 280, () => {
        poppingRef.current = false;
      });
    });
  }, [
    animateRadius,
    arrived,
    onSelect,
    selected,
  ]);

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
            text-align: left;
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

        // A negative horizontal anchor places
        // the label to the right of the circle.
        iconAnchor: [-58, 30],
      }),
    [name],
  );

  return (
    <>
      <CircleMarker
        center={position}
        radius={radius + (arrived ? 8 : 7)}
        pathOptions={{
          color: "#FFFFFF",
          fillColor: "#FFFFFF",
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
          fillColor: arrived
            ? "#E76F51"
            : selected
              ? "#FFF8F5"
              : "#FFFFFF",
          fillOpacity: 1,
          weight: arrived ? 0 : 6,
        }}
        eventHandlers={{
          mouseover: () => {
            if (!arrived) {
              setHovered(true);
            }
          },
          mouseout: () => {
            setHovered(false);
          },
          click: handleClick,
        }}
      />

      {!arrived && (
        <Marker
          position={position}
          icon={priceIcon}
          interactive={false}
        />
      )}

      <Marker
        position={position}
        icon={labelIcon}
        interactive={false}
      />
    </>
  );
}

export default DestinationMarker;