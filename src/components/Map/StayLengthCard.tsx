import { useState } from "react";

import { mapStyle } from "./mapStyle";

type StayLengthCardProps = {
  cityName: string;
  initialDays?: number;
  onConfirm: (days: number) => void;
};

function StayLengthCard({
  cityName,
  initialDays = 3,
  onConfirm,
}: StayLengthCardProps) {
  const [days, setDays] =
    useState(initialDays);

  const cardStyle = mapStyle.stayCard;
  const typography = mapStyle.typography;

  const decreaseDays = () => {
    setDays((currentDays) =>
      Math.max(1, currentDays - 1),
    );
  };

  const increaseDays = () => {
    setDays((currentDays) =>
      Math.min(14, currentDays + 1),
    );
  };

  const stepButtonStyle = {
    width: `${cardStyle.stepButtonSize}px`,
    height: `${cardStyle.stepButtonSize}px`,

    border: "none",

    borderRadius:
      `${cardStyle.stepButtonBorderRadius}px`,

    background:
      cardStyle.stepButtonBackgroundColor,

    fontFamily: typography.family,
    fontSize:
      `${cardStyle.stepButtonFontSize}px`,
    fontWeight: typography.labelWeight,

    color: cardStyle.textColor,
    cursor: "pointer",
  } as const;

  return (
    <div
      style={{
        width: `${cardStyle.width}px`,
        padding: `${cardStyle.padding}px`,

        borderRadius:
          `${cardStyle.borderRadius}px`,

        background:
          cardStyle.backgroundColor,

        boxShadow: cardStyle.shadow,

        fontFamily: typography.family,
        color: cardStyle.textColor,

        backdropFilter:
          `blur(${cardStyle.backdropBlur}px)`,
      }}
    >
      <div
        style={{
          marginBottom:
            `${cardStyle.eyebrowMarginBottom}px`,

          fontSize:
            `${cardStyle.eyebrowSize}px`,

          fontWeight:
            typography.interfaceWeight,

          color:
            cardStyle.secondaryTextColor,

          opacity:
            cardStyle.eyebrowOpacity,
        }}
      >
        You’ve arrived in
      </div>

      <div
        style={{
          marginBottom:
            `${cardStyle.cityMarginBottom}px`,

          fontSize:
            `${cardStyle.citySize}px`,

          fontWeight:
            typography.labelWeight,

          letterSpacing:
            cardStyle.cityLetterSpacing,
        }}
      >
        {cityName}
      </div>

      <div
        style={{
          marginBottom:
            `${cardStyle.questionMarginBottom}px`,

          fontSize:
            `${cardStyle.questionSize}px`,

          fontWeight:
            typography.interfaceWeight,
        }}
      >
        How long are you staying?
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",

          marginBottom:
            `${cardStyle.counterMarginBottom}px`,

          padding:
            `${cardStyle.counterPadding}px`,

          borderRadius:
            `${cardStyle.counterBorderRadius}px`,

          background:
            cardStyle.counterBackgroundColor,
        }}
      >
        <button
          type="button"
          onClick={decreaseDays}
          aria-label="Decrease stay length"
          style={stepButtonStyle}
        >
          −
        </button>

        <div
          style={{
            textAlign: "center",

            fontSize:
              `${cardStyle.dayNumberSize}px`,

            fontWeight:
              typography.labelWeight,
          }}
        >
          {days}

          <span
            style={{
              marginLeft:
                `${cardStyle.dayUnitMarginLeft}px`,

              fontSize:
                `${cardStyle.dayUnitSize}px`,

              fontWeight:
                typography.interfaceWeight,

              color:
                cardStyle.secondaryTextColor,

              opacity:
                cardStyle.dayUnitOpacity,
            }}
          >
            {days === 1
              ? "day"
              : "days"}
          </span>
        </div>

        <button
          type="button"
          onClick={increaseDays}
          aria-label="Increase stay length"
          style={stepButtonStyle}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => onConfirm(days)}
        style={{
          width: "100%",

          padding: `
            ${cardStyle.confirmPaddingVertical}px
            ${cardStyle.confirmPaddingHorizontal}px
          `,

          border: "none",

          borderRadius:
            `${cardStyle.confirmBorderRadius}px`,

          background:
            cardStyle.accentColor,

          fontFamily: typography.family,

          fontSize:
            `${cardStyle.confirmFontSize}px`,

          fontWeight:
            typography.labelWeight,

          color:
            cardStyle.accentTextColor,

          cursor: "pointer",
        }}
      >
        Continue exploring
      </button>
    </div>
  );
}

export default StayLengthCard;