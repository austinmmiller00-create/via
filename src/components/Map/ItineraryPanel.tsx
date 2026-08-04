import type { TransportType } from "./cityDatabase";
import { mapStyle } from "./mapStyle";

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
  const totalPriceEur = legs.reduce(
    (total, leg) =>
      total + leg.estimatedPriceEur,
    0,
  );

  const totalDays = legs.reduce(
    (total, leg) => total + leg.days,
    0,
  );

  const typography = mapStyle.typography;
  const colours = mapStyle.colors;

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

  const editButtonStyle = {
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
      "1px solid rgba(36, 50, 74, 0.12)",

    borderRadius: "8px",

    background: "#FFFFFF",

    fontFamily: typography.family,
    fontSize: "18px",
    fontWeight: typography.labelWeight,
    lineHeight: 1,

    color: colours.ink,
    cursor: "pointer",
  } as const;

  return (
    <div
      style={{
        width: "310px",
        maxHeight:
          "calc(100vh - 48px)",

        boxSizing: "border-box",
        overflowY: "auto",

        padding: "20px",
        borderRadius: "22px",

        background:
          "rgba(255, 255, 255, 0.96)",

        boxShadow:
          "0 18px 45px rgba(36, 50, 74, 0.2)",

        backdropFilter: "blur(12px)",
        WebkitBackdropFilter:
          "blur(12px)",

        fontFamily: typography.family,
        color: colours.ink,
      }}
    >
      <div
        style={{
          marginBottom: "4px",

          fontSize: "14px",
          fontWeight:
            typography.interfaceWeight,

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
            typography.labelWeight,

          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}
      >
        Itinerary
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            flexShrink: 0,

            border:
              "4px solid #FFFFFF",

            borderRadius: "50%",

            background:
              colours.accent,

            boxShadow:
              "0 2px 7px rgba(36, 50, 74, 0.2)",
          }}
        />

        <div
          style={{
            fontSize: "16px",
            fontWeight:
              typography.labelWeight,
          }}
        >
          {startingCityName}
        </div>
      </div>

      {legs.length === 0 ? (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",

            borderRadius: "15px",
            background: "#F2F4F7",

            fontSize: "14px",
            fontWeight:
              typography.interfaceWeight,

            lineHeight: 1.45,
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

                paddingTop: "18px",
                paddingBottom: "2px",
                paddingLeft: "25px",

                borderLeft:
                  "2px solid rgba(231, 111, 81, 0.32)",
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
                    "3px solid #FFFFFF",

                  borderRadius: "50%",

                  background:
                    colours.accent,

                  boxShadow:
                    "0 2px 6px rgba(36, 50, 74, 0.18)",
                }}
              />

              <div
                style={{
                  marginBottom: "7px",

                  fontSize: "17px",
                  fontWeight:
                    typography.labelWeight,
                }}
              >
                {leg.cityName}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    padding: "5px 9px",

                    borderRadius: "9px",
                    background: "#F2F4F7",

                    fontSize: "12px",
                    fontWeight:
                      typography
                        .interfaceWeight,

                    color:
                      colours.mutedInk,
                  }}
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

                      borderRadius: "10px",
                      background: "#F2F4F7",
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Decrease stay in ${leg.cityName}`}
                      onClick={() =>
                        changeDays(
                          leg.cityId,
                          leg.days,
                          -1,
                        )
                      }
                      style={editButtonStyle}
                    >
                      −
                    </button>

                    <div
                      style={{
                        minWidth: "48px",

                        textAlign: "center",

                        fontSize: "12px",
                        fontWeight:
                          typography
                            .labelWeight,

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
                      onClick={() =>
                        changeDays(
                          leg.cityId,
                          leg.days,
                          1,
                        )
                      }
                      style={editButtonStyle}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "5px 9px",

                      borderRadius: "9px",
                      background: "#F2F4F7",

                      fontSize: "12px",
                      fontWeight:
                        typography
                          .interfaceWeight,

                      color:
                        colours.mutedInk,
                    }}
                  >
                    {leg.days}{" "}
                    {leg.days === 1
                      ? "day"
                      : "days"}
                  </div>
                )}

                <div
                  style={{
                    padding: "5px 9px",

                    borderRadius: "9px",

                    background:
                      colours.accentSoft,

                    fontSize: "12px",
                    fontWeight:
                      typography.labelWeight,

                    color:
                      colours.accent,
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

            gap: "16px",

            marginTop: "20px",
            paddingTop: "16px",

            borderTop:
              "1px solid rgba(36, 50, 74, 0.12)",
          }}
        >
          <div>
            <div
              style={{
                marginBottom: "3px",

                fontSize: "12px",
                fontWeight:
                  typography
                    .interfaceWeight,

                color:
                  colours.mutedInk,
              }}
            >
              Trip length
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight:
                  typography.labelWeight,
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
                marginBottom: "3px",

                fontSize: "12px",
                fontWeight:
                  typography
                    .interfaceWeight,

                color:
                  colours.mutedInk,
              }}
            >
              Estimated travel
            </div>

            <div
              style={{
                fontSize: "19px",
                fontWeight:
                  typography.labelWeight,

                color:
                  colours.accent,
              }}
            >
              €{totalPriceEur}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItineraryPanel;