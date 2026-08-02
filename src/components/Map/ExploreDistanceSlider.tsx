type ExploreDistanceSliderProps = {
  value: number;
  minimum?: number;
  maximum?: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
};

function ExploreDistanceSlider({
  value,
  minimum = 100,
  maximum = 1500,
  onChange,
  onCommit,
}: ExploreDistanceSliderProps) {
  function readValue(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    return Number(event.target.value);
  }

  return (
    <div
      style={{
        width: "min(420px, calc(100vw - 48px))",
        padding: "16px 20px 14px",
        borderRadius: "18px",
        background: "rgba(255, 255, 255, 0.94)",
        boxShadow:
          "0 10px 30px rgba(36, 50, 74, 0.18)",
        backdropFilter: "blur(12px)",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: "#24324A",
          }}
        >
          Explore further
        </span>

        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#5B6577",
          }}
        >
          {Math.round(value)} km
        </span>
      </div>

      <input
        type="range"
        min={minimum}
        max={maximum}
        step={25}
        value={value}
        aria-label="Explore distance"
        onChange={(event) =>
          onChange(readValue(event))
        }
        onPointerUp={(event) =>
          onCommit(
            Number(event.currentTarget.value),
          )
        }
        onTouchEnd={(event) =>
          onCommit(
            Number(event.currentTarget.value),
          )
        }
        onKeyUp={(event) => {
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Home" ||
            event.key === "End"
          ) {
            onCommit(
              Number(event.currentTarget.value),
            );
          }
        }}
        style={{
          width: "100%",
          cursor: "pointer",
          accentColor: "#E76F51",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "6px",
          fontSize: "12px",
          fontWeight: 700,
          color: "#7A8495",
        }}
      >
        <span>Near</span>
        <span>Far</span>
      </div>
    </div>
  );
}

export default ExploreDistanceSlider;