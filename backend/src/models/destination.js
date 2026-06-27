import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  category: {
    type: String,
    enum: ["temple", "museum", "park", "historical", "market", "other"],
    default: "other",
  },
  description: {
    type: String,
    default: "",
  },
  nearest_stop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "busStop",
  },
  nearest_stop_name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

destinationSchema.index({ location: "2dsphere" });
destinationSchema.index({ category: 1 });

export default mongoose.model("destination", destinationSchema);
