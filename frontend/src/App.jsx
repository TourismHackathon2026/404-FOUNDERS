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

useEffect(() => {
  if (!location) getLocation();
}, []); 

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
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-brand__icon">🚌</span>
          <div>
            <div className="app-brand__title">Nepal Bus Guide</div>
            <div className="app-brand__subtitle">
              Local buses for tourists — Bagmati Province
            </div>
          </div>
        </div>
      </header>

      <section className="map-section">
        <MapView routeData={routeData} userLocation={location} />

        {/* Map legend */}
        {routeData && (
          <div className="map-legend">
            <span>🟢 - - - Walking</span>
            <span>🔵 ——— Bus route</span>
          </div>
        )}
      </section>

      <main className="content-sheet">
        {/* Location button */}
        {!location ? (
          <button
            onClick={getLocation}
            disabled={locLoading}
            className="primary-action"
          >
            {locLoading ? "Getting your location..." : "📍 Use My Location"}
          </button>
        ) : (
          <div className="location-status">
            <span>📍 Location detected</span>
            <button
              onClick={() => {
                getLocation();
              }}
              className="location-status__refresh"
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
          <div className="feedback feedback--loading">
            🔍 Finding best bus route...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="feedback feedback--error">
            ⚠️ {error}
          </div>
        )}

        {/* Journey result */}
        {routeData && !loading && <JourneyCard routeData={routeData} />}

        {/* Prompt if location set but no destination */}
        {location && !selectedDest && !loading && (
          <div className="empty-state">
            Search a destination above, then tap Go to find your bus route
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
