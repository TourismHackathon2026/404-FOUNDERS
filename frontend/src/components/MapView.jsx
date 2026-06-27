import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "../utils/fixLeafletIcon.js";

// Custom colored markers
const createColoredMarker = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const greenMarker = createColoredMarker("green"); // user
const redMarker = createColoredMarker("red"); // destination

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);

  return null;
}

// OSRM route fetch
async function fetchRoutePoints(profile, start, end, signal) {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Route fetch failed");

  const data = await response.json();
  const coords = data?.routes?.[0]?.geometry?.coordinates;

  if (!coords || coords.length < 2) {
    throw new Error("No route geometry");
  }

  // convert [lng, lat] → [lat, lng]
  return coords.map(([lng, lat]) => [lat, lng]);
}

function MapView({ userLocation, routeData }) {
  const [route, setRoute] = useState(null);

  const isReady = Boolean(userLocation && routeData?.destination_coords);

  const userPos = [
    userLocation?.lat ?? 27.7172,
    userLocation?.lng ?? 85.324,
  ];

  const destPos = [
    parseFloat(routeData?.destination_coords?.lat ?? 27.7172),
    parseFloat(routeData?.destination_coords?.lng ?? 85.324),
  ];

  // fetch route (A → B)
  useEffect(() => {
    if (!isReady) return;

    const controller = new AbortController();

    const loadRoute = async () => {
      try {
        const path = await fetchRoutePoints(
          "driving",
          userPos,
          destPos,
          controller.signal
        );

        setRoute(path);
      } catch (err) {
        console.error("Route error:", err);
        setRoute([userPos, destPos]); // fallback straight line
      }
    };

    loadRoute();

    return () => controller.abort();
  }, [isReady, userPos[0], userPos[1], destPos[0], destPos[1]]);

  return (
    <MapContainer
      center={userPos}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds points={[userPos, destPos]} />

      {/* markers */}
      <Marker position={userPos} icon={greenMarker}>
        <Popup>📍 You</Popup>
      </Marker>

      <Marker position={destPos} icon={redMarker}>
        <Popup>🏁 Destination</Popup>
      </Marker>

      {/* route line */}
      {route && (
        <Polyline
          positions={route}
          pathOptions= {{ color: "#3b82f6", weight: 5 }}
        />
      )}
    </MapContainer>
  );
}

export default MapView;