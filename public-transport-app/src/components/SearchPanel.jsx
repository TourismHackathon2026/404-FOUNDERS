export default function SearchPanel({
  source,
  setSource,
  destination,
  setDestination,
  findRoute
}) {
  return (
    <div style={{
      position: "absolute",
      top: 20,
      left: 20,
      right: 20,
      background: "white",
      padding: 12,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
    }}>

      <input
        placeholder="Source (e.g. Thamel)"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <input
        placeholder="Destination (e.g. Kalanki)"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />

      <button
        onClick={findRoute}
        style={{
          width: "100%",
          padding: 10,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8
        }}
      >
        Find Route
      </button>

    </div>
  );
}