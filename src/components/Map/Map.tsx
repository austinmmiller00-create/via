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
import { barcelonaDestinations } from "./destinationData";
import {
  barcelonaDotIcon,
  barcelonaIcon,
} from "./mapIcons";
import { barcelonaPosition } from "./routeData";

const previewDuration = 4000;
const selectionDuration = 3000;
const retractionDuration = 1800;

const valencia = barcelonaDestinations[0];
const zaragoza = barcelonaDestinations[1];

function Map() {
  const [showValencia, setShowValencia] =
    useState(false);

  const [showZaragoza, setShowZaragoza] =
    useState(false);

  const [valenciaSelected, setValenciaSelected] =
    useState(false);

  const [valenciaArrived, setValenciaArrived] =
    useState(false);

  const [
    zaragozaRouteRetracted,
    setZaragozaRouteRetracted,
  ] = useState(false);

  const finishValenciaPreview =
    useCallback(() => {
      setShowValencia(true);
    }, []);

  const finishZaragozaPreview =
    useCallback(() => {
      setShowZaragoza(true);
    }, []);

  const selectValencia = useCallback(() => {
    setValenciaSelected(true);
    setValenciaArrived(false);
    setZaragozaRouteRetracted(false);
  }, []);

  const finishSelectionAnimation =
    useCallback(() => {
      setValenciaArrived(true);
    }, []);

  const finishZaragozaRetraction =
    useCallback(() => {
      setZaragozaRouteRetracted(true);
    }, []);

  return (
    <MapContainer
      center={[40.75, 0.65]}
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
          duration={previewDuration}
          casingOpacity={0.45}
          routeOpacity={0.4}
          onComplete={finishValenciaPreview}
        />

        {!valenciaSelected && (
          <AnimatedRoute
            route={zaragoza.route}
            duration={previewDuration}
            casingOpacity={0.45}
            routeOpacity={0.4}
            onComplete={finishZaragozaPreview}
          />
        )}

        {valenciaSelected &&
          !zaragozaRouteRetracted && (
            <AnimatedRoute
              route={zaragoza.route}
              duration={retractionDuration}
              casingOpacity={0.45}
              routeOpacity={0.4}
              reverse
              onComplete={
                finishZaragozaRetraction
              }
            />
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

      {showZaragoza && !valenciaSelected && (
        <PreviewDestinationMarker
          position={zaragoza.position}
          name={zaragoza.name}
          price={zaragoza.price}
        />
      )}
    </MapContainer>
  );
}

export default Map;