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

  return (
    <div
      style={{
        width: "310px",
        maxHeight: "calc(100vh - 48px)",
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

        fontFamily:
          mapStyle.typography.family,

        color: mapStyle.colors.ink,
      }}
    >
      <div
        style={{
          marginBottom: "4px",

          fontSize: "14px",
          fontWeight:
            mapStyle.typography
              .interfaceWeight,

          color:
            mapStyle.colors.mutedInk,
        }}
      >
        Your trip
      </div>

      <div
        style={{
          marginBottom: "20px",

          fontSize: "26px",
          fontWeight:
            mapStyle.typography
              .labelWeight,

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

            border: "4px solid #FFFFFF",
            borderRadius: "50%",

            background:
              mapStyle.colors.accent,

            boxShadow:
              "0 2px 7px rgba(36, 50, 74, 0.2)",
          }}
        />

        <div
          style={{
            fontSize: "16px",
            fontWeight:
              mapStyle.typography
                .labelWeight,
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
              mapStyle.typography
                .interfaceWeight,

            lineHeight: 1.45,

            color:
              mapStyle.colors.mutedInk,
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

                  border: "3px solid #FFFFFF",
                  borderRadius: "50%",

                  background:
                    mapStyle.colors.accent,

                  boxShadow:
                    "0 2px 6px rgba(36, 50, 74, 0.18)",
                }}
              />

              <div
                style={{
                  marginBottom: "5px",

                  fontSize: "17px",
                  fontWeight:
                    mapStyle.typography
                      .labelWeight,
                }}
              >
                {leg.cityName}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    padding:
                      "5px 9px",

                    borderRadius: "9px",

                    background: "#F2F4F7",

                    fontSize: "12px",
                    fontWeight:
                      mapStyle.typography
                        .interfaceWeight,

                    color:
                      mapStyle.colors
                        .mutedInk,
                  }}
                >
                  {getTransportLabel(
                    leg.transport,
                  )}
                </div>

                <div
                  style={{
                    padding:
                      "5px 9px",

                    borderRadius: "9px",

                    background: "#F2F4F7",

                    fontSize: "12px",
                    fontWeight:
                      mapStyle.typography
                        .interfaceWeight,

                    color:
                      mapStyle.colors
                        .mutedInk,
                  }}
                >
                  {leg.days}{" "}
                  {leg.days === 1
                    ? "day"
                    : "days"}
                </div>

                <div
                  style={{
                    padding:
                      "5px 9px",

                    borderRadius: "9px",

                    background:
                      mapStyle.colors
                        .accentSoft,

                    fontSize: "12px",
                    fontWeight:
                      mapStyle.typography
                        .labelWeight,

                    color:
                      mapStyle.colors
                        .accent,
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
                  mapStyle.typography
                    .interfaceWeight,

                color:
                  mapStyle.colors
                    .mutedInk,
              }}
            >
              Trip length
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight:
                  mapStyle.typography
                    .labelWeight,
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
                  mapStyle.typography
                    .interfaceWeight,

                color:
                  mapStyle.colors
                    .mutedInk,
              }}
            >
              Estimated travel
            </div>

            <div
              style={{
                fontSize: "19px",
                fontWeight:
                  mapStyle.typography
                    .labelWeight,

                color:
                  mapStyle.colors.accent,
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