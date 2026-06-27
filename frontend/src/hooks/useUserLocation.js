import { useState } from "react";

function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // If user denies or testing on desktop, fall back to Thamel coords
        console.warn("Location denied, using Thamel as default:", err.message);
        setLocation({ lat: 27.7151, lng: 85.3078 });
        setLoading(false);
      },
    );
  };

  return { location, loading, error, getLocation };
}

export default useUserLocation;
