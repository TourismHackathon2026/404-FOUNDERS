import { useState, useEffect } from "react";
import axios from "axios";
import MapView from "./components/MapView";
import DestinationPicker from "./components/DestinationPicker";
import JourneyCard from "./components/JourneyCard";
import useUserLocation from "./hooks/useUserLocation";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function App() {
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { location, loading: locLoading, getLocation } = useUserLocation();

  // Load destinations on mount
  useEffect(() => {
    axios
      .get(`${API}/destinations`)
      .then((res) => setDestinations(res.data.destinations))
      .catch((err) => console.error(err));
  }, []);

  // Auto-fetch route when both location and destination are ready
  useEffect(() => {
    if (location && selectedDest) {
      fetchRoute();
    }
  }, [location, selectedDest]);

  const fetchRoute = async () => {
    if (!location || !selectedDest) return;

    setLoading(true);
    setError(null);
    setRouteData(null);

    try {
      const res = await axios.post(`${API}/route/find`, {
        userLat: location.lat,
        userLng: location.lng,
        destLat: selectedDest.lat,
        destLng: selectedDest.lng,
        destName: selectedDest.name,
      });

      // Attach destination coords and name for map use
      setRouteData({
        ...res.data,
        destination_coords: { lat: selectedDest.lat, lng: selectedDest.lng },
        destination: {
          ...res.data.destination,
          name: selectedDest.name,
        },
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "No direct bus route found for this destination. Try another.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDestSelect = (dest) => {
    setSelectedDest(dest);
    setRouteData(null);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "22px" }}>🚌</span>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
            Nepal Bus Guide
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            Local buses for tourists — Bagmati Province
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: "40vh", position: "relative" }}>
        <MapView routeData={routeData} userLocation={location} />

        {/* Map legend */}
        {routeData && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "11px",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
            }}
          >
            <span>🟢 - - - Walking</span>
            <span>🔵 ——— Bus route</span>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          maxWidth: "600px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Location button */}
        {!location ? (
          <button
            onClick={getLocation}
            disabled={locLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: locLoading ? "#93c5fd" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "16px",
              transition: "background 0.2s",
            }}
          >
            {locLoading ? "Getting your location..." : "📍 Use My Location"}
          </button>
        ) : (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#15803d",
              marginBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>📍 Location detected</span>
            <button
              onClick={() => {
                getLocation();
              }}
              style={{
                fontSize: "12px",
                color: "#15803d",
                background: "none",
                border: "none",
                textDecoration: "underline",
              }}
            >
              Refresh
            </button>
          </div>
        )}

        {/* Destination picker */}
        <DestinationPicker
          destinations={destinations}
          selected={selectedDest}
          onSelect={handleDestSelect}
        />

        {/* Loading state */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            🔍 Finding best bus route...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#dc2626",
              fontSize: "13px",
              marginTop: "12px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Journey result */}
        {routeData && !loading && <JourneyCard routeData={routeData} />}

        {/* Prompt if location set but no destination */}
        {location && !selectedDest && !loading && (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "13px",
              padding: "20px 0",
            }}
          >
            Select a destination above to find your bus route
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
