const express = require("express");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const ProcessedData = require("../models/ProcessedData");
const { processSensorReading } = require("../services/processingService");

const router = express.Router();

router.post("/data", async (req, res, next) => {
  try {
    const { patientId, heartRate, movement, timestamp } = req.body;

    if (!patientId || heartRate === undefined || movement === undefined) {
      return res.status(400).json({
        message: "patientId, heartRate and movement are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    const patient = await Patient.findById(patientId).lean();
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const { processedRecord } = await processSensorReading({
      patientId,
      heartRate,
      movement,
      timestamp,
    });

    return res.status(201).json({
      status: processedRecord.status,
      sleepState: processedRecord.sleepState,
      score: processedRecord.score,
      confidence: processedRecord.confidence,
      alert: processedRecord.alert,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/alerts", async (req, res, next) => {
  try {
    const alerts = await ProcessedData.find({ alert: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      alerts: alerts.map((item) => ({
        patientId: item.patientId,
        status: item.status,
        sleepState: item.sleepState,
        score: item.score,
        timestamp: item.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
