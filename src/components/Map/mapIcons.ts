import L from "leaflet";

import { mapStyle } from "./mapStyle";

function createOriginIcon(
  label: string,
  showLabel: boolean,
) {
  const originStyle = mapStyle.origin;
  const typography = mapStyle.typography;

  const labelOffset =
    originStyle.circleSize / 2 +
    originStyle.labelGap;

  return L.divIcon({
    className: "via-origin-icon",

    html: `
      <div style="
        position: relative;
        width: 0;
        height: 0;
        overflow: visible;
        z-index: ${originStyle.zIndex};
      ">
        <span style="
          position: absolute;
          left: 0;
          top: 0;

          transform:
            translate(-50%, -50%);

          display: block;
          box-sizing: border-box;

          width:
            ${originStyle.circleSize}px;

          height:
            ${originStyle.circleSize}px;

          border-radius: 50%;

          background:
            ${originStyle.backgroundColor};

          border:
            ${originStyle.borderWidth}px
            solid
            ${originStyle.borderColor};

          box-shadow:
            ${originStyle.circleShadow};
        "></span>

        ${
          showLabel
            ? `
              <span style="
                position: absolute;

                left:
                  ${labelOffset}px;

                top: 0;

                transform:
                  translateY(-50%);

                font-family:
                  ${typography.family};

                font-size:
                  ${originStyle.labelSize}px;

                font-weight:
                  ${typography.labelWeight};

                letter-spacing:
                  ${typography.labelLetterSpacing};

                line-height:
                  ${typography.labelLineHeight};

                white-space: nowrap;

                color:
                  ${originStyle.labelColor};

                text-shadow:
                  ${originStyle.labelTextShadow};
              ">
                ${label}
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
  createOriginIcon("Barcelona", true);

export const barcelonaDotIcon =
  createOriginIcon("Barcelona", false);