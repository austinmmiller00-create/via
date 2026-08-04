import { useState } from "react";

import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

import type { ItineraryPanelLeg } from "./ItineraryPanel";

type EndTripSummaryProps = {
  startingCityName: string;
  legs: ItineraryPanelLeg[];
  finished: boolean;
  onKeepExploring: () => void;
  onFinishTrip: () => void;
  onStartNewTrip: () => void;
  onSaveTrip: (name: string) => void;
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
  onSaveTrip,
}: EndTripSummaryProps) {
  const typography =
    designSystem.typography;

  const colours =
    designSystem.colours;

  const spacing =
    designSystem.spacing;

  const finalCityName =
    legs[legs.length - 1]?.cityName ??
    "Trip";

  const [tripName, setTripName] =
    useState(
      `${startingCityName} to ${finalCityName}`,
    );

  const [tripSaved, setTripSaved] =
    useState(false);

  const totalDays = legs.reduce(
    (total, leg) => total + leg.days,
    0,
  );

  const totalPriceEur = legs.reduce(
    (total, leg) =>
      total + leg.estimatedPriceEur,
    0,
  );

  const saveTrip = () => {
    const cleanedName = tripName.trim();

    if (!cleanedName || tripSaved) {
      return;
    }

    onSaveTrip(cleanedName);
    setTripSaved(true);
  };

  return (
    <Modal
      ariaLabel={
        finished
          ? "Trip complete"
          : "End trip confirmation"
      }
      width="small"
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
        {finished
          ? "Your trip is ready"
          : "Trip summary"}
      </div>

      <div
        style={{
          marginBottom: spacing.medium,

          fontSize:
            typography.sizes.display,

          fontWeight:
            typography.weights.bold,

          letterSpacing:
            typography.letterSpacing
              .display,

          lineHeight:
            typography.lineHeights
              .compact,
        }}
      >
        {finished
          ? "Trip complete"
          : "Ready to finish?"}
      </div>

      <div
        style={{
          marginBottom: spacing.section,

          fontSize:
            typography.sizes.bodyLarge,

          fontWeight:
            typography.weights.regular,

          lineHeight:
            typography.lineHeights.normal,

          color: colours.mutedInk,
        }}
      >
        {finished
          ? "Save this itinerary so you can open it again later."
          : "Review your itinerary before ending the trip."}
      </div>

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(3, 1fr)",

          gap: spacing.medium,
          marginBottom: spacing.section,
        }}
      >
        <div
          style={{
            padding: `${spacing.large} ${spacing.medium}`,

            borderRadius:
              designSystem.radii.button,

            background:
              colours.surfaceMuted,

            textAlign: "center",
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
            Stops
          </div>

          <div
            style={{
              fontSize:
                typography.sizes
                  .headingMedium,

              fontWeight:
                typography.weights.bold,
            }}
          >
            {legs.length}
          </div>
        </div>

        <div
          style={{
            padding: `${spacing.large} ${spacing.medium}`,

            borderRadius:
              designSystem.radii.button,

            background:
              colours.surfaceMuted,

            textAlign: "center",
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
            Days
          </div>

          <div
            style={{
              fontSize:
                typography.sizes
                  .headingMedium,

              fontWeight:
                typography.weights.bold,
            }}
          >
            {totalDays}
          </div>
        </div>

        <div
          style={{
            padding: `${spacing.large} ${spacing.medium}`,

            borderRadius:
              designSystem.radii.button,

            background:
              colours.accentSoft,

            textAlign: "center",
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

              color: colours.accent,
            }}
          >
            Travel
          </div>

          <div
            style={{
              fontSize:
                typography.sizes
                  .headingMedium,

              fontWeight:
                typography.weights.bold,

              color: colours.accent,
            }}
          >
            €{totalPriceEur}
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: spacing.small,

          fontSize:
            typography.sizes.small,

          fontWeight:
            typography.weights.semibold,

          color: colours.mutedInk,
        }}
      >
        Route
      </div>

      <div
        style={{
          ...componentStyles.card,

          marginBottom:
            designSystem.spacing.panel,

          background:
            colours.surfaceSoft,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",

            gap: spacing.regular,
          }}
        >
          <div
            style={{
              width: "13px",
              height: "13px",
              flexShrink: 0,

              border:
                `3px solid ${colours.surface}`,

              borderRadius:
                designSystem.radii.circle,

              background: colours.accent,

              boxShadow:
                designSystem.shadows.subtle,
            }}
          />

          <div
            style={{
              fontSize:
                typography.sizes.bodyLarge,

              fontWeight:
                typography.weights.semibold,
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

              marginLeft: spacing.xs,
              paddingTop: spacing.xl,
              paddingLeft:
                designSystem.spacing.panel,

              borderLeft:
                `2px solid ${colours.accentMuted}`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "-6px",

                width: "10px",
                height: "10px",

                border:
                  `2px solid ${colours.surface}`,

                borderRadius:
                  designSystem.radii.circle,

                background: colours.accent,
              }}
            />

            <div
              style={{
                marginBottom:
                  spacing.tiny,

                fontSize:
                  typography.sizes
                    .bodyLarge,

                fontWeight:
                  typography.weights
                    .semibold,
              }}
            >
              {leg.cityName}
            </div>

            <div
              style={{
                fontSize:
                  typography.sizes.caption,

                fontWeight:
                  typography.weights.regular,

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

      {finished && (
        <div
          style={{
            ...componentStyles.card,

            marginBottom: spacing.large,

            background:
              colours.surfaceMuted,
          }}
        >
          <TextInput
            id="saved-trip-name"
            label="Trip name"
            type="text"
            value={tripName}
            disabled={tripSaved}
            onChange={(event) =>
              setTripName(
                event.target.value,
              )
            }
            style={{
              marginBottom:
                spacing.medium,
            }}
          />

          <Button
            fullWidth
            disabled={tripSaved}
            onClick={saveTrip}
          >
            {tripSaved
              ? "Trip saved"
              : "Save trip"}
          </Button>
        </div>
      )}

      {finished ? (
        <Button
          variant="secondary"
          fullWidth
          onClick={onStartNewTrip}
        >
          Start a new trip
        </Button>
      ) : (
        <div
          style={{
            display: "flex",
            gap: spacing.medium,
          }}
        >
          <Button
            variant="secondary"
            style={{
              flex: 1,
            }}
            onClick={onKeepExploring}
          >
            Keep exploring
          </Button>

          <Button
            style={{
              flex: 1,
            }}
            onClick={onFinishTrip}
          >
            Finish trip
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default EndTripSummary;