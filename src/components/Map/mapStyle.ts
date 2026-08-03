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

    labelLineHeight: 1,
    priceLineHeight: 1,
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
    labelGap: 14,

    backgroundColor: "#E76F51",
    borderColor: "#FFFFFF",
    labelColor: "#24324A",

    circleShadow:
      "0 5px 13px rgba(0,0,0,0.22), 0 0 0 2px rgba(231,111,81,0.18)",

    labelTextShadow:
      "0 2px 0 white, 0 0 8px white, 0 3px 8px rgba(36,50,74,0.18)",

    zIndex: 1200,
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
    minimumPriceSize: 12,
    labelSize: 30,
    staySize: 14,

    labelGap: 18,
    labelWidth: 220,

    canvasWidth: 540,
    canvasHeight: 240,

    backgroundColor: "#FFFFFF",
    selectedBackgroundColor: "#FFF8F5",
    arrivedBackgroundColor: "#E76F51",

    borderColor: "#E76F51",
    outerBorderColor: "#FFFFFF",

    textColor: "#24324A",
    arrivedTextColor: "#FFFFFF",
    labelColor: "#24324A",

    priceTextShadow:
      "0 2px 0 rgba(255,255,255,1), 0 3px 7px rgba(36,50,74,0.16)",

    arrivedTextShadow:
      "0 2px 5px rgba(36,50,74,0.25)",

    labelTextShadow:
      "0 2px 0 white, 0 0 8px white, 0 3px 8px rgba(36,50,74,0.18)",

    selectedZIndex: 1000,
    hoveredZIndex: 500,
    arrivedZIndex: -100,
    defaultZIndex: 0,
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
    width: 290,
    padding: 22,
    borderRadius: 22,

    backgroundColor:
      "rgba(255, 255, 255, 0.96)",

    textColor: "#24324A",
    secondaryTextColor: "#5B6577",

    accentColor: "#E76F51",
    accentTextColor: "#FFFFFF",

    counterBackgroundColor: "#F2F4F7",
    stepButtonBackgroundColor: "#FFFFFF",

    shadow:
      "0 18px 45px rgba(36, 50, 74, 0.22)",

    backdropBlur: 12,

    eyebrowSize: 15,
    eyebrowOpacity: 0.65,
    eyebrowMarginBottom: 6,

    citySize: 28,
    cityLetterSpacing: "-1px",
    cityMarginBottom: 18,

    questionSize: 16,
    questionMarginBottom: 12,

    counterPadding: 8,
    counterBorderRadius: 16,
    counterMarginBottom: 18,

    stepButtonSize: 44,
    stepButtonBorderRadius: 12,
    stepButtonFontSize: 25,

    dayNumberSize: 25,
    dayUnitSize: 15,
    dayUnitMarginLeft: 6,
    dayUnitOpacity: 0.65,

    confirmPaddingVertical: 14,
    confirmPaddingHorizontal: 18,
    confirmBorderRadius: 14,
    confirmFontSize: 16,
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