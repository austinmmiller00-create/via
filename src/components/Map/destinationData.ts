import {
  barcelonaToValenciaRoute,
  barcelonaToZaragozaRoute,
  valenciaPosition,
  zaragozaPosition,
} from "./routeData";
import type { RoutePoint } from "./routeData";

export type Destination = {
  id: string;
  name: string;
  price: string;
  position: RoutePoint;
  route: RoutePoint[];
  active: boolean;
};

export const barcelonaDestinations: Destination[] = [
  {
    id: "valencia",
    name: "Valencia",
    price: "€25",
    position: valenciaPosition,
    route: barcelonaToValenciaRoute,
    active: true,
  },
  {
    id: "zaragoza",
    name: "Zaragoza",
    price: "€30",
    position: zaragozaPosition,
    route: barcelonaToZaragozaRoute,
    active: false,
  },
];