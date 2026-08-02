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
import PreviewDestinationMarker from "./PreviewDestinationMarker";
import RouteCamera from "./RouteCamera";
import StayLengthCard from "./StayLengthCard";

import type { Destination } from "./destinationData";

import {
  getCityDestinations,
  getDestinationFromCity,
} from "./journeyData";

import {
  barcelonaDotIcon,
  barcelonaIcon,
} from "./mapIcons";

import { mapStyle } from "./mapStyle";
import { getRouteDuration } from "./routeAnimation";
import { barcelonaPosition } from "./routeData";
import type { TripState } from "./tripTypes";

type LabelPosition =
  | "above"
  | "below"
  | "left"
  | "right";

type CompletedLeg = {
  originId: string;
  destination: Destination;
  days: number;
};

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

function getLabelPosition(
  originId: string,
  destinationId: string,
): LabelPosition {
  if (originId === "barcelona") {
    if (
      destinationId === "valencia" ||
      destinationId === "palma"
    ) {
      return "below";
    }

    if (destinationId === "zaragoza") {
      return "above";
    }

    if (destinationId === "madrid") {
      return "left";
    }
  }

  if (
    originId === "valencia" &&
    destinationId === "madrid"
  ) {
    return "left";
  }

  return "right";
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

type StaticRouteProps = {
  destination: Destination;
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

  const currentDestinations =
    getCityDestinations(currentOriginId);

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
      let originId = "barcelona";

      for (const stop of tripState.stops) {
        const destination =
          getDestinationFromCity(
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
    currentOriginId === "barcelona" &&
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
              const isSelected =
                selectedDestination?.id ===
                destination.id;

              const revealId = getRevealId(
                currentOriginId,
                destination.id,
              );

              if (
                selectedDestination === undefined ||
                isSelected
              ) {
                return (
                  <PreviewRoute
                    key={`preview-${revealId}`}
                    destination={destination}
                    revealId={revealId}
                    onComplete={showDestination}
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
              destination={selectedDestination}
              onComplete={
                finishDestinationSelection
              }
            />
          )}
        </Pane>

        {selectedDestination &&
          !selectedArrived && (
            <RouteCamera
              route={selectedDestination.route}
              duration={selectedDuration}
            />
          )}

        <Marker
          position={barcelonaPosition}
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
              selectedDestination === undefined;

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
                  leg.destination.id,
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
              visibleRouteIds.includes(revealId);

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

            if (!destination.active) {
              return (
                <PreviewDestinationMarker
                  key={`preview-marker-${revealId}`}
                  position={destination.position}
                  name={destination.name}
                  price={destination.price}
                  labelPosition={getLabelPosition(
                    currentOriginId,
                    destination.id,
                  )}
                />
              );
            }

            return (
              <DestinationMarker
                key={`active-marker-${revealId}`}
                position={destination.position}
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
                  destination.id,
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