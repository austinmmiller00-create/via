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
    appearance: "none",

    width: `${cardStyle.stepButtonSize}px`,
    minWidth: `${cardStyle.stepButtonSize}px`,
    height: `${cardStyle.stepButtonSize}px`,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: 0,
    margin: 0,

    border: "none",
    outline: "none",

    borderRadius:
      `${cardStyle.stepButtonBorderRadius}px`,

    backgroundColor:
      cardStyle.stepButtonBackgroundColor,

    boxShadow:
      "0 3px 10px rgba(36, 50, 74, 0.1)",

    fontFamily: typography.family,
    fontSize:
      `${cardStyle.stepButtonFontSize}px`,
    fontWeight: typography.labelWeight,
    lineHeight: 1,

    color: cardStyle.textColor,
    cursor: "pointer",
  } as const;

  return (
    <div
      style={{
        width: `${cardStyle.width}px`,
        maxWidth: "calc(100vw - 48px)",

        boxSizing: "border-box",

        padding: `${cardStyle.padding}px`,

        borderRadius:
          `${cardStyle.borderRadius}px`,

        backgroundColor:
          cardStyle.backgroundColor,

        boxShadow: cardStyle.shadow,

        fontFamily: typography.family,
        color: cardStyle.textColor,

        backdropFilter:
          `blur(${cardStyle.backdropBlur}px)`,

        WebkitBackdropFilter:
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

          lineHeight: 1.25,

          color:
            cardStyle.secondaryTextColor,
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

          lineHeight: 1.05,
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

          lineHeight: 1.3,
        }}
      >
        How long are you staying?
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",

          boxSizing: "border-box",

          marginBottom:
            `${cardStyle.counterMarginBottom}px`,

          padding:
            `${cardStyle.counterPadding}px`,

          borderRadius:
            `${cardStyle.counterBorderRadius}px`,

          backgroundColor:
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
            flex: 1,

            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",

            whiteSpace: "nowrap",

            fontSize:
              `${cardStyle.dayNumberSize}px`,

            fontWeight:
              typography.labelWeight,

            lineHeight: 1,
          }}
        >
          <span>{days}</span>

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

              lineHeight: 1,
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
          appearance: "none",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          width: "100%",
          boxSizing: "border-box",

          margin: 0,

          padding: `
            ${cardStyle.confirmPaddingVertical}px
            ${cardStyle.confirmPaddingHorizontal}px
          `,

          border: "none",
          outline: "none",

          borderRadius:
            `${cardStyle.confirmBorderRadius}px`,

          backgroundColor:
            cardStyle.accentColor,

          fontFamily: typography.family,

          fontSize:
            `${cardStyle.confirmFontSize}px`,

          fontWeight:
            typography.labelWeight,

          lineHeight: 1.2,

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