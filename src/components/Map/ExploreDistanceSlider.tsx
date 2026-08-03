import type { ChangeEvent } from "react";

import { mapStyle } from "./mapStyle";

type ExploreDistanceSliderProps = {
  value: number;
  minimum?: number;
  maximum?: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
};

function ExploreDistanceSlider({
  value,
  minimum = 100,
  maximum = 1500,
  onChange,
  onCommit,
}: ExploreDistanceSliderProps) {
  const sliderStyle = mapStyle.slider;
  const typography = mapStyle.typography;

  function readValue(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    return Number(event.target.value);
  }

  return (
    <div
      style={{
        width: `min(${sliderStyle.width}px, calc(100vw - 48px))`,

        padding: `
          ${sliderStyle.paddingTop}px
          ${sliderStyle.paddingHorizontal}px
          ${sliderStyle.paddingBottom}px
        `,

        borderRadius:
          sliderStyle.borderRadius,

        background:
          sliderStyle.backgroundColor,

        boxShadow: sliderStyle.shadow,

        backdropFilter: "blur(12px)",
        fontFamily: typography.family,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight:
              typography.labelWeight,
            color:
              sliderStyle.textColor,
          }}
        >
          Explore further
        </span>

        <span
          style={{
            fontSize: "13px",
            fontWeight:
              typography.interfaceWeight,
            color:
              sliderStyle
                .secondaryTextColor,
          }}
        >
          {Math.round(value)} km
        </span>
      </div>

      <input
        type="range"
        min={minimum}
        max={maximum}
        step={25}
        value={value}
        aria-label="Explore distance"
        onChange={(event) =>
          onChange(readValue(event))
        }
        onPointerUp={(event) =>
          onCommit(
            Number(
              event.currentTarget.value,
            ),
          )
        }
        onTouchEnd={(event) =>
          onCommit(
            Number(
              event.currentTarget.value,
            ),
          )
        }
        onKeyUp={(event) => {
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Home" ||
            event.key === "End"
          ) {
            onCommit(
              Number(
                event.currentTarget.value,
              ),
            );
          }
        }}
        style={{
          width: "100%",
          cursor: "pointer",
          accentColor:
            sliderStyle.accentColor,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginTop: "6px",
          fontSize: "12px",
          fontWeight:
            typography.interfaceWeight,
          color:
            sliderStyle
              .secondaryTextColor,
        }}
      >
        <span>Near</span>
        <span>Far</span>
      </div>
    </div>
  );
}

export default ExploreDistanceSlider;