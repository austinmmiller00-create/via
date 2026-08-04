import type { CSSProperties } from "react";

import Panel from "../ui/Panel";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

import type { TransportType } from "./cityDatabase";

export type ItineraryPanelLeg = {
  cityId: string;
  cityName: string;
  days: number;
  transport: TransportType;
  estimatedPriceEur: number;
};

type ItineraryPanelProps = {
  startingCityName: string;
  legs: ItineraryPanelLeg[];

  onChangeDays?: (
    cityId: string,
    days: number,
  ) => void;
};

function getTransportLabel(
  transport: TransportType,
) {
  const labels: Record<
    TransportType,
    string
  > = {
    train: "Train",
    bus: "Bus",
    plane: "Flight",
    ferry: "Ferry",
  };

  return labels[transport];
}

function ItineraryPanel({
  startingCityName,
  legs,
  onChangeDays,
}: ItineraryPanelProps) {
  const typography =
    designSystem.typography;

  const colours =
    designSystem.colours;

  const spacing =
    designSystem.spacing;

  const totalPriceEur = legs.reduce(
    (total, leg) =>
      total + leg.estimatedPriceEur,
    0,
  );

  const totalDays = legs.reduce(
    (total, leg) => total + leg.days,
    0,
  );

  const changeDays = (
    cityId: string,
    currentDays: number,
    change: number,
  ) => {
    if (!onChangeDays) {
      return;
    }

    const updatedDays = Math.min(
      14,
      Math.max(1, currentDays + change),
    );

    onChangeDays(cityId, updatedDays);
  };

  const editButtonStyle: CSSProperties = {
    appearance: "none",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    width: "27px",
    minWidth: "27px",
    height: "27px",

    boxSizing: "border-box",
    padding: 0,
    margin: 0,

    border:
      `1px solid ${colours.border}`,

    borderRadius:
      designSystem.radii.small,

    background:
      colours.surface,

    fontFamily:
      typography.family,

    fontSize: "18px",

    fontWeight:
      typography.weights.semibold,

    lineHeight: 1,

    color: colours.ink,
    cursor: "pointer",

    transition:
      designSystem.motion.fast,
  };

  const neutralBadgeStyle:
    CSSProperties = {
    display: "inline-flex",
    alignItems: "center",

    padding: "5px 9px",

    borderRadius:
      designSystem.radii.small,

    background:
      colours.surfaceMuted,

    fontFamily:
      typography.family,

    fontSize:
      typography.sizes.caption,

    fontWeight:
      typography.weights.regular,

    color: colours.mutedInk,
  };

  return (
    <Panel
      padding="none"
      style={{
        width:
          designSystem.layout.panelWidth,

        maxHeight:
          "calc(100vh - 48px)",

        overflowY: "auto",

        padding: "20px",

        borderRadius:
          designSystem.radii.modal,

        backdropFilter: "blur(12px)",

        WebkitBackdropFilter:
          "blur(12px)",
      }}
    >
      <div
        style={{
          marginBottom: spacing.tiny,

          fontSize:
            typography.sizes.body,

          fontWeight:
            typography.weights.regular,

          color: colours.mutedInk,
        }}
      >
        Your trip
      </div>

      <div
        style={{
          marginBottom: "20px",

          fontSize: "26px",

          fontWeight:
            typography.weights.bold,

          letterSpacing:
            typography.letterSpacing
              .heading,

          lineHeight: 1.1,
        }}
      >
        Itinerary
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",

          gap: spacing.regular,
        }}
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            flexShrink: 0,

            border:
              `4px solid ${colours.surface}`,

            borderRadius:
              designSystem.radii.circle,

            background:
              colours.accent,

            boxShadow:
              designSystem.shadows.subtle,
          }}
        />

        <div
          style={{
            fontSize: "16px",

            fontWeight:
              typography.weights.semibold,
          }}
        >
          {startingCityName}
        </div>
      </div>

      {legs.length === 0 ? (
        <div
          style={{
            ...componentStyles.card,

            marginTop: spacing.xxl,

            fontSize:
              typography.sizes.body,

            fontWeight:
              typography.weights.regular,

            lineHeight:
              typography.lineHeights
                .normal,

            color: colours.mutedInk,
          }}
        >
          Choose your first destination
          to begin building the trip.
        </div>
      ) : (
        <div>
          {legs.map((leg) => (
            <div
              key={leg.cityId}
              style={{
                position: "relative",

                marginLeft: "7px",

                paddingTop: spacing.xxl,
                paddingBottom: "2px",
                paddingLeft: "25px",

                borderLeft:
                  `2px solid ${colours.accentMuted}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "24px",
                  left: "-7px",

                  width: "12px",
                  height: "12px",

                  border:
                    `3px solid ${colours.surface}`,

                  borderRadius:
                    designSystem.radii.circle,

                  background:
                    colours.accent,

                  boxShadow:
                    designSystem.shadows.subtle,
                }}
              />

              <div
                style={{
                  marginBottom:
                    spacing.small,

                  fontSize:
                    typography.sizes
                      .headingSmall,

                  fontWeight:
                    typography.weights
                      .semibold,
                }}
              >
                {leg.cityName}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",

                  gap: spacing.xs,
                }}
              >
                <div
                  style={
                    neutralBadgeStyle
                  }
                >
                  {getTransportLabel(
                    leg.transport,
                  )}
                </div>

                {onChangeDays ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",

                      gap: "5px",
                      padding: "3px",

                      borderRadius:
                        designSystem.radii
                          .input,

                      background:
                        colours.surfaceMuted,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Decrease stay in ${leg.cityName}`}
                      disabled={leg.days <= 1}
                      onClick={() =>
                        changeDays(
                          leg.cityId,
                          leg.days,
                          -1,
                        )
                      }
                      style={{
                        ...editButtonStyle,

                        opacity:
                          leg.days <= 1
                            ? 0.45
                            : 1,

                        cursor:
                          leg.days <= 1
                            ? "default"
                            : "pointer",
                      }}
                    >
                      −
                    </button>

                    <div
                      style={{
                        minWidth: "48px",

                        textAlign: "center",

                        fontSize:
                          typography.sizes
                            .caption,

                        fontWeight:
                          typography.weights
                            .semibold,

                        color:
                          colours.mutedInk,
                      }}
                    >
                      {leg.days}{" "}
                      {leg.days === 1
                        ? "day"
                        : "days"}
                    </div>

                    <button
                      type="button"
                      aria-label={`Increase stay in ${leg.cityName}`}
                      disabled={leg.days >= 14}
                      onClick={() =>
                        changeDays(
                          leg.cityId,
                          leg.days,
                          1,
                        )
                      }
                      style={{
                        ...editButtonStyle,

                        opacity:
                          leg.days >= 14
                            ? 0.45
                            : 1,

                        cursor:
                          leg.days >= 14
                            ? "default"
                            : "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div
                    style={
                      neutralBadgeStyle
                    }
                  >
                    {leg.days}{" "}
                    {leg.days === 1
                      ? "day"
                      : "days"}
                  </div>
                )}

                <div
                  style={{
                    ...componentStyles.pill,

                    padding: "5px 9px",

                    borderRadius:
                      designSystem.radii
                        .small,
                  }}
                >
                  €{leg.estimatedPriceEur}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {legs.length > 0 && (
        <div
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            gap: spacing.xl,

            marginTop: "20px",
            paddingTop: spacing.xl,

            borderTop:
              `1px solid ${colours.border}`,
          }}
        >
          <div>
            <div
              style={{
                marginBottom:
                  spacing.tiny,

                fontSize:
                  typography.sizes.caption,

                fontWeight:
                  typography.weights.regular,

                color: colours.mutedInk,
              }}
            >
              Trip length
            </div>

            <div
              style={{
                fontSize:
                  typography.sizes
                    .headingSmall,

                fontWeight:
                  typography.weights
                    .semibold,
              }}
            >
              {totalDays}{" "}
              {totalDays === 1
                ? "day"
                : "days"}
            </div>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                marginBottom:
                  spacing.tiny,

                fontSize:
                  typography.sizes.caption,

                fontWeight:
                  typography.weights.regular,

                color: colours.mutedInk,
              }}
            >
              Estimated travel
            </div>

            <div
              style={{
                fontSize: "19px",

                fontWeight:
                  typography.weights.bold,

                color: colours.accent,
              }}
            >
              €{totalPriceEur}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

export default ItineraryPanel;