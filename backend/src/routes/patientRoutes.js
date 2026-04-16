const express = require("express");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const SensorData = require("../models/SensorData");
const ProcessedData = require("../models/ProcessedData");

const router = express.Router();

router.get("/patients", async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).lean();
    return res.json({
      patients: patients.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        age: p.age,
        gender: p.gender,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/patient", async (req, res, next) => {
  try {
    const { name, age, gender } = req.body;
    const patient = await Patient.create({ name, age, gender });
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

router.get("/patient/:id/data", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid patient id" });
    }

    const data = await SensorData.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "processeddatas",
          localField: "_id",
          foreignField: "sensorDataId",
          as: "processed",
        },
      },
      { $unwind: { path: "$processed", preserveNullAndEmptyArrays: true } },
      { $sort: { timestamp: 1 } },
      {
        $project: {
          _id: 0,
          heartRate: 1,
          movement: 1,
          status: "$processed.status",
          sleepState: "$processed.sleepState",
          score: "$processed.score",
          confidence: "$processed.confidence",
          alert: "$processed.alert",
          timestamp: 1,
        },
      },
    ]);

    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get("/patient/:id/latest", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid patient id" });
    }

    const latest = await ProcessedData.findOne({ patientId: id })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ message: "No processed data found for patient" });
    }

    return res.json({
      status: latest.status,
      sleepState: latest.sleepState,
      score: latest.score,
      alert: latest.alert,
      timestamp: latest.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
