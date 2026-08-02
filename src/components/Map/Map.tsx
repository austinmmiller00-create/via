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
import RouteCamera from "./RouteCamera";
import { barcelonaDestinations } from "./destinationData";
import {
  barcelonaDotIcon,
  barcelonaIcon,
} from "./mapIcons";
import { barcelonaPosition } from "./routeData";

const selectionDuration = 3000;
const valencia = barcelonaDestinations[0];

function Map() {
  const [showValencia, setShowValencia] =
    useState(false);

  const [valenciaSelected, setValenciaSelected] =
    useState(false);

  const [valenciaArrived, setValenciaArrived] =
    useState(false);

  const finishPreviewAnimation = useCallback(() => {
    setShowValencia(true);
  }, []);

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
      center={[40.45, 0.9]}
      zoom={7.2}
      minZoom={5}
      maxZoom={10}
      zoomSnap={0.1}
      zoomDelta={0.1}
      wheelPxPerZoomLevel={2000}
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
        <AnimatedRoute
          route={valencia.route}
          duration={4000}
          casingOpacity={0.45}
          routeOpacity={0.4}
          onComplete={finishPreviewAnimation}
        />

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

      {showValencia && (
        <DestinationMarker
          position={valencia.position}
          name={valencia.name}
          price={valencia.price}
          selected={valenciaSelected}
          arrived={valenciaArrived}
          onSelect={selectValencia}
        />
      )}
    </MapContainer>
  );
}

export default Map;