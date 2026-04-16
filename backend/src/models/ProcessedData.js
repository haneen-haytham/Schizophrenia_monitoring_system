const mongoose = require("mongoose");

const processedDataSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    sensorDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorData",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["normal", "warning", "abnormal"],
      required: true,
      index: true,
    },
    sleepState: {
      type: String,
      enum: ["sleep", "awake", "disturbed"],
      required: true,
      index: true,
    },
    score: { type: Number, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    alert: { type: Boolean, required: true, index: true },
    createdAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("ProcessedData", processedDataSchema);
