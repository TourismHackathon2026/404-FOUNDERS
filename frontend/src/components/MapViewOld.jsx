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

const greenMarker = createColoredMarker("green"); // user location
const blueMarker = createColoredMarker("blue"); // board stop
const orangeMarker = createColoredMarker("orange"); // alight stop
const redMarker = createColoredMarker("red"); // destination

// Auto-fit map to show all route points
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

async function fetchRoutePoints(profile, start, end, signal) {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;

  const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=false`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Failed to load ${profile} route`);
  }

  const data = await response.json();
  const geometry = data?.routes?.[0]?.geometry?.coordinates;

  if (!geometry || geometry.length < 2) {
    throw new Error(`No ${profile} route geometry returned`);
  }

  // Convert [lng, lat] to [lat, lng] for Leaflet
  return geometry.map(([lng, lat]) => [lat, lng]);
}

function MapView({ routeData, userLocation }) {
  const [routePaths, setRoutePaths] = useState({
    walkingTo: null,
    bus: null,
    walkingFrom: null,
  });

  const isReady = Boolean(routeData && userLocation);

  const origin = routeData?.origin;
  const destination = routeData?.destination;
  const journey = routeData?.journey;

  // User position
  const userLat = userLocation?.lat ?? 27.7172;
  const userLng = userLocation?.lng ?? 85.324;
  const userPos = [userLat, userLng];

  // Board and alight stop positions
  const boardStopCoords = origin?.nearest_stop?.location?.coordinates ?? [85.324, 27.7172];
  const boardLng = boardStopCoords[0];
  const boardLat = boardStopCoords[1];
  const boardPos = [boardLat, boardLng]; // [lat, lng]

  const alightStopCoords = destination?.nearest_stop?.location?.coordinates ?? [85.324, 27.7172];
  const alightLng = alightStopCoords[0];
  const alightLat = alightStopCoords[1];
  const alightPos = [alightLat, alightLng];

  // Destination position
  const destLat = parseFloat(routeData?.destination_coords?.lat ?? userLat);
  const destLng = parseFloat(routeData?.destination_coords?.lng ?? userLng);
  const destPos = [destLat, destLng];

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const controller = new AbortController();

    const loadPaths = async () => {
      try {
        const [walkingTo, bus, walkingFrom] = await Promise.all([
          fetchRoutePoints("foot", userPos, boardPos, controller.signal),
          fetchRoutePoints("driving", boardPos, alightPos, controller.signal),
          fetchRoutePoints("foot", alightPos, destPos, controller.signal),
        ]);

        setRoutePaths({ walkingTo, bus, walkingFrom }); 
      } catch (error) {
        if (error.name !== "AbortError") {
          setRoutePaths({
            walkingTo: [userPos, boardPos],
            bus: [boardPos, alightPos],
            walkingFrom: [alightPos, destPos],
          });
        }
      }
    };

    loadPaths();

    return () => controller.abort();
  }, [
    isReady,
    userLat,
    userLng,
    boardLat,
    boardLng,
    alightLat,
    alightLng,
    destLat,
    destLng,
  ]);

  const walkingToPath = routePaths.walkingTo || [userPos, boardPos];
  const busRoutePath = routePaths.bus || [boardPos, alightPos];
  const walkingFromPath = routePaths.walkingFrom || [alightPos, destPos];

  if (!isReady) {
    return (
      <MapContainer
        center={[27.7172, 85.324]}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[27.7172, 85.324]}>
          <Popup>Kathmandu, Nepal</Popup>
        </Marker>
      </MapContainer>
    );
  }

  // All points for fitBounds
  const allPoints = [userPos, boardPos, alightPos, destPos];

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

      <FitBounds points={allPoints} />

      {/* User location marker */}
      <Marker position={userPos} icon={greenMarker}>
        <Popup>📍 Your Location</Popup>
      </Marker>

      {/* Board stop marker */}
      <Marker position={boardPos} icon={blueMarker}>
        <Popup>
          🚌 Board here
          <br />
          <strong>{origin.nearest_stop.name}</strong>
          <br />
          Route {journey.route_number}
        </Popup>
      </Marker>

      {/* Alight stop marker */}
      <Marker position={alightPos} icon={orangeMarker}>
        <Popup>
          🔔 Alight here
          <br />
          <strong>{destination.nearest_stop.name}</strong>
        </Popup>
      </Marker>

      {/* Destination marker */}
      <Marker position={destPos} icon={redMarker}>
        <Popup>🏛️ {destination.name}</Popup>
      </Marker>

      {/* Green dashed line — walking to bus stop */}
      <Polyline
        positions={walkingToPath}
        pathOptions={{ color: "#22c55e", weight: 4, dashArray: "8 6" }}
      />

      {/* Blue solid line — bus route */}
      <Polyline
        positions={busRoutePath}
        pathOptions={{ color: "#3b82f6", weight: 5 }}
      />

      {/* Green dashed line — walking from bus stop to destination */}
      <Polyline
        positions={walkingFromPath}
        pathOptions={{ color: "#22c55e", weight: 4, dashArray: "8 6" }}
      />
    </MapContainer>
  );
}

export default MapView;
