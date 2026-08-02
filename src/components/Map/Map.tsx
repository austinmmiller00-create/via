import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Pane,
  Polyline,
  TileLayer,
} from "react-leaflet";

import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "leaflet/dist/leaflet.css";

import AnimatedRoute from "./AnimatedRoute";
import DestinationMarker from "./DestinationMarker";
import RouteCamera from "./RouteCamera";
import StayLengthCard from "./StayLengthCard";

import {
  getCityById,
  type RoutePoint,
} from "./cityDatabase";

import {
  getGeneratedDestination,
  getGeneratedDestinations,
  type GeneratedDestination,
} from "./generatedDestinations";

import {
  barcelonaDotIcon,
  barcelonaIcon,
} from "./mapIcons";

import { mapStyle } from "./mapStyle";
import { getRouteDuration } from "./routeAnimation";
import type { TripState } from "./tripTypes";

type LabelPosition =
  | "above"
  | "below"
  | "left"
  | "right";

type CompletedLeg = {
  originId: string;
  destination: GeneratedDestination;
  days: number;
};

const startingCityId = "barcelona";

const initialTripState: TripState = {
  currentCityId: startingCityId,
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

function getLabelPosition(
  originCityId: string,
  destinationPosition: RoutePoint,
): LabelPosition {
  const originCity = getCityById(originCityId);

  if (!originCity) {
    return "right";
  }

  const latitudeDifference =
    destinationPosition[0] -
    originCity.position[0];

  const longitudeDifference =
    destinationPosition[1] -
    originCity.position[1];

  const movesMoreHorizontally =
    Math.abs(longitudeDifference) >=
    Math.abs(latitudeDifference);

  if (movesMoreHorizontally) {
    return longitudeDifference >= 0
      ? "right"
      : "left";
  }

  return latitudeDifference >= 0
    ? "above"
    : "below";
}

type PreviewRouteProps = {
  destination: GeneratedDestination;
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
  destination: GeneratedDestination;
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

type StaticRouteProps = {
  destination: GeneratedDestination;
};

function StaticRoute({
  destination,
}: StaticRouteProps) {
  return (
    <>
      <Polyline
        positions={destination.route}
        interactive={false}
        pathOptions={{
          color: "#FFFFFF",
          weight: mapStyle.route.casingWidth,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      <Polyline
        positions={destination.route}
        interactive={false}
        pathOptions={{
          color: "#E76F51",
          weight: mapStyle.route.lineWidth,
          opacity: 0.98,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </>
  );
}

function Map() {
  const [
    visibleRouteIds,
    setVisibleRouteIds,
  ] = useState<string[]>([]);

  const [tripState, setTripState] =
    useState<TripState>(initialTripState);

  const currentOriginId =
    tripState.currentCityId;

  const visitedCityIds = useMemo(
    () => [
      startingCityId,
      ...tripState.stops.map(
        (stop) => stop.cityId,
      ),
    ],
    [tripState.stops],
  );

  const currentDestinations = useMemo(
    () =>
      getGeneratedDestinations(
        currentOriginId,
        undefined,
        visitedCityIds,
      ),
    [currentOriginId, visitedCityIds],
  );

  const selectedDestination =
    currentDestinations.find(
      (destination) =>
        destination.id ===
        tripState.selectedDestinationId,
    );

  const selectedArrived =
    selectedDestination !== undefined &&
    tripState.arrivedDestinationId ===
      selectedDestination.id;

  const selectedDuration =
    selectedDestination !== undefined
      ? getRouteDuration(
          selectedDestination.route,
          selectedDestination.transport,
          "selection",
        )
      : 0;

  const completedLegs =
    useMemo<CompletedLeg[]>(() => {
      const legs: CompletedLeg[] = [];

      let originId = startingCityId;

      for (const stop of tripState.stops) {
        const destination =
          getGeneratedDestination(
            originId,
            stop.cityId,
          );

        if (destination) {
          legs.push({
            originId,
            destination,
            days: stop.days,
          });
        }

        originId = stop.cityId;
      }

      return legs;
    }, [tripState.stops]);

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
        selectedDestinationId:
          destinationId,
        arrivedDestinationId: null,
      }));
    },
    [],
  );

  const finishDestinationSelection =
    useCallback(
      (destinationId: string) => {
        setTripState((currentState) => ({
          ...currentState,
          arrivedDestinationId:
            destinationId,
        }));
      },
      [],
    );

  const confirmStay = useCallback(
    (
      destination: GeneratedDestination,
      days: number,
    ) => {
      setTripState((currentState) => ({
        currentCityId: destination.id,
        selectedDestinationId: null,
        arrivedDestinationId: null,
        stops: [
          ...currentState.stops,
          {
            cityId: destination.id,
            cityName: destination.name,
            days,
          },
        ],
      }));
    },
    [],
  );

  const showBarcelonaLabel =
    currentOriginId === startingCityId &&
    selectedDestination === undefined;

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
          {completedLegs.map(
            (leg, index) => (
              <StaticRoute
                key={`completed-${leg.originId}-${leg.destination.id}-${index}`}
                destination={leg.destination}
              />
            ),
          )}

          {currentDestinations.map(
            (destination) => {
              const revealId = getRevealId(
                currentOriginId,
                destination.id,
              );

              const isSelected =
                selectedDestination?.id ===
                destination.id;

              if (
                selectedDestination ===
                  undefined ||
                isSelected
              ) {
                return (
                  <PreviewRoute
                    key={`preview-${revealId}`}
                    destination={destination}
                    revealId={revealId}
                    onComplete={
                      showDestination
                    }
                  />
                );
              }

              return (
                <AnimatedRoute
                  key={`retract-${revealId}`}
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

          {selectedDestination && (
            <SelectedRoute
              key={`selected-${currentOriginId}-${selectedDestination.id}`}
              destination={
                selectedDestination
              }
              onComplete={
                finishDestinationSelection
              }
            />
          )}
        </Pane>

        {selectedDestination &&
          !selectedArrived && (
            <RouteCamera
              route={
                selectedDestination.route
              }
              duration={selectedDuration}
            />
          )}

        <Marker
          position={
            getCityById(startingCityId)
              ?.position ?? [41.38879, 2.15899]
          }
          icon={
            showBarcelonaLabel
              ? barcelonaIcon
              : barcelonaDotIcon
          }
          interactive={false}
        />

        {completedLegs.map(
          (leg, index) => {
            const isCurrentCity =
              currentOriginId ===
              leg.destination.id;

            const showLabel =
              isCurrentCity &&
              selectedDestination ===
                undefined;

            return (
              <DestinationMarker
                key={`completed-marker-${leg.originId}-${leg.destination.id}-${index}`}
                position={
                  leg.destination.position
                }
                name={leg.destination.name}
                price={leg.destination.price}
                selected={false}
                arrived
                stayDays={leg.days}
                showLabel={showLabel}
                labelPosition={getLabelPosition(
                  leg.originId,
                  leg.destination.position,
                )}
                onSelect={() => {}}
              />
            );
          },
        )}

        {currentDestinations.map(
          (destination) => {
            const revealId = getRevealId(
              currentOriginId,
              destination.id,
            );

            const isVisible =
              visibleRouteIds.includes(
                revealId,
              );

            const isSelected =
              selectedDestination?.id ===
              destination.id;

            if (!isVisible) {
              return null;
            }

            if (
              selectedDestination &&
              !isSelected
            ) {
              return null;
            }

            return (
              <DestinationMarker
                key={`destination-marker-${revealId}`}
                position={
                  destination.position
                }
                name={destination.name}
                price={destination.price}
                selected={isSelected}
                arrived={
                  isSelected &&
                  selectedArrived
                }
                showLabel
                labelPosition={getLabelPosition(
                  currentOriginId,
                  destination.position,
                )}
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

      {selectedDestination &&
        selectedArrived && (
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
                selectedDestination.name
              }
              onConfirm={(days) =>
                confirmStay(
                  selectedDestination,
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