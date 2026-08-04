import type { SavedTrip } from "./savedTripsStorage";
import { mapStyle } from "./mapStyle";

type SavedTripsPanelProps = {
  trips: SavedTrip[];
  onClose: () => void;
  onOpenTrip: (trip: SavedTrip) => void;
  onDeleteTrip: (tripId: string) => void;
};

function formatSavedDate(
  createdAt: string,
) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Saved trip";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function SavedTripsPanel({
  trips,
  onClose,
  onOpenTrip,
  onDeleteTrip,
}: SavedTripsPanelProps) {
  const typography = mapStyle.typography;
  const colours = mapStyle.colors;

  const deleteTrip = (
    trip: SavedTrip,
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${trip.name}"?`,
      );

    if (confirmed) {
      onDeleteTrip(trip.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved trips"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2100,

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
          width: "460px",
          maxWidth: "100%",
          maxHeight:
            "calc(100vh - 48px)",

          display: "flex",
          flexDirection: "column",

          boxSizing: "border-box",
          padding: "24px",

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
            display: "flex",
            alignItems: "flex-start",
            justifyContent:
              "space-between",

            gap: "18px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                marginBottom: "4px",

                fontSize: "13px",
                fontWeight:
                  typography.interfaceWeight,

                color: colours.mutedInk,
              }}
            >
              Your journeys
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight:
                  typography.labelWeight,

                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              Saved trips
            </div>
          </div>

          <button
            type="button"
            aria-label="Close saved trips"
            onClick={onClose}
            style={{
              appearance: "none",

              width: "38px",
              height: "38px",
              flexShrink: 0,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              padding: 0,

              border:
                "1px solid rgba(36, 50, 74, 0.12)",

              borderRadius: "50%",

              background: "#F2F4F7",

              fontFamily:
                typography.family,

              fontSize: "22px",
              fontWeight:
                typography.interfaceWeight,

              lineHeight: 1,
              color: colours.ink,

              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            overflowY: "auto",
            paddingRight: "3px",
          }}
        >
          {trips.length === 0 ? (
            <div
              style={{
                padding: "34px 20px",

                borderRadius: "18px",
                background: "#F7F8FA",

                textAlign: "center",
              }}
            >
              <div
                style={{
                  marginBottom: "7px",

                  fontSize: "17px",
                  fontWeight:
                    typography.labelWeight,
                }}
              >
                No saved trips yet
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight:
                    typography.interfaceWeight,

                  lineHeight: 1.45,
                  color: colours.mutedInk,
                }}
              >
                Finish a trip and save it
                to see it here.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "11px",
              }}
            >
              {trips.map((trip) => {
                const totalDays =
                  trip.stops.reduce(
                    (total, stop) =>
                      total + stop.days,
                    0,
                  );

                const finalCity =
                  trip.stops[
                    trip.stops.length - 1
                  ]?.cityName;

                return (
                  <div
                    key={trip.id}
                    style={{
                      padding: "16px",

                      border:
                        "1px solid rgba(36, 50, 74, 0.1)",

                      borderRadius: "17px",
                      background: "#F7F8FA",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "flex-start",

                        justifyContent:
                          "space-between",

                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            marginBottom:
                              "4px",

                            overflow:
                              "hidden",

                            fontSize:
                              "16px",

                            fontWeight:
                              typography.labelWeight,

                            lineHeight: 1.25,
                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {trip.name}
                        </div>

                        <div
                          style={{
                            fontSize:
                              "12px",

                            fontWeight:
                              typography.interfaceWeight,

                            color:
                              colours.mutedInk,
                          }}
                        >
                          {formatSavedDate(
                            trip.createdAt,
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          flexShrink: 0,

                          padding:
                            "6px 9px",

                          borderRadius:
                            "999px",

                          background:
                            "rgba(231, 111, 81, 0.12)",

                          fontSize:
                            "12px",

                          fontWeight:
                            typography.labelWeight,

                          color:
                            colours.accent,
                        }}
                      >
                        {trip.stops.length}{" "}
                        {trip.stops.length ===
                        1
                          ? "stop"
                          : "stops"}
                      </div>
                    </div>

                    <div
                      style={{
                        marginBottom: "14px",

                        fontSize: "13px",
                        fontWeight:
                          typography.interfaceWeight,

                        lineHeight: 1.4,
                        color:
                          colours.mutedInk,
                      }}
                    >
                      {totalDays}{" "}
                      {totalDays === 1
                        ? "day"
                        : "days"}

                      {finalCity
                        ? ` · Ends in ${finalCity}`
                        : ""}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "9px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onOpenTrip(trip)
                        }
                        style={{
                          appearance:
                            "none",

                          flex: 1,

                          padding:
                            "11px 14px",

                          border: "none",
                          borderRadius:
                            "11px",

                          background:
                            colours.accent,

                          fontFamily:
                            typography.family,

                          fontSize:
                            "13px",

                          fontWeight:
                            typography.labelWeight,

                          color:
                            colours.white,

                          cursor:
                            "pointer",
                        }}
                      >
                        Open trip
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteTrip(trip)
                        }
                        style={{
                          appearance:
                            "none",

                          padding:
                            "11px 14px",

                          border:
                            "1px solid rgba(36, 50, 74, 0.12)",

                          borderRadius:
                            "11px",

                          background:
                            "#FFFFFF",

                          fontFamily:
                            typography.family,

                          fontSize:
                            "13px",

                          fontWeight:
                            typography.labelWeight,

                          color:
                            colours.mutedInk,

                          cursor:
                            "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedTripsPanel;