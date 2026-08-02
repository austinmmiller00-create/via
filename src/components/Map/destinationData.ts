import {
  alicantePosition,
  barcelonaToMadridRoute,
  barcelonaToMontpellierRoute,
  barcelonaToPalmaRoute,
  barcelonaToValenciaRoute,
  barcelonaToZaragozaRoute,
  madridPosition,
  montpellierPosition,
  palmaPosition,
  valenciaPosition,
  valenciaToAlicanteRoute,
  valenciaToMadridRoute,
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
  transport: "train" | "plane";
};

export const barcelonaDestinations: Destination[] = [
  {
    id: "valencia",
    name: "Valencia",
    price: "€25",
    position: valenciaPosition,
    route: barcelonaToValenciaRoute,
    active: true,
    transport: "train",
  },
  {
    id: "zaragoza",
    name: "Zaragoza",
    price: "€30",
    position: zaragozaPosition,
    route: barcelonaToZaragozaRoute,
    active: false,
    transport: "train",
  },
  {
    id: "madrid",
    name: "Madrid",
    price: "€45",
    position: madridPosition,
    route: barcelonaToMadridRoute,
    active: false,
    transport: "train",
  },
  {
    id: "montpellier",
    name: "Montpellier",
    price: "€38",
    position: montpellierPosition,
    route: barcelonaToMontpellierRoute,
    active: false,
    transport: "train",
  },
  {
    id: "palma",
    name: "Palma",
    price: "€35",
    position: palmaPosition,
    route: barcelonaToPalmaRoute,
    active: false,
    transport: "plane",
  },
];

export const valenciaDestinations: Destination[] = [
  {
    id: "alicante",
    name: "Alicante",
    price: "€18",
    position: alicantePosition,
    route: valenciaToAlicanteRoute,
    active: true,
    transport: "train",
  },
  {
    id: "madrid",
    name: "Madrid",
    price: "€32",
    position: madridPosition,
    route: valenciaToMadridRoute,
    active: true,
    transport: "train",
  },
];