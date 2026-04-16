const SensorData = require("../models/SensorData");
const ProcessedData = require("../models/ProcessedData");
const {
  WINDOW_SIZE,
  average,
  variance,
  getHeartRateScore,
  getMovementScore,
  getSleepScore,
  classify,
  detectSleepState,
  calculateConfidence,
} = require("../utils/scoring");

const getRecentReadings = async (patientId) => {
  const readings = await SensorData.find({ patientId })
    .sort({ timestamp: -1 })
    .limit(WINDOW_SIZE)
    .lean();
  return readings.reverse();
};

const buildFeatures = (readings) => {
  const heartRates = readings.map((item) => item.heartRate);
  const movements = readings.map((item) => item.movement);
  return {
    avgHeartRate: average(heartRates),
    avgMovement: average(movements),
    movementVariance: variance(movements),
  };
};

const processSensorReading = async ({ patientId, heartRate, movement, timestamp }) => {
  const rawRecord = await SensorData.create({
    patientId,
    heartRate,
    movement,
    timestamp: timestamp || new Date(),
  });

  const recentReadings = await getRecentReadings(patientId);
  const features = buildFeatures(recentReadings);

  const previousProcessed = await ProcessedData.findOne({ patientId })
    .sort({ createdAt: -1 })
    .lean();

  const sleepState = detectSleepState({
    features,
    latestHeartRate: heartRate,
    latestMovement: movement,
    previousSleepState: previousProcessed?.sleepState,
  });

  const hrScore = getHeartRateScore(heartRate);
  const movementScore = getMovementScore(movement);
  const sleepScore = getSleepScore(sleepState, features);
  const score = hrScore + movementScore + sleepScore;
  const status = classify(score);
  const confidence = calculateConfidence({
    status,
    score,
    windowLength: recentReadings.length,
  });
  const alert = status === "abnormal";

  const processedRecord = await ProcessedData.create({
    patientId,
    sensorDataId: rawRecord._id,
    status,
    sleepState,
    score,
    confidence,
    alert,
    createdAt: rawRecord.timestamp,
  });

  return { rawRecord, processedRecord };
};

module.exports = { processSensorReading };
