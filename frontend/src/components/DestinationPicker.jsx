function DestinationPicker({ destinations = [], selected, onSelect }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#666",
          display: "block",
          marginBottom: "6px",
        }}
      >
        Where do you want to go?
      </label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        {destinations.length > 0 ? (
          destinations.map((dest, i) => (
            <button
              key={i}
              onClick={() => onSelect(dest)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border:
                  selected?.name === dest.name
                    ? "2px solid #3b82f6"
                    : "1.5px solid #e5e7eb",
                background: selected?.name === dest.name ? "#eff6ff" : "#fff",
                color: selected?.name === dest.name ? "#1d4ed8" : "#374151",
                fontSize: "13px",
                fontWeight: selected?.name === dest.name ? 600 : 400,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {dest.name}
            </button>
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "14px 16px",
              background: "#f3f4f6",
              borderRadius: "10px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            Loading destinations...
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationPicker;
