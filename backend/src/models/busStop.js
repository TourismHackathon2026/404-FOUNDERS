import mongoose from "mongoose";

const busStopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude] — MongoDB order
      required: true,
    },
  },
  landmark_near: {
    type: String,
    default: "",
  },
});

busStopSchema.index({ location: "2dsphere" });

export default mongoose.model("busStop", busStopSchema);
