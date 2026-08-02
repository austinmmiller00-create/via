import L from "leaflet";

export const barcelonaIcon = L.divIcon({
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

export const valenciaIcon = L.divIcon({
  className: "",
  html: `
    <style>
      @keyframes valenciaFadeIn {
        from {
          opacity: 0;
          transform: translate(-50%, -42%);
        }

        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
    </style>

    <div style="
      position: relative;
      width: 106px;
      height: 106px;
      opacity: 0;
      animation: valenciaFadeIn 700ms ease-out forwards;
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