function JourneyCard({ routeData }) {
  if (!routeData) return null;

  const {
    origin,
    destination,
    journey,
    walkRecommended,
    directDistance_meters,
  } = routeData;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1.5px solid #e5e7eb",
        overflow: "hidden",
        marginTop: "1rem",
      }}
    >
      {/* Walk recommendation banner */}
      {walkRecommended && (
        <div
          style={{
            background: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            padding: "10px 16px",
            fontSize: "13px",
            color: "#15803d",
            fontWeight: 500,
          }}
        >
          🚶 Destination is only {Math.round(directDistance_meters)}m away —
          walking is recommended
        </div>
      )}

      {/* Journey summary row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Stat label="Fare" value={`NPR ${journey.fare_npr}`} color="#1d4ed8" />
        <Stat
          label="Total time"
          value={`${journey.total_minutes} min`}
          color="#7c3aed"
        />
        <Stat
          label="Bus route"
          value={`No. ${journey.route_number}`}
          color="#0891b2"
        />
      </div>

      {/* Step by step instructions */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#9ca3af",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Step by step
        </div>

        <Step
          icon="📍"
          color="#22c55e"
          title="Start from your location"
          detail={`Walk ${origin.walking_meters}m (${origin.walking_minutes} min) to ${origin.nearest_stop.name}`}
        />

        <Divider />

        <Step
          icon="🚌"
          color="#3b82f6"
          title={`Board bus No. ${journey.route_number}`}
          detail={`At ${journey.board_at.name} → towards ${journey.route_name.split("-")[1]?.trim()}`}
        />

        <Divider />

        <Step
          icon="🔔"
          color="#f59e0b"
          title={`Ride for ${journey.bus_minutes} minutes`}
          detail={`Alight at ${journey.alight_at.name}`}
        />

        <Divider />

        <Step
          icon="🏛️"
          color="#ef4444"
          title={`Walk to ${destination.name}`}
          detail={`${destination.walking_meters}m (${destination.walking_minutes} min) from the stop`}
        />
      </div>

      {/* Distance details */}
      <div
        style={{
          borderTop: "1px solid #f3f4f6",
          padding: "10px 16px",
          display: "flex",
          gap: "16px",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        <span>
          🚶 Walk: {origin.walking_meters + destination.walking_meters}m
        </span>
        <span>🚌 Bus: {(journey.bus_distance_meters / 1000).toFixed(1)}km</span>
        <span>💰 Est. fare: NPR {journey.fare_npr}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontSize: "18px", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
        {label}
      </div>
    </div>
  );
}

function Step({ icon, color, title, detail }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "6px 0",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "2px 0 2px 14px",
      }}
    >
      <div
        style={{
          width: "1px",
          height: "16px",
          background: "#e5e7eb",
          marginLeft: "0px",
        }}
      />
    </div>
  );
}

export default JourneyCard;
