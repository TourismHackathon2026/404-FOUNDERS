import express from "express";
import {
  getNearestStop,
  findRoute,
  getDestinations,
} from "../controllers/busController.js";
import {
  validateNearestStop,
  validateFindRoute,
} from "../middleware/validation.js";

const router = express.Router();

router.get("/stops/nearest", validateNearestStop, getNearestStop);
router.post("/route/find", validateFindRoute, findRoute);
router.get("/destinations", getDestinations);

export default router;
