import express from "express";
import busStop from "../models/busStop.js";
import busRoute from "../models/busRoute.js";
import haversine from "../utils/haversine.js";

const router = express.Router();

router.get("/stops/nearest", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Get all stops from DB
    const allStops = await busStop.find();

    // Calculate distance from user to every stop
    const stopsWithDistance = allStops.map((stop) => {
      const [stopLng, stopLat] = stop.location.coordinates; // remember: MongoDB is [lng, lat]
      const distance = haversine(userLat, userLng, stopLat, stopLng);
      return { ...stop.toObject(), distance_meters: Math.round(distance) };
    });

    // Sort by distance, return the closest one
    stopsWithDistance.sort((a, b) => a.distance_meters - b.distance_meters);
    const nearest = stopsWithDistance[0];

    res.json({
      stop: nearest,
      distance_meters: nearest.distance_meters,
      walking_minutes: Math.ceil(nearest.distance_meters / 80), // avg 80m per minute walking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/route/find", async (req, res) => {
  try {
    const { userLat, userLng, destLat, destLng, destName } = req.body;

    if (!userLat || !userLng || !destLat || !destLng) {
      return res
        .status(400)
        .json({ error: "User and destination coordinates are required" });
    }

    const uLat = parseFloat(userLat);
    const uLng = parseFloat(userLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    // Check if destination is within 1km — recommend walking
    const directDistance = haversine(uLat, uLng, dLat, dLng);
    const walkRecommended = directDistance <= 1000;

    // Get all stops and routes
    const allStops = await busStop.find();
    const allRoutes = await busRoute.find();

    // Find nearest stop to user
    const userNearestStop = findNearestStop(allStops, uLat, uLng);

    // Find nearest stop to destination
    const destNearestStop = findNearestStop(allStops, dLat, dLng);

    // Find a direct route connecting both stops
    const routeResult = findDirectRoute(
      allRoutes,
      userNearestStop._id.toString(),
      destNearestStop._id.toString(),
    );

    if (!routeResult) {
      return res.status(404).json({
        error: "No direct bus route found between these locations",
        walkRecommended,
        directDistance_meters: Math.round(directDistance),
      });
    }

    // Calculate distances and fares
    const walkingToStop = haversine(
      uLat,
      uLng,
      userNearestStop.location.coordinates[1],
      userNearestStop.location.coordinates[0],
    );

    const walkingFromStop = haversine(
      destNearestStop.location.coordinates[1],
      destNearestStop.location.coordinates[0],
      dLat,
      dLng,
    );

    // Calculate bus distance along the route stops
    const busDistance = calculateBusDistance(routeResult.stops);

    // Fare calculation
    const fare = Math.round(
      routeResult.route.base_fare +
        (busDistance / 1000) * routeResult.route.fare_per_km,
    );

    // Time estimates
    const busMinutes = routeResult.travelMinutes;
    const walkToMinutes = Math.ceil(walkingToStop / 80);
    const walkFromMinutes = Math.ceil(walkingFromStop / 80);
    const totalMinutes = walkToMinutes + busMinutes + walkFromMinutes;

    res.json({
      walkRecommended,
      directDistance_meters: Math.round(directDistance),
      origin: {
        nearest_stop: userNearestStop,
        walking_meters: Math.round(walkingToStop),
        walking_minutes: walkToMinutes,
      },
      destination: {
        name: destName || "Destination",
        nearest_stop: destNearestStop,
        walking_meters: Math.round(walkingFromStop),
        walking_minutes: walkFromMinutes,
      },
      journey: {
        route_number: routeResult.route.route_number,
        route_name: routeResult.route.name,
        board_at: routeResult.boardStop,
        alight_at: routeResult.alightStop,
        stops_sequence: routeResult.stops,
        bus_distance_meters: Math.round(busDistance),
        bus_minutes: busMinutes,
        fare_npr: fare,
        total_minutes: totalMinutes,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/destinations", (req, res) => {
  const destinations = [
    { name: "Boudhanath Stupa", lat: 27.7215, lng: 85.362 },
    { name: "Pashupatinath Temple", lat: 27.7104, lng: 85.3486 },
    { name: "Patan Durbar Square", lat: 27.671, lng: 85.3178 },
    { name: "Bhaktapur Durbar Square", lat: 27.6722, lng: 85.4271 },
    { name: "Swayambhunath Stupa", lat: 27.7149, lng: 85.2904 },
    { name: "Thamel", lat: 27.7151, lng: 85.3078 },
    { name: "Garden of Dreams", lat: 27.7128, lng: 85.3145 },
    { name: "Kathmandu Durbar Square", lat: 27.7045, lng: 85.307 },
  ];
  res.json({ destinations });
});

function findNearestStop(allStops, lat, lng) {
  return allStops
    .map((stop) => {
      const [sLng, sLat] = stop.location.coordinates;
      return { ...stop.toObject(), _distance: haversine(lat, lng, sLat, sLng) };
    })
    .sort((a, b) => a._distance - b._distance)[0];
}

function findDirectRoute(allRoutes, originStopId, destStopId) {
  for (const route of allRoutes) {
    const stopIds = route.stops.map((s) => s.stop_id.toString());
    const originIdx = stopIds.indexOf(originStopId);
    const destIdx = stopIds.indexOf(destStopId);

    // Both stops must exist in this route AND origin must come before destination
    if (originIdx !== -1 && destIdx !== -1 && originIdx < destIdx) {
      const stopsOnJourney = route.stops.slice(originIdx, destIdx + 1);
      const travelMinutes =
        route.stops[destIdx].minutes_from_terminal -
        route.stops[originIdx].minutes_from_terminal;

      return {
        route,
        boardStop: route.stops[originIdx],
        alightStop: route.stops[destIdx],
        stops: stopsOnJourney,
        travelMinutes,
      };
    }
  }
  return null; // no direct route found
}

function calculateBusDistance(stops) {
  // Approximate: average 800m between urban bus stops
  return (stops.length - 1) * 800;
}

export default router;
