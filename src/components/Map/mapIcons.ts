import L from "leaflet";

function createBarcelonaIcon(showLabel: boolean) {
  return L.divIcon({
    className: "via-barcelona-icon",
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        ${
          showLabel
            ? `
              <span style="
                font-family: Manrope, sans-serif;
                font-size: 42px;
                font-weight: 800;
                letter-spacing: -2px;
                line-height: 1;
                color: #24324A;

                text-shadow:
                  0 2px 0 white,
                  0 0 10px white,
                  0 4px 10px rgba(36,50,74,0.2);

                margin-bottom: 14px;
              ">
                Barcelona
              </span>
            `
            : ""
        }

        <span style="
          display: block;
          box-sizing: border-box;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #E76F51;
          border: 8px solid white;

          box-shadow:
            0 6px 16px rgba(0,0,0,0.24),
            0 0 0 3px rgba(231,111,81,0.2);
        "></span>
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