import { useState } from "react";

type StayLengthCardProps = {
  cityName: string;
  initialDays?: number;
  onConfirm: (days: number) => void;
};

function StayLengthCard({
  cityName,
  initialDays = 3,
  onConfirm,
}: StayLengthCardProps) {
  const [days, setDays] = useState(initialDays);

  const decreaseDays = () => {
    setDays((currentDays) =>
      Math.max(1, currentDays - 1),
    );
  };

  const increaseDays = () => {
    setDays((currentDays) =>
      Math.min(14, currentDays + 1),
    );
  };

  return (
    <div
      style={{
        width: "290px",
        padding: "22px",
        borderRadius: "22px",
        background: "rgba(255, 255, 255, 0.96)",
        boxShadow:
          "0 18px 45px rgba(36, 50, 74, 0.22)",
        fontFamily: "Manrope, sans-serif",
        color: "#24324A",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          marginBottom: "6px",
          fontSize: "15px",
          fontWeight: 700,
          opacity: 0.65,
        }}
      >
        You’ve arrived in
      </div>

      <div
        style={{
          marginBottom: "18px",
          fontSize: "28px",
          fontWeight: 800,
          letterSpacing: "-1px",
        }}
      >
        {cityName}
      </div>

      <div
        style={{
          marginBottom: "12px",
          fontSize: "16px",
          fontWeight: 700,
        }}
      >
        How long are you staying?
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
          padding: "8px",
          borderRadius: "16px",
          background: "#F2F4F7",
        }}
      >
        <button
          type="button"
          onClick={decreaseDays}
          aria-label="Decrease stay length"
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "12px",
            background: "#FFFFFF",
            fontSize: "25px",
            fontWeight: 800,
            color: "#24324A",
            cursor: "pointer",
          }}
        >
          −
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "25px",
            fontWeight: 800,
          }}
        >
          {days}
          <span
            style={{
              marginLeft: "6px",
              fontSize: "15px",
              fontWeight: 700,
              opacity: 0.65,
            }}
          >
            {days === 1 ? "day" : "days"}
          </span>
        </div>

        <button
          type="button"
          onClick={increaseDays}
          aria-label="Increase stay length"
          style={{
            width: "44px",
            height: "44px",
            border: "none",
            borderRadius: "12px",
            background: "#FFFFFF",
            fontSize: "25px",
            fontWeight: 800,
            color: "#24324A",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => onConfirm(days)}
        style={{
          width: "100%",
          padding: "14px 18px",
          border: "none",
          borderRadius: "14px",
          background: "#E76F51",
          fontFamily: "Manrope, sans-serif",
          fontSize: "16px",
          fontWeight: 800,
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        Continue exploring
      </button>
    </div>
  );
}

export default StayLengthCard;