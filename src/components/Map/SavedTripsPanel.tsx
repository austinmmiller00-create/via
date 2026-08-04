import Button from "../ui/Button";
import Modal from "../ui/Modal";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

import type { SavedTrip } from "./savedTripsStorage";

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
  const typography =
    designSystem.typography;

  const colours =
    designSystem.colours;

  const spacing =
    designSystem.spacing;

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
    <Modal
      ariaLabel="Saved trips"
      width="regular"
      zIndex={
        designSystem.zIndex.modalAbove
      }
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent:
            "space-between",

          gap: spacing.xxl,
          marginBottom: spacing.panel,
        }}
      >
        <div>
          <div
            style={{
              marginBottom: spacing.tiny,

              fontSize:
                typography.sizes.small,

              fontWeight:
                typography.weights.regular,

              color: colours.mutedInk,
            }}
          >
            Your journeys
          </div>

          <div
            style={{
              fontSize:
                typography.sizes
                  .headingLarge,

              fontWeight:
                typography.weights.bold,

              letterSpacing:
                typography.letterSpacing
                  .heading,

              lineHeight:
                typography.lineHeights
                  .compact,
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
              `1px solid ${colours.border}`,

            borderRadius:
              designSystem.radii.circle,

            background:
              colours.surfaceMuted,

            fontFamily:
              typography.family,

            fontSize: "22px",

            fontWeight:
              typography.weights.regular,

            lineHeight: 1,

            color: colours.ink,
            cursor: "pointer",

            transition:
              designSystem.motion.fast,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          overflowY: "auto",
          paddingRight: spacing.tiny,
        }}
      >
        {trips.length === 0 ? (
          <div
            style={{
              ...componentStyles.card,

              padding:
                `${designSystem.spacing.page} ${designSystem.spacing.section}`,

              textAlign: "center",
            }}
          >
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
              No saved trips yet
            </div>

            <div
              style={{
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
              Finish a trip and save it
              to see it here.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.regular,
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
                    ...componentStyles.card,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "flex-start",

                      justifyContent:
                        "space-between",

                      gap: spacing.regular,
                      marginBottom:
                        spacing.regular,
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
                            spacing.tiny,

                          overflow:
                            "hidden",

                          fontSize:
                            typography.sizes
                              .bodyLarge,

                          fontWeight:
                            typography.weights
                              .semibold,

                          lineHeight:
                            typography.lineHeights
                              .tight,

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
                            typography.sizes
                              .caption,

                          fontWeight:
                            typography.weights
                              .regular,

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
                        ...componentStyles.pill,
                        flexShrink: 0,
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
                      marginBottom:
                        spacing.large,

                      fontSize:
                        typography.sizes.small,

                      fontWeight:
                        typography.weights
                          .regular,

                      lineHeight:
                        typography.lineHeights
                          .normal,

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
                      gap: spacing.medium,
                    }}
                  >
                    <Button
                      size="small"
                      style={{
                        flex: 1,
                      }}
                      onClick={() =>
                        onOpenTrip(trip)
                      }
                    >
                      Open trip
                    </Button>

                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        deleteTrip(trip)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default SavedTripsPanel;