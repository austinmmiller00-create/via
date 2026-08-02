import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "@fontsource/manrope/800.css";
import "leaflet/dist/leaflet.css";

const barcelonaIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      white-space: nowrap;
      transform: translate(-50%, -100%);
    ">
      <span style="
        font-family: Manrope, sans-serif;
        font-size: 72px;
        font-weight: 800;
        letter-spacing: -4px;
        line-height: 1;
        color: #24324A;
        text-shadow:
          0 2px 0 rgba(255,255,255,1),
          0 0 12px rgba(255,255,255,1),
          0 5px 10px rgba(36,50,74,0.28),
          0 10px 24px rgba(36,50,74,0.18);
        margin-bottom: 20px;
      ">
        Barcelona
      </span>

      <span style="
        position: relative;
        display: block;
        width: 108px;
        height: 96px;
        background: white;
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        filter: drop-shadow(0 8px 14px rgba(0,0,0,0.25));
      ">
        <span style="
          position: absolute;
          left: 12px;
          top: 12px;
          width: 84px;
          height: 74px;
          background: #E76F51;
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        "></span>
      </span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

function Map() {
  return (
    <MapContainer
      center={[41.3874, 2.1686]}
      zoom={9}
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

      <Marker
        position={[41.3874, 2.1686]}
        icon={barcelonaIcon}
        interactive={false}
      />
    </MapContainer>
  );
}

export default Map;