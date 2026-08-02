import { useCallback, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "leaflet/dist/leaflet.css";

import AnimatedRoute from "./AnimatedRoute";
import { barcelonaIcon, valenciaIcon } from "./mapIcons";
import {
  barcelonaPosition,
  barcelonaToValenciaRoute,
  valenciaPosition,
} from "./routeData";

function Map() {
  const [showValencia, setShowValencia] = useState(false);

  const finishRouteAnimation = useCallback(() => {
    setShowValencia(true);
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
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
      />

      <AnimatedRoute
        route={barcelonaToValenciaRoute}
        duration={4000}
        onComplete={finishRouteAnimation}
      />

      <Marker
        position={barcelonaPosition}
        icon={barcelonaIcon}
        interactive={false}
      />

      {showValencia && (
        <Marker
          position={valenciaPosition}
          icon={valenciaIcon}
          interactive={false}
        />
      )}
    </MapContainer>
  );
}

export default Map;