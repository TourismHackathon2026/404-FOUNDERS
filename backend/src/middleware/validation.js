export function validateNearestStop(req, res, next) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  next();
}

export function validateFindRoute(req, res, next) {
  const { userLat, userLng, destLat, destLng } = req.body;

  if (!userLat || !userLng || !destLat || !destLng) {
    return res.status(400).json({
      error: "User and destination coordinates are required",
    });
  }

  next();
}
