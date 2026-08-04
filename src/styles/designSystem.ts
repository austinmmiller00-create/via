import type { CSSProperties } from "react";

/*
  VIA DESIGN SYSTEM

  Change the values in this file to update the overall
  appearance of the app. Components should gradually use
  these values instead of repeating their own styles.
*/

export const designSystem = {
  colours: {
    /*
      Brand
    */

    accent: "#E76F51",
    accentHover: "#D95F42",
    accentSoft: "rgba(231, 111, 81, 0.12)",
    accentMuted: "rgba(231, 111, 81, 0.3)",

    /*
      Text
    */

    ink: "#24324A",
    mutedInk: "#687386",
    faintInk: "#929BAA",
    invertedText: "#FFFFFF",

    /*
      Surfaces
    */

    page: "#EEF1F4",
    surface: "#FFFFFF",
    surfaceSoft: "#F7F8FA",
    surfaceMuted: "#F2F4F7",
    surfaceDisabled: "#E9EDF2",

    /*
      Borders
    */

    border: "rgba(36, 50, 74, 0.14)",
    borderSoft: "rgba(36, 50, 74, 0.1)",
    borderStrong: "rgba(36, 50, 74, 0.2)",

    /*
      Overlays
    */

    backdrop: "rgba(36, 50, 74, 0.35)",
    whiteTransparent:
      "rgba(255, 255, 255, 0.96)",
    whiteNearlySolid:
      "rgba(255, 255, 255, 0.98)",

    /*
      Feedback
    */

    success: "#3A9D72",
    successSoft: "rgba(58, 157, 114, 0.12)",

    warning: "#D99A35",
    warningSoft: "rgba(217, 154, 53, 0.12)",

    danger: "#C85656",
    dangerSoft: "rgba(200, 86, 86, 0.12)",
  },

  typography: {
    family: '"Manrope", sans-serif',

    weights: {
      regular: 500,
      semibold: 700,
      bold: 800,
    },

    sizes: {
      caption: "12px",
      small: "13px",
      body: "14px",
      bodyLarge: "15px",
      headingSmall: "17px",
      headingMedium: "21px",
      headingLarge: "28px",
      display: "29px",
    },

    lineHeights: {
      compact: 1.08,
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.5,
    },

    letterSpacing: {
      heading: "-1px",
      display: "-1.2px",
    },
  },

  spacing: {
    none: "0px",
    tiny: "4px",
    xs: "6px",
    small: "8px",
    medium: "10px",
    regular: "12px",
    large: "14px",
    xl: "16px",
    xxl: "18px",
    section: "22px",
    panel: "24px",
    modal: "26px",
    page: "32px",
  },

  radii: {
    small: "9px",
    input: "11px",
    button: "14px",
    card: "17px",
    panel: "20px",
    modal: "24px",
    round: "999px",
    circle: "50%",
  },

  shadows: {
    subtle:
      "0 4px 14px rgba(36, 50, 74, 0.1)",

    card:
      "0 8px 22px rgba(36, 50, 74, 0.14)",

    raised:
      "0 10px 28px rgba(36, 50, 74, 0.2)",

    modal:
      "0 24px 70px rgba(36, 50, 74, 0.3)",
  },

  motion: {
    fast: "140ms ease",
    standard: "220ms ease",
    slow: "360ms ease",
  },

  layout: {
    controlHeight: "46px",
    panelWidth: "310px",
    savedTripsWidth: "460px",
    summaryWidth: "430px",
    pageInset: "24px",
  },

  zIndex: {
    mapRoutes: 350,
    controls: 1000,
    modal: 2000,
    modalAbove: 2100,
  },
} as const;

/*
  Reusable component foundations

  These can be spread into component style props:

  style={{
    ...componentStyles.buttonBase,
    ...componentStyles.buttonPrimary,
  }}
*/

const buttonBase: CSSProperties = {
  appearance: "none",
  boxSizing: "border-box",

  padding: "14px 18px",

  borderRadius:
    designSystem.radii.button,

  fontFamily:
    designSystem.typography.family,

  fontSize:
    designSystem.typography.sizes.body,

  fontWeight:
    designSystem.typography.weights
      .semibold,

  lineHeight:
    designSystem.typography.lineHeights
      .tight,

  cursor: "pointer",

  transition: [
    `background ${designSystem.motion.fast}`,
    `border-color ${designSystem.motion.fast}`,
    `opacity ${designSystem.motion.fast}`,
    `transform ${designSystem.motion.fast}`,
  ].join(", "),
};

export const componentStyles = {
  buttonBase,

  buttonPrimary: {
    border: "none",

    background:
      designSystem.colours.accent,

    color:
      designSystem.colours.invertedText,

    boxShadow:
      designSystem.shadows.raised,
  } satisfies CSSProperties,

  buttonDark: {
    border: "none",

    background:
      designSystem.colours.ink,

    color:
      designSystem.colours.invertedText,

    boxShadow:
      designSystem.shadows.raised,
  } satisfies CSSProperties,

  buttonSecondary: {
    border: `1px solid ${designSystem.colours.border}`,

    background:
      designSystem.colours.surfaceMuted,

    color: designSystem.colours.ink,
  } satisfies CSSProperties,

  buttonSurface: {
    border: `1px solid ${designSystem.colours.border}`,

    background:
      designSystem.colours.whiteTransparent,

    color: designSystem.colours.ink,

    boxShadow:
      designSystem.shadows.card,
  } satisfies CSSProperties,

  input: {
    width: "100%",
    boxSizing: "border-box",

    padding: "12px 13px",

    border: `1px solid ${designSystem.colours.border}`,

    borderRadius:
      designSystem.radii.input,

    outline: "none",

    background:
      designSystem.colours.surface,

    fontFamily:
      designSystem.typography.family,

    fontSize:
      designSystem.typography.sizes.body,

    fontWeight:
      designSystem.typography.weights
        .regular,

    color: designSystem.colours.ink,

    transition: [
      `border-color ${designSystem.motion.fast}`,
      `box-shadow ${designSystem.motion.fast}`,
    ].join(", "),
  } satisfies CSSProperties,

  panel: {
    boxSizing: "border-box",

    border: `1px solid ${designSystem.colours.borderSoft}`,

    borderRadius:
      designSystem.radii.panel,

    background:
      designSystem.colours.whiteTransparent,

    boxShadow:
      designSystem.shadows.card,

    fontFamily:
      designSystem.typography.family,

    color: designSystem.colours.ink,
  } satisfies CSSProperties,

  modalBackdrop: {
    position: "absolute",
    inset: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    boxSizing: "border-box",
    padding: designSystem.spacing.panel,

    background:
      designSystem.colours.backdrop,

    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
  } satisfies CSSProperties,

  modal: {
    maxWidth: "100%",
    maxHeight: "calc(100vh - 48px)",

    boxSizing: "border-box",
    overflowY: "auto",

    padding: designSystem.spacing.modal,

    borderRadius:
      designSystem.radii.modal,

    background:
      designSystem.colours
        .whiteNearlySolid,

    boxShadow:
      designSystem.shadows.modal,

    fontFamily:
      designSystem.typography.family,

    color: designSystem.colours.ink,
  } satisfies CSSProperties,

  card: {
    boxSizing: "border-box",

    padding: designSystem.spacing.xl,

    border: `1px solid ${designSystem.colours.borderSoft}`,

    borderRadius:
      designSystem.radii.card,

    background:
      designSystem.colours.surfaceSoft,
  } satisfies CSSProperties,

  pill: {
    display: "inline-flex",
    alignItems: "center",

    padding: "6px 9px",

    borderRadius:
      designSystem.radii.round,

    background:
      designSystem.colours.accentSoft,

    fontFamily:
      designSystem.typography.family,

    fontSize:
      designSystem.typography.sizes
        .caption,

    fontWeight:
      designSystem.typography.weights
        .semibold,

    color:
      designSystem.colours.accent,
  } satisfies CSSProperties,
} as const;