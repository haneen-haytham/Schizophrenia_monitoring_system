const WINDOW_SIZE = 10;
const LOW_MOVEMENT_VARIANCE = 0.05;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const average = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const variance = (values) => {
  if (values.length === 0) return 0;
  const avg = average(values);
  return values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
};

const getHeartRateScore = (heartRate) => {
  if (heartRate > 110 || heartRate < 60) return 2;
  if (heartRate > 90) return 1;
  return 0;
};

const getMovementScore = (movement) => {
  if (movement > 1.2 || movement < 0.05) return 2;
  if (movement > 0.8 || movement < 0.1) return 1;
  return 0;
};

const getSleepScore = (sleepState, features) => {
  if (sleepState !== "disturbed") return 0;
  if (features.avgHeartRate > 110 || features.avgMovement > 1.2) return 2;
  return 1;
};

const classify = (totalScore) => {
  if (totalScore <= 1) return "normal";
  if (totalScore === 2) return "warning";
  return "abnormal";
};

const detectSleepState = ({ features, latestHeartRate, latestMovement, previousSleepState }) => {
  const inSleepRange =
    features.avgHeartRate < 65 &&
    features.avgMovement < 0.2 &&
    features.movementVariance <= LOW_MOVEMENT_VARIANCE;

  const inAwakeRange =
    features.avgHeartRate >= 65 &&
    features.avgHeartRate <= 100 &&
    features.avgMovement >= 0.2 &&
    features.avgMovement <= 1.0;

  const disturbanceDetected =
    previousSleepState === "sleep" &&
    (latestHeartRate > 100 ||
      latestMovement > 1.2 ||
      (features.avgHeartRate >= 65 && latestMovement > 0.8));

  if (disturbanceDetected) return "disturbed";
  if (inSleepRange) return "sleep";
  if (inAwakeRange) return "awake";
  return previousSleepState || "awake";
};

const calculateConfidence = ({ status, score, windowLength }) => {
  const statusWeight = status === "normal" ? 0.75 : status === "warning" ? 0.82 : 0.9;
  const scoreFactor = clamp(score / 6, 0, 1);
  const windowFactor = clamp(windowLength / WINDOW_SIZE, 0.5, 1);
  return Number(clamp(statusWeight * 0.6 + scoreFactor * 0.25 + windowFactor * 0.15, 0, 1).toFixed(2));
};

module.exports = {
  WINDOW_SIZE,
  average,
  variance,
  getHeartRateScore,
  getMovementScore,
  getSleepScore,
  classify,
  detectSleepState,
  calculateConfidence,
};
