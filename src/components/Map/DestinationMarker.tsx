import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import L from "leaflet";
import { Marker } from "react-leaflet";

import { mapStyle } from "./mapStyle";
import type { RoutePoint } from "./cityDatabase";
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

function escapeHtml(value: string) {
  const replacements: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(
    /[&<>"']/g,
    (character) =>
      replacements[character] ?? character,
  );
}

function DestinationMarker({
  position,
  name,
  price,
  selected,
  arrived,
  stayDays,
  labelPosition = "right",
  showLabel = true,
  onSelect,
}: DestinationMarkerProps) {
  const destinationStyle =
    mapStyle.destination;

  const [radius, setRadius] = useState(
    arrived
      ? destinationStyle.arrivedRadius
      : destinationStyle.radius,
  );

  const [hovered, setHovered] =
    useState(false);

  const fadeOpacity = useFadeIn(700);

  const radiusRef = useRef(radius);

  const animationFrameRef =
    useRef<number | null>(null);

  const poppingRef = useRef(false);

  const animateRadius = useCallback(
    (
      targetRadius: number,
      duration: number,
      onComplete?: () => void,
    ) => {
      if (
        animationFrameRef.current !== null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }

      const startingRadius =
        radiusRef.current;

      const startingTime =
        performance.now();

      function animate(
        currentTime: number,
      ) {
        const progress = Math.min(
          (currentTime - startingTime) /
            duration,
          1,
        );

        const easedProgress =
          1 - Math.pow(1 - progress, 3);

        const nextRadius =
          startingRadius +
          (targetRadius -
            startingRadius) *
            easedProgress;

        radiusRef.current = nextRadius;
        setRadius(nextRadius);

        if (progress < 1) {
          animationFrameRef.current =
            window.requestAnimationFrame(
              animate,
            );

          return;
        }

        animationFrameRef.current = null;
        onComplete?.();
      }

      animationFrameRef.current =
        window.requestAnimationFrame(
          animate,
        );
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !== null
      ) {
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
          ? destinationStyle.hoverRadius +
              2
          : destinationStyle.hoverRadius,
        180,
      );

      return;
    }

    animateRadius(
      selected
        ? destinationStyle.selectedRadius
        : destinationStyle.radius,
      180,
    );
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

  const combinedIcon = useMemo(() => {
    /*
      The Leaflet marker itself has no dimensions.
      Everything is positioned around its geographic
      anchor inside one shared HTML element.
    */

    const boxWidth = 540;
    const boxHeight = 240;

    const centerX = boxWidth / 2;
    const centerY = boxHeight / 2;

    const diameter = radius * 2;

    const priceFontSize = Math.max(
      12,
      destinationStyle.priceSize *
        (radius /
          destinationStyle.radius),
    );

    const circleBackground = arrived
      ? "#E76F51"
      : selected
        ? "#FFF8F5"
        : "#FFFFFF";

    const circleBorderWidth = arrived
      ? 0
      : destinationStyle.borderWidth;

    const circleText =
      arrived && stayDays !== undefined
        ? `${stayDays}d`
        : arrived
          ? ""
          : escapeHtml(price);

    const circleTextColor = arrived
      ? "#FFFFFF"
      : "#24324A";

    const circleTextSize = arrived
      ? 14
      : priceFontSize;

    const labelGap = 18;

    const labelStyles: Record<
      LabelPosition,
      string
    > = {
      above: `
        left: ${centerX}px;
        top: ${
          centerY -
          radius -
          labelGap
        }px;
        transform:
          translate(-50%, -100%);
        text-align: center;
      `,

      below: `
        left: ${centerX}px;
        top: ${
          centerY +
          radius +
          labelGap
        }px;
        transform:
          translate(-50%, 0);
        text-align: center;
      `,

      left: `
        right: ${
          boxWidth -
          centerX +
          radius +
          labelGap
        }px;
        top: ${centerY}px;
        transform:
          translate(0, -50%);
        text-align: right;
      `,

      right: `
        left: ${
          centerX +
          radius +
          labelGap
        }px;
        top: ${centerY}px;
        transform:
          translate(0, -50%);
        text-align: left;
      `,
    };

    const labelHtml = showLabel
      ? `
        <div style="
          position: absolute;
          width: 220px;
          pointer-events: none;
          white-space: nowrap;

          ${labelStyles[labelPosition]}

          font-family:
            Manrope, sans-serif;
          font-size:
            ${destinationStyle.labelSize}px;
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1;
          color: #24324A;

          text-shadow:
            0 2px 0 white,
            0 0 8px white,
            0 3px 8px
              rgba(36,50,74,0.18);
        ">
          ${escapeHtml(name)}
        </div>
      `
      : "";

    return L.divIcon({
      className: "via-destination-icon",

      /*
        A zero-sized Leaflet icon keeps the geographic
        anchor stable while the animated circle changes
        size.
      */

      iconSize: [0, 0],
      iconAnchor: [0, 0],

      html: `
        <div style="
          position: absolute;
          left: -${centerX}px;
          top: -${centerY}px;
          width: ${boxWidth}px;
          height: ${boxHeight}px;
          pointer-events: none;
        ">
          <div style="
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            transform:
              translate(-50%, -50%);

            width: ${diameter}px;
            height: ${diameter}px;
            box-sizing: border-box;
            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            pointer-events: ${
              arrived ? "none" : "auto"
            };
            cursor: ${
              arrived
                ? "default"
                : "pointer"
            };

            background:
              ${circleBackground};

            border:
              ${circleBorderWidth}px
              solid #E76F51;

            box-shadow:
              0 0 0
              ${
                destinationStyle
                  .outerBorderWidth
              }px
              #FFFFFF;

            font-family:
              Manrope, sans-serif;
            font-size:
              ${circleTextSize}px;
            font-weight: 800;
            letter-spacing: -1px;
            line-height: 1;
            color: ${circleTextColor};

            text-shadow:
              0 2px 0
                rgba(255,255,255,1),
              0 3px 7px
                rgba(36,50,74,0.16);
          ">
            ${circleText}
          </div>

          ${labelHtml}
        </div>
      `,
    });
  }, [
    arrived,
    destinationStyle,
    labelPosition,
    name,
    price,
    radius,
    selected,
    showLabel,
    stayDays,
  ]);

  return (
    <Marker
      position={position}
      icon={combinedIcon}
      opacity={fadeOpacity}
      interactive={!arrived}
      keyboard={!arrived}
      zIndexOffset={
        selected
          ? 1000
          : hovered
            ? 500
            : arrived
              ? -100
              : 0
      }
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
  );
}

export default DestinationMarker;