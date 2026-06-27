import { useEffect } from "react";
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

function MapView({ routeData, userLocation }) {
  if (!routeData || !userLocation) {
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

  const { origin, destination, journey } = routeData;

  // User position
  const userPos = [userLocation.lat, userLocation.lng];

  // Board and alight stop positions
  const boardStopCoords = origin.nearest_stop.location.coordinates;
  const boardPos = [boardStopCoords[1], boardStopCoords[0]]; // [lat, lng]

  const alightStopCoords = destination.nearest_stop.location.coordinates;
  const alightPos = [alightStopCoords[1], alightStopCoords[0]];

  // Destination position
  const destPos = [
    parseFloat(routeData.destination_coords.lat),
    parseFloat(routeData.destination_coords.lng),
  ];

  // Walking path: user → board stop (green)
  const walkingToPath = [userPos, boardPos];

  // Bus path: all stops along the journey (blue)
  const busPath = journey.stops_sequence
    .map((stop) => {
      // stops_sequence has stop names — match against nearest stop coords
      // We use board and alight for a clean line
      return null;
    })
    .filter(Boolean);

  // Simpler: draw bus line directly between board and alight stops
  const busRoutePath = [boardPos, alightPos];

  // Walking path: alight stop → destination (green)
  const walkingFromPath = [alightPos, destPos];

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
