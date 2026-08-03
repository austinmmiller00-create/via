import type { ItineraryPanelLeg } from "./ItineraryPanel";
import { mapStyle } from "./mapStyle";

type EndTripSummaryProps = {
  startingCityName: string;
  legs: ItineraryPanelLeg[];
  finished: boolean;
  onKeepExploring: () => void;
  onFinishTrip: () => void;
  onStartNewTrip: () => void;
};

function getTransportLabel(
  transport: ItineraryPanelLeg["transport"],
) {
  const labels = {
    train: "Train",
    bus: "Bus",
    plane: "Flight",
    ferry: "Ferry",
  };

  return labels[transport];
}

function EndTripSummary({
  startingCityName,
  legs,
  finished,
  onKeepExploring,
  onFinishTrip,
  onStartNewTrip,
}: EndTripSummaryProps) {
  const totalDays = legs.reduce(
    (total, leg) => total + leg.days,
    0,
  );

  const totalPriceEur = legs.reduce(
    (total, leg) =>
      total + leg.estimatedPriceEur,
    0,
  );

  const typography = mapStyle.typography;
  const colours = mapStyle.colors;

  const secondaryButtonStyle = {
    appearance: "none",
    flex: 1,
    boxSizing: "border-box",
    padding: "14px 18px",
    margin: 0,
    border: "1px solid rgba(36, 50, 74, 0.14)",
    borderRadius: "14px",
    background: "#F2F4F7",
    fontFamily: typography.family,
    fontSize: "15px",
    fontWeight: typography.labelWeight,
    lineHeight: 1.2,
    color: colours.ink,
    cursor: "pointer",
  } as const;

  const primaryButtonStyle = {
    appearance: "none",
    flex: 1,
    boxSizing: "border-box",
    padding: "14px 18px",
    margin: 0,
    border: "none",
    borderRadius: "14px",
    background: colours.accent,
    fontFamily: typography.family,
    fontSize: "15px",
    fontWeight: typography.labelWeight,
    lineHeight: 1.2,
    color: colours.white,
    cursor: "pointer",
  } as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        finished
          ? "Trip complete"
          : "End trip confirmation"
      }
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2000,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        boxSizing: "border-box",
        padding: "24px",

        background:
          "rgba(36, 50, 74, 0.35)",

        backdropFilter: "blur(5px)",
        WebkitBackdropFilter:
          "blur(5px)",
      }}
    >
      <div
        style={{
          width: "430px",
          maxWidth: "100%",
          maxHeight: "calc(100vh - 48px)",

          boxSizing: "border-box",
          overflowY: "auto",

          padding: "26px",

          borderRadius: "24px",

          background:
            "rgba(255, 255, 255, 0.98)",

          boxShadow:
            "0 24px 70px rgba(36, 50, 74, 0.3)",

          fontFamily: typography.family,
          color: colours.ink,
        }}
      >
        <div
          style={{
            marginBottom: "5px",

            fontSize: "14px",
            fontWeight:
              typography.interfaceWeight,

            color: colours.mutedInk,
          }}
        >
          {finished
            ? "Your trip is ready"
            : "Trip summary"}
        </div>

        <div
          style={{
            marginBottom: "10px",

            fontSize: "29px",
            fontWeight:
              typography.labelWeight,

            letterSpacing: "-1.2px",
            lineHeight: 1.08,
          }}
        >
          {finished
            ? "Trip complete"
            : "Ready to finish?"}
        </div>

        <div
          style={{
            marginBottom: "22px",

            fontSize: "15px",
            fontWeight:
              typography.interfaceWeight,

            lineHeight: 1.45,

            color: colours.mutedInk,
          }}
        >
          {finished
            ? "Your itinerary has been completed."
            : "Review your itinerary before ending the trip."}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "10px",

            marginBottom: "22px",
          }}
        >
          <div
            style={{
              padding: "14px 10px",
              borderRadius: "15px",
              background: "#F2F4F7",
              textAlign: "center",
            }}
          >
            <div
              style={{
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight:
                  typography.interfaceWeight,
                color: colours.mutedInk,
              }}
            >
              Stops
            </div>

            <div
              style={{
                fontSize: "21px",
                fontWeight:
                  typography.labelWeight,
              }}
            >
              {legs.length}
            </div>
          </div>

          <div
            style={{
              padding: "14px 10px",
              borderRadius: "15px",
              background: "#F2F4F7",
              textAlign: "center",
            }}
          >
            <div
              style={{
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight:
                  typography.interfaceWeight,
                color: colours.mutedInk,
              }}
            >
              Days
            </div>

            <div
              style={{
                fontSize: "21px",
                fontWeight:
                  typography.labelWeight,
              }}
            >
              {totalDays}
            </div>
          </div>

          <div
            style={{
              padding: "14px 10px",
              borderRadius: "15px",
              background: colours.accentSoft,
              textAlign: "center",
            }}
          >
            <div
              style={{
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight:
                  typography.interfaceWeight,
                color: colours.accent,
              }}
            >
              Travel
            </div>

            <div
              style={{
                fontSize: "21px",
                fontWeight:
                  typography.labelWeight,
                color: colours.accent,
              }}
            >
              €{totalPriceEur}
            </div>
          </div>
        </div>

        <div
          style={{
            marginBottom: "8px",

            fontSize: "13px",
            fontWeight:
              typography.labelWeight,

            color: colours.mutedInk,
          }}
        >
          Route
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "16px",

            borderRadius: "17px",
            background: "#F7F8FA",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
            }}
          >
            <div
              style={{
                width: "13px",
                height: "13px",
                flexShrink: 0,

                border: "3px solid #FFFFFF",
                borderRadius: "50%",

                background: colours.accent,

                boxShadow:
                  "0 2px 6px rgba(36, 50, 74, 0.18)",
              }}
            />

            <div
              style={{
                fontSize: "15px",
                fontWeight:
                  typography.labelWeight,
              }}
            >
              {startingCityName}
            </div>
          </div>

          {legs.map((leg) => (
            <div
              key={leg.cityId}
              style={{
                position: "relative",

                marginLeft: "6px",
                paddingTop: "15px",
                paddingLeft: "24px",

                borderLeft:
                  "2px solid rgba(231, 111, 81, 0.3)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "-6px",

                  width: "10px",
                  height: "10px",

                  border: "2px solid #FFFFFF",
                  borderRadius: "50%",

                  background: colours.accent,
                }}
              />

              <div
                style={{
                  marginBottom: "4px",

                  fontSize: "15px",
                  fontWeight:
                    typography.labelWeight,
                }}
              >
                {leg.cityName}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight:
                    typography.interfaceWeight,

                  color: colours.mutedInk,
                }}
              >
                {getTransportLabel(
                  leg.transport,
                )}
                {" · "}
                {leg.days}{" "}
                {leg.days === 1
                  ? "day"
                  : "days"}
                {" · "}
                €{leg.estimatedPriceEur}
              </div>
            </div>
          ))}
        </div>

        {finished ? (
          <button
            type="button"
            onClick={onStartNewTrip}
            style={{
              ...primaryButtonStyle,
              width: "100%",
            }}
          >
            Start a new trip
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onKeepExploring}
              style={secondaryButtonStyle}
            >
              Keep exploring
            </button>

            <button
              type="button"
              onClick={onFinishTrip}
              style={primaryButtonStyle}
            >
              Finish trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EndTripSummary;