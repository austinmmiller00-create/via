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
import {
  barcelonaDestinations,
  type Destination,
} from "./destinationData";
import {
  barcelonaDotIcon,
  barcelonaIcon,
} from "./mapIcons";
import { barcelonaPosition } from "./routeData";

const previewDuration = 4000;
const selectionDuration = 3000;
const retractionDuration = 1200;

const valencia = barcelonaDestinations.find(
  (destination) => destination.id === "valencia",
)!;

const previewDestinations =
  barcelonaDestinations.filter(
    (destination) => !destination.active,
  );

type PreviewRouteProps = {
  destination: Destination;
  onComplete: (id: string) => void;
};

function PreviewRoute({
  destination,
  onComplete,
}: PreviewRouteProps) {
  const finishRoute = useCallback(() => {
    onComplete(destination.id);
  }, [destination.id, onComplete]);

  return (
    <AnimatedRoute
      route={destination.route}
      duration={previewDuration}
      casingOpacity={0.45}
      routeOpacity={0.4}
      onComplete={finishRoute}
    />
  );
}

function Map() {
  const [
    visibleDestinationIds,
    setVisibleDestinationIds,
  ] = useState<string[]>([]);

  const [valenciaSelected, setValenciaSelected] =
    useState(false);

  const [valenciaArrived, setValenciaArrived] =
    useState(false);

  const showDestination = useCallback(
    (destinationId: string) => {
      setVisibleDestinationIds((currentIds) => {
        if (currentIds.includes(destinationId)) {
          return currentIds;
        }

        return [...currentIds, destinationId];
      });
    },
    [],
  );

  const selectValencia = useCallback(() => {
    setValenciaSelected(true);
    setValenciaArrived(false);
  }, []);

  const finishSelectionAnimation =
    useCallback(() => {
      setValenciaArrived(true);
    }, []);

  return (
    <MapContainer
      center={[41.25, 0.1]}
      zoom={6.7}
      minZoom={5}
      maxZoom={10}
      zoomSnap={0.1}
      zoomDelta={0.3}
    wheelPxPerZoomLevel={500}
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
            onComplete={showDestination}
        />

        {!valenciaSelected &&
            previewDestinations.map(
                (destination) => (
                <PreviewRoute
                    key={destination.id}
                    destination={destination}
                    onComplete={showDestination}
                />
                ),
            )}

        {valenciaSelected &&
          previewDestinations.map(
            (destination) => (
              <AnimatedRoute
                key={`retract-${destination.id}`}
                route={destination.route}
                duration={retractionDuration}
                casingOpacity={0.45}
                routeOpacity={0.4}
                reverse
              />
            ),
          )}

        {valenciaSelected && (
          <AnimatedRoute
            route={valencia.route}
            duration={selectionDuration}
            casingOpacity={0.95}
            routeOpacity={0.98}
            onComplete={
              finishSelectionAnimation
            }
          />
        )}
      </Pane>

      {valenciaSelected && (
        <RouteCamera
          route={valencia.route}
          duration={selectionDuration}
        />
      )}

      <Marker
        position={barcelonaPosition}
        icon={
          valenciaSelected
            ? barcelonaDotIcon
            : barcelonaIcon
        }
        interactive={false}
      />

      {visibleDestinationIds.includes(
        valencia.id,
      ) && (
        <DestinationMarker
          position={valencia.position}
          name={valencia.name}
          price={valencia.price}
          selected={valenciaSelected}
          arrived={valenciaArrived}
          onSelect={selectValencia}
          labelPosition="below"
        />
      )}

      {!valenciaSelected &&
        previewDestinations.map(
          (destination) =>
            visibleDestinationIds.includes(
              destination.id,
            ) && (
              <PreviewDestinationMarker
                    key={destination.id}
                    position={destination.position}
                    name={destination.name}
                    price={destination.price}
                    labelPosition={
                        destination.id === "palma"
                        ? "below"
                        : destination.id === "zaragoza"
                            ? "above"
                            : destination.id === "madrid"
                            ? "left"
                            : "right"
                    }
                    />
            ),
        )}
    </MapContainer>
  );
}

export default Map;