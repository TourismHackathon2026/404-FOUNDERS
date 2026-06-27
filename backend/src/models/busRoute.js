import mongoose from "mongoose";

const busRouteSchema = new mongoose.Schema({
  route_number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  base_fare: {
    type: Number,
    required: true,
  },
  fare_per_km: {
    type: Number,
    required: true,
  },
  stops: [
    {
      stop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusStop",
        required: true,
      },
      name: String,
      sequence: Number,
      minutes_from_terminal: Number,
    },
  ],
});

export default mongoose.model("busRoute", busRouteSchema);
