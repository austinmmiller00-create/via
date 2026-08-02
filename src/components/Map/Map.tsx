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

const alicante = valenciaDestinations.find(
  (destination) => destination.id === "alicante",
)!;

const barcelonaPreviewDestinations =
  barcelonaDestinations.filter(
    (destination) => !destination.active,
  );

const valenciaPreviewDestinations =
  valenciaDestinations.filter(
    (destination) => !destination.active,
  );

const valenciaSelectionDuration =
  getRouteDuration(
    valencia.route,
    valencia.transport,
    "selection",
  );

const alicanteSelectionDuration =
  getRouteDuration(
    alicante.route,
    alicante.transport,
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

function Map() {
  const [
    visibleRouteIds,
    setVisibleRouteIds,
  ] = useState<string[]>([]);

  const [tripState, setTripState] =
    useState<TripState>(initialTripState);

  const inBarcelonaPhase =
    tripState.currentCityId === "barcelona";

  const valenciaSelected =
    tripState.selectedDestinationId === valencia.id;

  const alicanteSelected =
    tripState.selectedDestinationId === alicante.id;

  const valenciaArrived =
    tripState.arrivedDestinationId === valencia.id;

  const alicanteArrived =
    tripState.arrivedDestinationId === alicante.id;

  const valenciaStayDays = tripState.stops.find(
    (stop) => stop.cityId === valencia.id,
  )?.days;

  const alicanteStayDays = tripState.stops.find(
    (stop) => stop.cityId === alicante.id,
  )?.days;

  const valenciaStayConfirmed =
    valenciaStayDays !== undefined;

  const alicanteStayConfirmed =
    alicanteStayDays !== undefined;

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

  const finishValenciaSelection =
    useCallback(() => {
      setTripState((currentState) => ({
        ...currentState,
        arrivedDestinationId: valencia.id,
      }));
    }, []);

  const finishAlicanteSelection =
    useCallback(() => {
      setTripState((currentState) => ({
        ...currentState,
        arrivedDestinationId: alicante.id,
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
          <PreviewRoute
            destination={valencia}
            revealId={getRevealId(
              "barcelona",
              valencia.id,
            )}
            onComplete={showDestination}
          />

          {inBarcelonaPhase &&
            !valenciaSelected &&
            barcelonaPreviewDestinations.map(
              (destination) => (
                <PreviewRoute
                  key={destination.id}
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
                  key={`retract-barcelona-${destination.id}`}
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

          {(valenciaSelected ||
            valenciaStayConfirmed) && (
            <AnimatedRoute
              route={valencia.route}
              duration={valenciaSelectionDuration}
              casingOpacity={0.95}
              routeOpacity={0.98}
              onComplete={
                finishValenciaSelection
              }
            />
          )}

          {valenciaStayConfirmed && (
            <PreviewRoute
              destination={alicante}
              revealId={getRevealId(
                "valencia",
                alicante.id,
              )}
              onComplete={showDestination}
            />
          )}

          {valenciaStayConfirmed &&
            !alicanteSelected &&
            valenciaPreviewDestinations.map(
              (destination) => (
                <PreviewRoute
                  key={`valencia-${destination.id}`}
                  destination={destination}
                  revealId={getRevealId(
                    "valencia",
                    destination.id,
                  )}
                  onComplete={showDestination}
                />
              ),
            )}

          {valenciaStayConfirmed &&
            alicanteSelected &&
            valenciaPreviewDestinations.map(
              (destination) => (
                <AnimatedRoute
                  key={`retract-valencia-${destination.id}`}
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

          {(alicanteSelected ||
            alicanteStayConfirmed) && (
            <AnimatedRoute
              route={alicante.route}
              duration={alicanteSelectionDuration}
              casingOpacity={0.95}
              routeOpacity={0.98}
              onComplete={
                finishAlicanteSelection
              }
            />
          )}
        </Pane>

        {valenciaSelected && (
          <RouteCamera
            route={valencia.route}
            duration={valenciaSelectionDuration}
          />
        )}

        {alicanteSelected && (
          <RouteCamera
            route={alicante.route}
            duration={alicanteSelectionDuration}
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

        {visibleRouteIds.includes(
          getRevealId("valencia", alicante.id),
        ) && (
          <DestinationMarker
            position={alicante.position}
            name={alicante.name}
            price={alicante.price}
            selected={alicanteSelected}
            arrived={
              alicanteArrived ||
              alicanteStayConfirmed
            }
            stayDays={alicanteStayDays}
            showLabel={shouldShowCityLabel(
              alicante.id,
            )}
            labelPosition="right"
            onSelect={() =>
              selectDestination(alicante.id)
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
                  key={destination.id}
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

        {valenciaStayConfirmed &&
          !alicanteSelected &&
          valenciaPreviewDestinations.map(
            (destination) =>
              visibleRouteIds.includes(
                getRevealId(
                  "valencia",
                  destination.id,
                ),
              ) && (
                <PreviewDestinationMarker
                  key={`valencia-marker-${destination.id}`}
                  position={destination.position}
                  name={destination.name}
                  price={destination.price}
                  labelPosition="left"
                />
              ),
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

      {alicanteArrived &&
        !alicanteStayConfirmed && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              zIndex: 1000,
            }}
          >
            <StayLengthCard
              cityName={alicante.name}
              onConfirm={(days) =>
                confirmStay(alicante, days)
              }
            />
          </div>
        )}
    </div>
  );
}

export default Map;