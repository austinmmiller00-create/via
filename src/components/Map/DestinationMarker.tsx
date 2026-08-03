import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import L from "leaflet";
import { Marker } from "react-leaflet";

import type { RoutePoint } from "./cityDatabase";
import { mapStyle } from "./mapStyle";
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

  const animationStyle =
    mapStyle.animation;

  const typography =
    mapStyle.typography;

  const [radius, setRadius] = useState(
    arrived
      ? destinationStyle.arrivedRadius
      : destinationStyle.radius,
  );

  const [hovered, setHovered] =
    useState(false);

  const fadeOpacity = useFadeIn(
    animationStyle.markerFadeDuration,
  );

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
        animationStyle
          .markerArrivalDuration,
      );

      return;
    }

    if (hovered) {
      animateRadius(
        selected
          ? destinationStyle.hoverRadius +
              2
          : destinationStyle.hoverRadius,
        animationStyle
          .markerHoverDuration,
      );

      return;
    }

    animateRadius(
      selected
        ? destinationStyle.selectedRadius
        : destinationStyle.radius,
      animationStyle.markerHoverDuration,
    );
  }, [
    animateRadius,
    animationStyle.markerArrivalDuration,
    animationStyle.markerHoverDuration,
    arrived,
    destinationStyle.arrivedRadius,
    destinationStyle.hoverRadius,
    destinationStyle.radius,
    destinationStyle.selectedRadius,
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
      animationStyle
        .markerPopOutDuration,
      () => {
        animateRadius(
          destinationStyle.selectedRadius,
          animationStyle
            .markerPopReturnDuration,
          () => {
            poppingRef.current = false;
          },
        );
      },
    );
  }, [
    animateRadius,
    animationStyle.markerPopOutDuration,
    animationStyle.markerPopReturnDuration,
    arrived,
    destinationStyle.popRadius,
    destinationStyle.selectedRadius,
    onSelect,
    selected,
  ]);

  const combinedIcon = useMemo(() => {
    const boxWidth =
      destinationStyle.canvasWidth;

    const boxHeight =
      destinationStyle.canvasHeight;

    const centerX = boxWidth / 2;
    const centerY = boxHeight / 2;

    const diameter = radius * 2;

    const priceFontSize = Math.max(
      destinationStyle.minimumPriceSize,
      destinationStyle.priceSize *
        (radius /
          destinationStyle.radius),
    );

    const circleBackground = arrived
      ? destinationStyle
          .arrivedBackgroundColor
      : selected
        ? destinationStyle
            .selectedBackgroundColor
        : destinationStyle
            .backgroundColor;

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
      ? destinationStyle
          .arrivedTextColor
      : destinationStyle.textColor;

    const circleTextSize = arrived
      ? destinationStyle.staySize
      : priceFontSize;

    const circleTextShadow = arrived
      ? destinationStyle
          .arrivedTextShadow
      : destinationStyle
          .priceTextShadow;

    const labelGap =
      destinationStyle.labelGap;

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
          width:
            ${destinationStyle.labelWidth}px;

          pointer-events: none;
          white-space: nowrap;

          ${labelStyles[labelPosition]}

          font-family:
            ${typography.family};

          font-size:
            ${destinationStyle.labelSize}px;

          font-weight:
            ${typography.labelWeight};

          letter-spacing:
            ${typography.labelLetterSpacing};

          line-height:
            ${typography.labelLineHeight};

          color:
            ${destinationStyle.labelColor};

          text-shadow:
            ${destinationStyle.labelTextShadow};
        ">
          ${escapeHtml(name)}
        </div>
      `
      : "";

    return L.divIcon({
      className: "via-destination-icon",
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

            pointer-events:
              ${arrived ? "none" : "auto"};

            cursor:
              ${arrived
                ? "default"
                : "pointer"};

            background:
              ${circleBackground};

            border:
              ${circleBorderWidth}px
              solid
              ${destinationStyle.borderColor};

            box-shadow:
              0 0 0
              ${
                destinationStyle
                  .outerBorderWidth
              }px
              ${
                destinationStyle
                  .outerBorderColor
              };

            font-family:
              ${typography.family};

            font-size:
              ${circleTextSize}px;

            font-weight:
              ${typography.priceWeight};

            letter-spacing:
              ${typography.priceLetterSpacing};

            line-height:
              ${typography.priceLineHeight};

            color:
              ${circleTextColor};

            text-shadow:
              ${circleTextShadow};
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
    typography,
  ]);

  const zIndexOffset = selected
    ? destinationStyle.selectedZIndex
    : hovered
      ? destinationStyle.hoveredZIndex
      : arrived
        ? destinationStyle.arrivedZIndex
        : destinationStyle.defaultZIndex;

  return (
    <Marker
      position={position}
      icon={combinedIcon}
      opacity={fadeOpacity}
      interactive={!arrived}
      keyboard={!arrived}
      zIndexOffset={zIndexOffset}
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