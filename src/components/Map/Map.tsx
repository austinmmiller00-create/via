import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Pane,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "leaflet/dist/leaflet.css";

import AnimatedRoute from "./AnimatedRoute";
import DestinationMarker from "./DestinationMarker";
import EndTripSummary from "./EndTripSummary";
import ExploreDistanceSlider from "./ExploreDistanceSlider";

import ItineraryPanel, {
  type ItineraryPanelLeg,
} from "./ItineraryPanel";

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

import {
  getTransportRouteStyle,
  mapStyle,
} from "./mapStyle";

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

const minimumExploreDistanceKm = 100;
const maximumExploreDistanceKm = 1500;
const defaultExploreDistanceKm = 350;

const initialTripState: TripState = {
  currentCityId: startingCityId,
  selectedDestinationId: null,
  arrivedDestinationId: null,
  stops: [],
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

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
  const originCity =
    getCityById(originCityId);

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

function getExploreZoom(
  distanceKm: number,
) {
  const progress = clamp(
    (distanceKm -
      minimumExploreDistanceKm) /
      (maximumExploreDistanceKm -
        minimumExploreDistanceKm),
    0,
    1,
  );

  const nearZoom = 7.1;
  const farZoom = 4.15;

  return (
    nearZoom -
    progress * (nearZoom - farZoom)
  );
}

type ExploreZoomControllerProps = {
  cityId: string;
  distanceKm: number;
  enabled: boolean;
};

function ExploreZoomController({
  cityId,
  distanceKm,
  enabled,
}: ExploreZoomControllerProps) {
  const map = useMap();

  const latestDistanceRef =
    useRef(distanceKm);

  const lastCameraUpdateRef =
    useRef(0);

  const timeoutRef =
    useRef<number | null>(null);

  useEffect(() => {
    latestDistanceRef.current =
      distanceKm;
  }, [distanceKm]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(
          timeoutRef.current,
        );

        timeoutRef.current = null;
      }

      map.stop();

      return;
    }

    const city = getCityById(cityId);

    if (!city) {
      return;
    }

    function moveCamera() {
      const targetZoom =
        getExploreZoom(
          latestDistanceRef.current,
        );

      lastCameraUpdateRef.current =
        performance.now();

      map.flyTo(
        city.position,
        targetZoom,
        {
          animate: true,

          duration:
            mapStyle.animation
              .exploreCameraDuration,

          easeLinearity: 0.35,
        },
      );

      timeoutRef.current = null;
    }

    const timeSinceLastUpdate =
      performance.now() -
      lastCameraUpdateRef.current;

    const minimumUpdateGap =
      mapStyle.animation
        .exploreCameraUpdateGap;

    const delay = Math.max(
      0,
      minimumUpdateGap -
        timeSinceLastUpdate,
    );

    if (timeoutRef.current !== null) {
      window.clearTimeout(
        timeoutRef.current,
      );
    }

    timeoutRef.current =
      window.setTimeout(
        moveCamera,
        delay,
      );

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(
          timeoutRef.current,
        );

        timeoutRef.current = null;
      }
    };
  }, [
    cityId,
    distanceKm,
    enabled,
    map,
  ]);

  return null;
}

type PreviewRouteProps = {
  destination: GeneratedDestination;
  revealId: string;
  onComplete: (
    revealId: string,
  ) => void;
};

function PreviewRoute({
  destination,
  revealId,
  onComplete,
}: PreviewRouteProps) {
  const finishRoute =
    useCallback(() => {
      onComplete(revealId);
    }, [
      onComplete,
      revealId,
    ]);

  const duration = getRouteDuration(
    destination.route,
    destination.transport,
    "preview",
  );

  return (
    <AnimatedRoute
      route={destination.route}
      transport={
        destination.transport
      }
      duration={duration}
      casingOpacity={
        mapStyle.route
          .previewCasingOpacity
      }
      routeOpacity={
        mapStyle.route.previewOpacity
      }
      onComplete={finishRoute}
    />
  );
}

type SelectedRouteProps = {
  destination: GeneratedDestination;
  onComplete: (
    destinationId: string,
  ) => void;
};

function SelectedRoute({
  destination,
  onComplete,
}: SelectedRouteProps) {
  const finishRoute =
    useCallback(() => {
      onComplete(destination.id);
    }, [
      destination.id,
      onComplete,
    ]);

  const duration = getRouteDuration(
    destination.route,
    destination.transport,
    "selection",
  );

  return (
    <AnimatedRoute
      route={destination.route}
      transport={
        destination.transport
      }
      duration={duration}
      casingOpacity={
        mapStyle.route
          .selectedCasingOpacity
      }
      routeOpacity={
        mapStyle.route.selectedOpacity
      }
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
  const transportStyle =
    getTransportRouteStyle(
      destination.transport,
    );

  return (
    <>
      <Polyline
        positions={destination.route}
        interactive={false}
        pathOptions={{
          color:
            mapStyle.route.casingColor,

          weight:
            mapStyle.route.casingWidth,

          opacity:
            mapStyle.route
              .completedCasingOpacity,

          dashArray:
            transportStyle.dashArray,

          lineCap:
            transportStyle.lineCap,

          lineJoin: "round",
        }}
      />

      <Polyline
        positions={destination.route}
        interactive={false}
        pathOptions={{
          color: transportStyle.color,

          weight:
            mapStyle.route.lineWidth,

          opacity:
            mapStyle.route
              .completedOpacity,

          dashArray:
            transportStyle.dashArray,

          lineCap:
            transportStyle.lineCap,

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
    useState<TripState>(
      initialTripState,
    );

  const [
    sliderDistanceKm,
    setSliderDistanceKm,
  ] = useState(
    defaultExploreDistanceKm,
  );

  const [
    targetDistanceKm,
    setTargetDistanceKm,
  ] = useState(
    defaultExploreDistanceKm,
  );

  const [
    showEndTripSummary,
    setShowEndTripSummary,
  ] = useState(false);

  const [
    tripFinished,
    setTripFinished,
  ] = useState(false);

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

  const previousCityId =
    useMemo(() => {
      if (
        tripState.stops.length === 0
      ) {
        return undefined;
      }

      if (
        tripState.stops.length === 1
      ) {
        return startingCityId;
      }

      return tripState.stops[
        tripState.stops.length - 2
      ].cityId;
    }, [tripState.stops]);

  const currentDestinations =
    useMemo(
      () =>
        getGeneratedDestinations(
          currentOriginId,
          undefined,
          visitedCityIds,
          previousCityId,
          targetDistanceKm,
        ),
      [
        currentOriginId,
        previousCityId,
        targetDistanceKm,
        visitedCityIds,
      ],
    );

  const selectedDestination =
    currentDestinations.find(
      (destination) =>
        destination.id ===
        tripState
          .selectedDestinationId,
    );

  const selectedArrived =
    selectedDestination !==
      undefined &&
    tripState.arrivedDestinationId ===
      selectedDestination.id;

  const selectedDuration =
    selectedDestination !== undefined
      ? getRouteDuration(
          selectedDestination.route,
          selectedDestination
            .transport,
          "selection",
        )
      : 0;

  const completedLegs =
    useMemo<CompletedLeg[]>(() => {
      const legs: CompletedLeg[] =
        [];

      let originId =
        startingCityId;

      for (
        const stop of tripState.stops
      ) {
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

  const itineraryLegs =
    useMemo<ItineraryPanelLeg[]>(
      () =>
        completedLegs.map(
          (leg) => ({
            cityId:
              leg.destination.id,

            cityName:
              leg.destination.name,

            days: leg.days,

            transport:
              leg.destination
                .transport,

            estimatedPriceEur:
              leg.destination
                .estimatedPriceEur,
          }),
        ),
      [completedLegs],
    );

  const showDestination =
    useCallback(
      (revealId: string) => {
        setVisibleRouteIds(
          (currentIds) => {
            if (
              currentIds.includes(
                revealId,
              )
            ) {
              return currentIds;
            }

            return [
              ...currentIds,
              revealId,
            ];
          },
        );
      },
      [],
    );

  const selectDestination =
    useCallback(
      (destinationId: string) => {
        setTripState(
          (currentState) => ({
            ...currentState,

            selectedDestinationId:
              destinationId,

            arrivedDestinationId:
              null,
          }),
        );
      },
      [],
    );

  const finishDestinationSelection =
    useCallback(
      (
        destinationId: string,
      ) => {
        setTripState(
          (currentState) => ({
            ...currentState,

            arrivedDestinationId:
              destinationId,
          }),
        );
      },
      [],
    );

  const confirmStay =
    useCallback(
      (
        destination:
          GeneratedDestination,

        days: number,
      ) => {
        setTripState(
          (currentState) => ({
            currentCityId:
              destination.id,

            selectedDestinationId:
              null,

            arrivedDestinationId:
              null,

            stops: [
              ...currentState.stops,

              {
                cityId:
                  destination.id,

                cityName:
                  destination.name,

                days,
              },
            ],
          }),
        );
      },
      [],
    );

  const openEndTripSummary =
    useCallback(() => {
      if (
        tripState.stops.length === 0
      ) {
        return;
      }

      setTripFinished(false);
      setShowEndTripSummary(true);
    }, [tripState.stops.length]);

  const keepExploring =
    useCallback(() => {
      setShowEndTripSummary(false);
      setTripFinished(false);
    }, []);

  const finishTrip =
    useCallback(() => {
      setTripFinished(true);
    }, []);

  const startNewTrip =
    useCallback(() => {
      setTripState({
        currentCityId:
          startingCityId,

        selectedDestinationId:
          null,

        arrivedDestinationId:
          null,

        stops: [],
      });

      setVisibleRouteIds([]);

      setSliderDistanceKm(
        defaultExploreDistanceKm,
      );

      setTargetDistanceKm(
        defaultExploreDistanceKm,
      );

      setTripFinished(false);
      setShowEndTripSummary(false);
    }, []);

  const undoLastStop =
    useCallback(() => {
      setTripState(
        (currentState) => {
          if (
            currentState.stops
              .length === 0
          ) {
            return currentState;
          }

          const updatedStops =
            currentState.stops.slice(
              0,
              -1,
            );

          const previousCityId =
            updatedStops.length === 0
              ? startingCityId
              : updatedStops[
                  updatedStops.length -
                    1
                ].cityId;

          return {
            currentCityId:
              previousCityId,

            selectedDestinationId:
              null,

            arrivedDestinationId:
              null,

            stops: updatedStops,
          };
        },
      );

      setVisibleRouteIds([]);
      setShowEndTripSummary(false);
      setTripFinished(false);
    }, []);

  const showBarcelonaLabel =
    currentOriginId ===
      startingCityId &&
    selectedDestination ===
      undefined;

  const startingCityName =
    getCityById(startingCityId)
      ?.name ?? "Barcelona";

  const canEndTrip =
    itineraryLegs.length > 0 &&
    selectedDestination ===
      undefined &&
    !showEndTripSummary;

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
        zoom={6.2}
        minZoom={3.5}
        maxZoom={10}
        zoomSnap={0.1}
        zoomDelta={0.2}
        zoomAnimation
        fadeAnimation
        markerZoomAnimation
        zoomAnimationThreshold={10}
        wheelPxPerZoomLevel={1200}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          updateWhenZooming={false}
          updateWhenIdle
          keepBuffer={6}
        />

        <ExploreZoomController
          cityId={currentOriginId}
          distanceKm={
            sliderDistanceKm
          }
          enabled={
            selectedDestination ===
              undefined &&
            !showEndTripSummary
          }
        />

        <Pane
          name="route-lines"
          style={{
            zIndex: 350,
          }}
        >
          {completedLegs.map(
            (leg, index) => (
              <StaticRoute
                key={`completed-${leg.originId}-${leg.destination.id}-${index}`}
                destination={
                  leg.destination
                }
              />
            ),
          )}

          {currentDestinations.map(
            (destination) => {
              const revealId =
                getRevealId(
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
                    destination={
                      destination
                    }
                    revealId={
                      revealId
                    }
                    onComplete={
                      showDestination
                    }
                  />
                );
              }

              return (
                <AnimatedRoute
                  key={`retract-${revealId}`}
                  route={
                    destination.route
                  }
                  transport={
                    destination.transport
                  }
                  duration={getRouteDuration(
                    destination.route,
                    destination.transport,
                    "retraction",
                  )}
                  casingOpacity={
                    mapStyle.route
                      .previewCasingOpacity
                  }
                  routeOpacity={
                    mapStyle.route
                      .previewOpacity
                  }
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
              duration={
                selectedDuration
              }
            />
          )}

        <Marker
          position={
            getCityById(
              startingCityId,
            )?.position ?? [
              41.38879,
              2.15899,
            ]
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
                  leg.destination
                    .position
                }
                name={
                  leg.destination.name
                }
                price={
                  leg.destination.price
                }
                selected={false}
                arrived
                stayDays={leg.days}
                showLabel={showLabel}
                labelPosition={getLabelPosition(
                  leg.originId,
                  leg.destination
                    .position,
                )}
                onSelect={() => {}}
              />
            );
          },
        )}

        {currentDestinations.map(
          (destination) => {
            const revealId =
              getRevealId(
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
                name={
                  destination.name
                }
                price={
                  destination.price
                }
                selected={
                  isSelected
                }
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

      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "80px",
          zIndex: 1000,

          width: "310px",
          maxWidth:
            "calc(100vw - 104px)",
        }}
      >
        <ItineraryPanel
          startingCityName={
            startingCityName
          }
          legs={itineraryLegs}
        />

        {canEndTrip && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              type="button"
              onClick={undoLastStop}
              style={{
                appearance: "none",

                flex: 1,
                boxSizing:
                  "border-box",

                padding:
                  "14px 14px",

                border:
                  "1px solid rgba(36, 50, 74, 0.14)",

                borderRadius:
                  "14px",

                background:
                  "rgba(255, 255, 255, 0.96)",

                boxShadow:
                  "0 8px 22px rgba(36, 50, 74, 0.14)",

                fontFamily:
                  mapStyle.typography
                    .family,

                fontSize: "14px",

                fontWeight:
                  mapStyle.typography
                    .labelWeight,

                lineHeight: 1.2,

                color:
                  mapStyle.colors.ink,

                cursor: "pointer",
              }}
            >
              Undo last stop
            </button>

            <button
              type="button"
              onClick={
                openEndTripSummary
              }
              style={{
                appearance: "none",

                flex: 1,
                boxSizing:
                  "border-box",

                padding:
                  "14px 14px",

                border: "none",

                borderRadius:
                  "14px",

                background:
                  mapStyle.colors.ink,

                boxShadow:
                  "0 10px 28px rgba(36, 50, 74, 0.2)",

                fontFamily:
                  mapStyle.typography
                    .family,

                fontSize: "14px",

                fontWeight:
                  mapStyle.typography
                    .labelWeight,

                lineHeight: 1.2,

                color:
                  mapStyle.colors.white,

                cursor: "pointer",
              }}
            >
              End trip
            </button>
          </div>
        )}
      </div>

      {selectedDestination ===
        undefined &&
        !showEndTripSummary && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "24px",
              zIndex: 1000,

              transform:
                "translateX(-50%)",
            }}
          >
            <ExploreDistanceSlider
              value={
                sliderDistanceKm
              }
              minimum={
                minimumExploreDistanceKm
              }
              maximum={
                maximumExploreDistanceKm
              }
              onChange={
                setSliderDistanceKm
              }
              onCommit={
                setTargetDistanceKm
              }
            />
          </div>
        )}

      {selectedDestination &&
        selectedArrived &&
        !showEndTripSummary && (
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

      {showEndTripSummary && (
        <EndTripSummary
          startingCityName={
            startingCityName
          }
          legs={itineraryLegs}
          finished={tripFinished}
          onKeepExploring={
            keepExploring
          }
          onFinishTrip={
            finishTrip
          }
          onStartNewTrip={
            startNewTrip
          }
        />
      )}
    </div>
  );
}

export default Map;