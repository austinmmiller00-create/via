import {
  useCallback,
  useState,
} from "react";
import {
  MapContainer,
  Marker,
  Pane,
  TileLayer,
} from "react-leaflet";

import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "leaflet/dist/leaflet.css";

import AnimatedRoute from "./AnimatedRoute";
import DestinationMarker from "./DestinationMarker";
import PreviewDestinationMarker from "./PreviewDestinationMarker";
import RouteCamera from "./RouteCamera";
import StayLengthCard from "./StayLengthCard";

import {
  barcelonaDestinations,
  valenciaDestinations,
  type Destination,
} from "./destinationData";

import {
  barcelonaDotIcon,
  barcelonaIcon,
} from "./mapIcons";

import { getRouteDuration } from "./routeAnimation";
import { barcelonaPosition } from "./routeData";
import type { TripState } from "./tripTypes";

const valencia = barcelonaDestinations.find(
  (destination) => destination.id === "valencia",
)!;

const barcelonaPreviewDestinations =
  barcelonaDestinations.filter(
    (destination) => !destination.active,
  );

const valenciaActiveDestinations =
  valenciaDestinations.filter(
    (destination) => destination.active,
  );

const valenciaSelectionDuration =
  getRouteDuration(
    valencia.route,
    valencia.transport,
    "selection",
  );

const initialTripState: TripState = {
  currentCityId: "barcelona",
  selectedDestinationId: null,
  arrivedDestinationId: null,
  stops: [],
};

function getRevealId(
  originId: string,
  destinationId: string,
) {
  return `${originId}:${destinationId}`;
}

type PreviewRouteProps = {
  destination: Destination;
  revealId: string;
  onComplete: (revealId: string) => void;
};

function PreviewRoute({
  destination,
  revealId,
  onComplete,
}: PreviewRouteProps) {
  const finishRoute = useCallback(() => {
    onComplete(revealId);
  }, [onComplete, revealId]);

  const duration = getRouteDuration(
    destination.route,
    destination.transport,
    "preview",
  );

  return (
    <AnimatedRoute
      route={destination.route}
      duration={duration}
      casingOpacity={0.45}
      routeOpacity={0.4}
      onComplete={finishRoute}
    />
  );
}

type SelectedRouteProps = {
  destination: Destination;
  onComplete: (destinationId: string) => void;
};

function SelectedRoute({
  destination,
  onComplete,
}: SelectedRouteProps) {
  const finishRoute = useCallback(() => {
    onComplete(destination.id);
  }, [destination.id, onComplete]);

  const duration = getRouteDuration(
    destination.route,
    destination.transport,
    "selection",
  );

  return (
    <AnimatedRoute
      route={destination.route}
      duration={duration}
      casingOpacity={0.95}
      routeOpacity={0.98}
      onComplete={finishRoute}
    />
  );
}

function Map() {
  const [
    visibleRouteIds,
    setVisibleRouteIds,
  ] = useState<string[]>([]);

  const [tripState, setTripState] =
    useState<TripState>(initialTripState);

  const inBarcelonaPhase =
    tripState.currentCityId === "barcelona";

  const inValenciaPhase =
    tripState.currentCityId === valencia.id;

  const valenciaSelected =
    tripState.selectedDestinationId === valencia.id;

  const valenciaArrived =
    tripState.arrivedDestinationId === valencia.id;

  const valenciaStayDays = tripState.stops.find(
    (stop) => stop.cityId === valencia.id,
  )?.days;

  const valenciaStayConfirmed =
    valenciaStayDays !== undefined;

  const selectedValenciaDestination =
    valenciaActiveDestinations.find(
      (destination) =>
        destination.id ===
        tripState.selectedDestinationId,
    );

  const selectedValenciaStayDays =
    selectedValenciaDestination
      ? tripState.stops.find(
          (stop) =>
            stop.cityId ===
            selectedValenciaDestination.id,
        )?.days
      : undefined;

  const selectedValenciaArrived =
    selectedValenciaDestination !== undefined &&
    tripState.arrivedDestinationId ===
      selectedValenciaDestination.id;

  const selectedValenciaDuration =
    selectedValenciaDestination
      ? getRouteDuration(
          selectedValenciaDestination.route,
          selectedValenciaDestination.transport,
          "selection",
        )
      : 0;

  const shouldShowCityLabel = (
    cityId: string,
  ) => {
    const hasVisitedCity =
      cityId === "barcelona" ||
      tripState.stops.some(
        (stop) => stop.cityId === cityId,
      );

    const isCurrentCity =
      tripState.currentCityId === cityId;

    const isSelectedDestination =
      tripState.selectedDestinationId === cityId;

    const hasMovedPastCity =
      hasVisitedCity &&
      !isCurrentCity &&
      !isSelectedDestination;

    const isLeavingCurrentCity =
      isCurrentCity &&
      tripState.selectedDestinationId !== null &&
      !isSelectedDestination;

    return (
      !hasMovedPastCity &&
      !isLeavingCurrentCity
    );
  };

  const showDestination = useCallback(
    (revealId: string) => {
      setVisibleRouteIds((currentIds) => {
        if (currentIds.includes(revealId)) {
          return currentIds;
        }

        return [...currentIds, revealId];
      });
    },
    [],
  );

  const selectDestination = useCallback(
    (destinationId: string) => {
      setTripState((currentState) => ({
        ...currentState,
        selectedDestinationId: destinationId,
        arrivedDestinationId: null,
      }));
    },
    [],
  );

  const finishDestinationSelection =
    useCallback((destinationId: string) => {
      setTripState((currentState) => ({
        ...currentState,
        arrivedDestinationId: destinationId,
      }));
    }, []);

  const confirmStay = useCallback(
    (
      destination: Destination,
      days: number,
    ) => {
      setTripState((currentState) => {
        const stopAlreadyExists =
          currentState.stops.some(
            (stop) =>
              stop.cityId === destination.id,
          );

        const updatedStops = stopAlreadyExists
          ? currentState.stops.map((stop) =>
              stop.cityId === destination.id
                ? {
                    ...stop,
                    days,
                  }
                : stop,
            )
          : [
              ...currentState.stops,
              {
                cityId: destination.id,
                cityName: destination.name,
                days,
              },
            ];

        return {
          ...currentState,
          currentCityId: destination.id,
          stops: updatedStops,
        };
      });
    },
    [],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <MapContainer
        center={[41.25, 0.1]}
        zoom={6.7}
        minZoom={5}
        maxZoom={10}
        zoomSnap={0.1}
        zoomDelta={0.2}
        wheelPxPerZoomLevel={1200}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />

        <Pane
          name="route-lines"
          style={{ zIndex: 350 }}
        >
          {/* Barcelona preview routes */}

          {inBarcelonaPhase && (
            <PreviewRoute
              destination={valencia}
              revealId={getRevealId(
                "barcelona",
                valencia.id,
              )}
              onComplete={showDestination}
            />
          )}

          {inBarcelonaPhase &&
            !valenciaSelected &&
            barcelonaPreviewDestinations.map(
              (destination) => (
                <PreviewRoute
                  key={`barcelona-preview-${destination.id}`}
                  destination={destination}
                  revealId={getRevealId(
                    "barcelona",
                    destination.id,
                  )}
                  onComplete={showDestination}
                />
              ),
            )}

          {inBarcelonaPhase &&
            valenciaSelected &&
            barcelonaPreviewDestinations.map(
              (destination) => (
                <AnimatedRoute
                  key={`barcelona-retract-${destination.id}`}
                  route={destination.route}
                  duration={getRouteDuration(
                    destination.route,
                    destination.transport,
                    "retraction",
                  )}
                  casingOpacity={0.45}
                  routeOpacity={0.4}
                  reverse
                />
              ),
            )}

          {/* Completed Barcelona to Valencia route */}

          {(valenciaSelected ||
            valenciaStayConfirmed) && (
            <SelectedRoute
              destination={valencia}
              onComplete={
                finishDestinationSelection
              }
            />
          )}

          {/* Valencia route options */}

          {inValenciaPhase &&
            valenciaActiveDestinations.map(
              (destination) => {
                const isSelected =
                  selectedValenciaDestination?.id ===
                  destination.id;

                if (
                  !selectedValenciaDestination ||
                  isSelected
                ) {
                  return (
                    <PreviewRoute
                      key={`valencia-preview-${destination.id}`}
                      destination={destination}
                      revealId={getRevealId(
                        "valencia",
                        destination.id,
                      )}
                      onComplete={showDestination}
                    />
                  );
                }

                return (
                  <AnimatedRoute
                    key={`valencia-retract-${destination.id}`}
                    route={destination.route}
                    duration={getRouteDuration(
                      destination.route,
                      destination.transport,
                      "retraction",
                    )}
                    casingOpacity={0.45}
                    routeOpacity={0.4}
                    reverse
                  />
                );
              },
            )}

          {/* Solid route draws over selected preview */}

          {selectedValenciaDestination && (
            <SelectedRoute
              destination={
                selectedValenciaDestination
              }
              onComplete={
                finishDestinationSelection
              }
            />
          )}
        </Pane>

        {valenciaSelected &&
          !valenciaArrived &&
          !valenciaStayConfirmed && (
            <RouteCamera
              route={valencia.route}
              duration={
                valenciaSelectionDuration
              }
            />
          )}

        {selectedValenciaDestination &&
          !selectedValenciaArrived &&
          selectedValenciaStayDays ===
            undefined && (
            <RouteCamera
              route={
                selectedValenciaDestination.route
              }
              duration={
                selectedValenciaDuration
              }
            />
          )}

        <Marker
          position={barcelonaPosition}
          icon={
            shouldShowCityLabel("barcelona")
              ? barcelonaIcon
              : barcelonaDotIcon
          }
          interactive={false}
        />

        {visibleRouteIds.includes(
          getRevealId("barcelona", valencia.id),
        ) && (
          <DestinationMarker
            position={valencia.position}
            name={valencia.name}
            price={valencia.price}
            selected={valenciaSelected}
            arrived={
              valenciaArrived ||
              valenciaStayConfirmed
            }
            stayDays={valenciaStayDays}
            showLabel={shouldShowCityLabel(
              valencia.id,
            )}
            labelPosition="below"
            onSelect={() =>
              selectDestination(valencia.id)
            }
          />
        )}

        {inBarcelonaPhase &&
          !valenciaSelected &&
          barcelonaPreviewDestinations.map(
            (destination) =>
              visibleRouteIds.includes(
                getRevealId(
                  "barcelona",
                  destination.id,
                ),
              ) && (
                <PreviewDestinationMarker
                  key={`barcelona-marker-${destination.id}`}
                  position={destination.position}
                  name={destination.name}
                  price={destination.price}
                  labelPosition={
                    destination.id === "palma"
                      ? "below"
                      : destination.id ===
                          "zaragoza"
                        ? "above"
                        : destination.id ===
                            "madrid"
                          ? "left"
                          : "right"
                  }
                />
              ),
          )}

        {valenciaActiveDestinations.map(
          (destination) => {
            const revealId = getRevealId(
              "valencia",
              destination.id,
            );

            const isVisible =
              visibleRouteIds.includes(revealId);

            const isSelected =
              selectedValenciaDestination?.id ===
              destination.id;

            const stayDays =
              tripState.stops.find(
                (stop) =>
                  stop.cityId === destination.id,
              )?.days;

            const hasArrived =
              tripState.arrivedDestinationId ===
                destination.id ||
              stayDays !== undefined;

            if (!isVisible) {
              return null;
            }

            if (
              selectedValenciaDestination &&
              !isSelected
            ) {
              return null;
            }

            return (
              <DestinationMarker
                key={`valencia-marker-${destination.id}`}
                position={destination.position}
                name={destination.name}
                price={destination.price}
                selected={isSelected}
                arrived={hasArrived}
                stayDays={stayDays}
                showLabel={shouldShowCityLabel(
                  destination.id,
                )}
                labelPosition={
                  destination.id === "madrid"
                    ? "left"
                    : "right"
                }
                onSelect={() =>
                  selectDestination(
                    destination.id,
                  )
                }
              />
            );
          },
        )}
      </MapContainer>

      {valenciaArrived &&
        !valenciaStayConfirmed && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              zIndex: 1000,
            }}
          >
            <StayLengthCard
              cityName={valencia.name}
              onConfirm={(days) =>
                confirmStay(valencia, days)
              }
            />
          </div>
        )}

      {selectedValenciaDestination &&
        selectedValenciaArrived &&
        selectedValenciaStayDays ===
          undefined && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              zIndex: 1000,
            }}
          >
            <StayLengthCard
              cityName={
                selectedValenciaDestination.name
              }
              onConfirm={(days) =>
                confirmStay(
                  selectedValenciaDestination,
                  days,
                )
              }
            />
          </div>
        )}
    </div>
  );
}

export default Map;