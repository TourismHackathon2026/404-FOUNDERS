import busStop from "../models/busStop.js";
import busRoute from "../models/busRoute.js";
import destination from "../models/destination.js";
import haversine from "../utils/haversine.js";

export async function getNearestStop(req, res) {
  try {
    const { lat, lng } = req.query;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const allStops = await busStop.find();
    const stopsWithDistance = allStops.map((stop) => {
      const [stopLng, stopLat] = stop.location.coordinates;
      const distance = haversine(userLat, userLng, stopLat, stopLng);
      return { ...stop.toObject(), distance_meters: Math.round(distance) };
    });

    stopsWithDistance.sort((a, b) => a.distance_meters - b.distance_meters);
    const nearest = stopsWithDistance[0];

    res.json({
      stop: nearest,
      distance_meters: nearest.distance_meters,
      walking_minutes: Math.ceil(nearest.distance_meters / 80),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function findRoute(req, res) {
  try {
    const { userLat, userLng, destLat, destLng, destName } = req.body;
    const uLat = parseFloat(userLat);
    const uLng = parseFloat(userLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    const directDistance = haversine(uLat, uLng, dLat, dLng);
    const walkRecommended = directDistance <= 1000;

    const allStops = await busStop.find();
    const allRoutes = await busRoute.find();

    const userNearestStop = findNearestStop(allStops, uLat, uLng);
    const destNearestStop = findNearestStop(allStops, dLat, dLng);

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

    const busDistance = calculateBusDistance(routeResult.stops);
    const fare = Math.round(
      routeResult.route.base_fare +
        (busDistance / 1000) * routeResult.route.fare_per_km,
    );

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
}

export async function getDestinations(req, res) {
  try {
    const destinations = await destination
      .find()
      .select("name location category");

    if (!destinations || destinations.length === 0) {
      return res.json({ destinations: [] });
    }

    const result = destinations.map((dest) => ({
      name: dest.name,
      lat: dest.location.coordinates[1],
      lng: dest.location.coordinates[0],
      category: dest.category,
    }));

    res.json({ destinations: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

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

  return null;
}

function calculateBusDistance(stops) {
  return (stops.length - 1) * 800;
}
