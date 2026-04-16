const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    heartRate: { type: Number, required: true },
    movement: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("SensorData", sensorDataSchema);
