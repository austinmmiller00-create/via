import L from "leaflet";
import { mapStyle } from "./mapStyle";

function createBarcelonaIcon(showLabel: boolean) {
  const {
    circleSize,
    borderWidth,
    labelSize,
  } = mapStyle.origin;

  return L.divIcon({
    className: "via-barcelona-icon",
    html: `
      <div style="
        position: relative;
        width: 0;
        height: 0;
        overflow: visible;
      ">
        <span style="
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(-50%, -50%);

          display: block;
          box-sizing: border-box;
          width: ${circleSize}px;
          height: ${circleSize}px;
          border-radius: 50%;

          background: #E76F51;
          border: ${borderWidth}px solid white;

          box-shadow:
            0 5px 13px rgba(0,0,0,0.22),
            0 0 0 2px rgba(231,111,81,0.18);
        "></span>

        ${
          showLabel
            ? `
              <span style="
                position: absolute;
                left: ${circleSize / 2 + 14}px;
                top: 0;
                transform: translateY(-50%);

                font-family: Manrope, sans-serif;
                font-size: ${labelSize}px;
                font-weight: 800;
                letter-spacing: -1.5px;
                line-height: 1;
                white-space: nowrap;
                color: #24324A;

                text-shadow:
                  0 2px 0 white,
                  0 0 8px white,
                  0 3px 8px rgba(36,50,74,0.18);
              ">
                Barcelona
              </span>
            `
            : ""
        }
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export const barcelonaIcon =
  createBarcelonaIcon(true);

export const barcelonaDotIcon =
  createBarcelonaIcon(false);