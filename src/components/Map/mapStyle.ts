export type TransportVisualStyle = {
  color: string;
  dashArray?: string;
  lineCap: "round" | "butt";
};

export const mapStyle = {
  colors: {
    ink: "#24324A",
    mutedInk: "#5B6577",

    accent: "#E76F51",
    accentSoft: "#FFF8F5",

    white: "#FFFFFF",
    panel: "rgba(255, 255, 255, 0.94)",

    shadow: "rgba(36, 50, 74, 0.18)",
    softShadow: "rgba(36, 50, 74, 0.12)",
  },

  typography: {
    family: "Manrope, sans-serif",

    labelWeight: 800,
    priceWeight: 800,
    interfaceWeight: 700,

    labelLetterSpacing: "-1.5px",
    priceLetterSpacing: "-1px",
  },

  route: {
    casingColor: "#FFFFFF",

    casingWidth: 18,
    lineWidth: 10,

    previewOpacity: 0.4,
    previewCasingOpacity: 0.45,

    selectedOpacity: 0.98,
    selectedCasingOpacity: 0.95,

    completedOpacity: 0.98,
    completedCasingOpacity: 0.95,

    transports: {
      train: {
        color: "#E76F51",
        lineCap: "round",
      },

      bus: {
        color: "#E9A23B",
        dashArray: "16 10",
        lineCap: "round",
      },

      plane: {
        color: "#4C78A8",

        /*
          Very short rounded dashes appear as dots.
        */

        dashArray: "2 18",
        lineCap: "round",
      },

      ferry: {
        color: "#2A9D8F",
        dashArray: "20 12",
        lineCap: "round",
      },
    } satisfies Record<
      "train" | "bus" | "plane" | "ferry",
      TransportVisualStyle
    >,
  },

  origin: {
    circleSize: 46,
    borderWidth: 6,
    labelSize: 30,

    backgroundColor: "#E76F51",
    borderColor: "#FFFFFF",
    textColor: "#24324A",
  },

  destination: {
    radius: 29,
    hoverRadius: 34,
    selectedRadius: 32,
    popRadius: 42,
    arrivedRadius: 17,

    borderWidth: 4,
    outerBorderWidth: 5,

    priceSize: 22,
    labelSize: 30,
    staySize: 14,

    backgroundColor: "#FFFFFF",
    selectedBackgroundColor: "#FFF8F5",
    arrivedBackgroundColor: "#E76F51",

    borderColor: "#E76F51",
    outerBorderColor: "#FFFFFF",

    textColor: "#24324A",
    arrivedTextColor: "#FFFFFF",

    labelGap: 18,
    labelWidth: 220,
  },

  slider: {
    width: 420,

    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,

    borderRadius: 18,

    backgroundColor:
      "rgba(255, 255, 255, 0.94)",

    accentColor: "#E76F51",
    textColor: "#24324A",
    secondaryTextColor: "#5B6577",

    shadow:
      "0 10px 30px rgba(36, 50, 74, 0.18)",
  },

  stayCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    textColor: "#24324A",
    secondaryTextColor: "#5B6577",
    accentColor: "#E76F51",

    shadow:
      "0 12px 34px rgba(36, 50, 74, 0.18)",
  },

  animation: {
    markerFadeDuration: 700,

    markerHoverDuration: 180,
    markerArrivalDuration: 300,

    markerPopOutDuration: 140,
    markerPopReturnDuration: 280,

    exploreCameraDuration: 0.45,
    exploreCameraUpdateGap: 160,
  },
} as const;

export function getTransportRouteStyle(
  transport:
    | "train"
    | "bus"
    | "plane"
    | "ferry",
) {
  return mapStyle.route.transports[
    transport
  ];
}