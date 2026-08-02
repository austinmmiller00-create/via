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

import { mapStyle } from "./mapStyle";
import type { RoutePoint } from "./routeData";
import useFadeIn from "./useFadeIn";

type LabelPosition =
  | "above"
  | "below"
  | "left"
  | "right";

type DestinationMarkerProps = {
  position: RoutePoint;
  name: string;
  price: string;
  selected: boolean;
  arrived: boolean;
  stayDays?: number;
  labelPosition?: LabelPosition;
  showLabel?: boolean;
  onSelect: () => void;
};

function DestinationMarker({
  position,
  name,
  price,
  selected,
  arrived,
  stayDays,
  labelPosition = "right",
  onSelect,
  showLabel = true,
}: DestinationMarkerProps) {
  const destinationStyle = mapStyle.destination;

  const [radius, setRadius] = useState(
    destinationStyle.radius,
  );

  const [hovered, setHovered] = useState(false);

  const fadeOpacity = useFadeIn(700);

  const radiusRef = useRef(
    destinationStyle.radius,
  );

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

      animateRadius(
        destinationStyle.arrivedRadius,
        300,
      );

      return;
    }

    if (hovered) {
      animateRadius(
        selected
          ? destinationStyle.hoverRadius + 2
          : destinationStyle.hoverRadius,
        180,
      );
    } else {
      animateRadius(
        selected
          ? destinationStyle.selectedRadius
          : destinationStyle.radius,
        180,
      );
    }
  }, [
    animateRadius,
    arrived,
    destinationStyle,
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

    animateRadius(
      destinationStyle.popRadius,
      140,
      () => {
        animateRadius(
          destinationStyle.selectedRadius,
          280,
          () => {
            poppingRef.current = false;
          },
        );
      },
    );
  }, [
    animateRadius,
    arrived,
    destinationStyle,
    onSelect,
    selected,
  ]);

  const priceFontSize =
    destinationStyle.priceSize *
    (radius / destinationStyle.radius);

  const priceIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            width: 90px;
            height: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;

            font-family: Manrope, sans-serif;
            font-size: ${priceFontSize}px;
            font-weight: 800;
            letter-spacing: -1px;
            line-height: 1;
            color: #24324A;

            text-shadow:
              0 2px 0 rgba(255,255,255,1),
              0 3px 7px rgba(36,50,74,0.16);
          ">
            ${price}
          </div>
        `,
        iconSize: [90, 90],
        iconAnchor: [45, 45],
      }),
    [price, priceFontSize],
  );

  const stayIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;

            font-family: Manrope, sans-serif;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: -0.5px;
            line-height: 1;
            color: #FFFFFF;

            text-shadow:
              0 2px 5px rgba(36,50,74,0.25);
          ">
            ${stayDays ?? ""}d
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      }),
    [stayDays],
  );

  const labelIcon = useMemo(() => {
    const configurations = {
      above: {
        anchor: [100, 76] as [number, number],
        textAlign: "center",
      },
      below: {
        anchor: [100, -42] as [number, number],
        textAlign: "center",
      },
      left: {
        anchor: [242, 24] as [number, number],
        textAlign: "right",
      },
      right: {
        anchor: [-42, 24] as [number, number],
        textAlign: "left",
      },
    };

    const configuration =
      configurations[labelPosition];

    return L.divIcon({
      className: "",
      html: `
        <div style="
          width: 200px;
          text-align: ${configuration.textAlign};
          pointer-events: none;
          white-space: nowrap;

          font-family: Manrope, sans-serif;
          font-size: ${destinationStyle.labelSize}px;
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1;
          color: #24324A;

          text-shadow:
            0 2px 0 white,
            0 0 8px white,
            0 3px 8px rgba(36,50,74,0.18);
        ">
          ${name}
        </div>
      `,
      iconSize: [200, 48],
      iconAnchor: configuration.anchor,
    });
  }, [
    destinationStyle.labelSize,
    labelPosition,
    name,
  ]);

  return (
    <>
      <CircleMarker
        center={position}
        radius={
          radius +
          destinationStyle.outerBorderWidth
        }
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
          fillColor: arrived
            ? "#E76F51"
            : selected
              ? "#FFF8F5"
              : "#FFFFFF",
          opacity: fadeOpacity,
          fillOpacity: fadeOpacity,
          weight: arrived
            ? 0
            : destinationStyle.borderWidth,
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
          opacity={fadeOpacity}
          interactive={false}
        />
      )}

      {arrived && stayDays !== undefined && (
        <Marker
          position={position}
          icon={stayIcon}
          opacity={fadeOpacity}
          interactive={false}
        />
      )}

      {showLabel && (
        <Marker
            position={position}
            icon={labelIcon}
            opacity={fadeOpacity}
            interactive={false}
        />
        )}
    </>
  );
}

export default DestinationMarker;