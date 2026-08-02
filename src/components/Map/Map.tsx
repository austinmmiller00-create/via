import { useCallback, useState } from "react";
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
import { barcelonaIcon } from "./mapIcons";
import {
  barcelonaPosition,
  barcelonaToValenciaRoute,
  valenciaPosition,
} from "./routeData";

const selectionDuration = 3000;

function Map() {
  const [showValencia, setShowValencia] =
    useState(false);

  const [valenciaSelected, setValenciaSelected] =
    useState(false);

  const finishPreviewAnimation = useCallback(() => {
    setShowValencia(true);
  }, []);

  const selectValencia = useCallback(() => {
    setValenciaSelected(true);
  }, []);

  return (
    <MapContainer
      center={[40.45, 0.9]}
      zoom={8}
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
          route={barcelonaToValenciaRoute}
          duration={4000}
          casingOpacity={0.45}
          routeOpacity={0.4}
          onComplete={finishPreviewAnimation}
        />

        {valenciaSelected && (
          <AnimatedRoute
            route={barcelonaToValenciaRoute}
            duration={selectionDuration}
            casingOpacity={0.95}
            routeOpacity={0.98}
          />
        )}
      </Pane>

      {valenciaSelected && (
        <RouteCamera
          route={barcelonaToValenciaRoute}
          duration={selectionDuration}
        />
      )}

      <Marker
        position={barcelonaPosition}
        icon={barcelonaIcon}
        interactive={false}
      />

      {showValencia && (
        <DestinationMarker
          position={valenciaPosition}
          name="Valencia"
          price="€25"
          selected={valenciaSelected}
          onSelect={selectValencia}
        />
      )}
    </MapContainer>
  );
}

export default Map;