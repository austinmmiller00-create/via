import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";
import "@fontsource/manrope/700.css";
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
        display: block;
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: #E76F51;
        border: 10px solid white;
        box-shadow:
          0 7px 18px rgba(0,0,0,0.25),
          0 0 0 3px rgba(231,111,81,0.2);
      "></span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

const valenciaIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      position: relative;
      width: 106px;
      height: 106px;
      transform: translate(-50%, -50%);
    ">
      <span style="
        position: absolute;
        right: 126px;
        top: 50%;
        transform: translateY(-50%);

        font-family: Manrope, sans-serif;
        font-size: 46px;
        font-weight: 800;
        letter-spacing: -2px;
        line-height: 1;
        white-space: nowrap;
        color: #24324A;

        text-shadow:
          0 2px 0 rgba(255,255,255,1),
          0 0 10px rgba(255,255,255,1),
          0 4px 10px rgba(36,50,74,0.2);
      ">
        Valencia
      </span>

      <span style="
        box-sizing: border-box;
        position: absolute;
        inset: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 106px;
        height: 106px;
        border-radius: 50%;
        background: #ffffff;
        border: 7px solid #E76F51;

        box-shadow:
          0 6px 18px rgba(0,0,0,0.2),
          0 0 0 3px rgba(255,255,255,0.8);

        font-family: Manrope, sans-serif;
        font-size: 34px;
        font-weight: 800;
        color: #24324A;
      ">
        €25
      </span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Visual approximation of the coastal Barcelona–Valencia rail corridor.
const railRoute: [number, number][] = [
  [41.3874, 2.1686],
  [41.32, 2.05],
  [41.26, 1.93],
  [41.22, 1.72],
  [41.18, 1.52],
  [41.12, 1.25],
  [41.08, 1.08],
  [41.02, 0.92],
  [40.91, 0.82],
  [40.78, 0.72],
  [40.66, 0.61],
  [40.54, 0.48],
  [40.43, 0.36],
  [40.32, 0.26],
  [40.2, 0.15],
  [40.08, 0.03],
  [39.96, -0.08],
  [39.84, -0.16],
  [39.72, -0.23],
  [39.61, -0.3],
  [39.53, -0.34],
  [39.4699, -0.3763],
];

function Map() {
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

      {/* White casing makes the route stand out from the map. */}
        <Polyline
        positions={railRoute}
        pathOptions={{
            color: "#ffffff",
            weight: 34,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
        }}
        />

        <Polyline
        positions={railRoute}
        pathOptions={{
            color: "#E76F51",
            weight: 24,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
        }}
        />

      <Marker
        position={[41.3874, 2.1686]}
        icon={barcelonaIcon}
        interactive={false}
      />

      <Marker
        position={[39.4699, -0.3763]}
        icon={valenciaIcon}
        interactive={false}
      />
    </MapContainer>
  );
}

export default Map;