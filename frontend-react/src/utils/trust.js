/**
 * TrustGuard-IoMT Trust Engine Constants & Formatting Utilities
 * Formula: Final Trust = 0.45 * Device Trust + 0.55 * Data Authenticity
 * Thresholds: Accept >= 80, Monitor 50-79.9, Isolate < 50
 */

export const TRUST_WEIGHTS = {
  DEVICE_TRUST: 0.45,
  DATA_AUTHENTICITY: 0.55,
};

export const TRUST_THRESHOLDS = {
  ACCEPT_MIN: 80.0,
  MONITOR_MIN: 50.0,
};

export function calculateTrustScore(deviceTrust, dataAuthenticity) {
  const dt = Number(deviceTrust) || 0;
  const da = Number(dataAuthenticity) || 0;
  const finalScore = TRUST_WEIGHTS.DEVICE_TRUST * dt + TRUST_WEIGHTS.DATA_AUTHENTICITY * da;
  return Number(finalScore.toFixed(2));
}

export function getTrustDecision(score) {
  const s = Number(score) || 0;
  if (s >= TRUST_THRESHOLDS.ACCEPT_MIN) return 'Accept';
  if (s >= TRUST_THRESHOLDS.MONITOR_MIN) return 'Monitor';
  return 'Isolate';
}

export function getTrustLevel(score) {
  const s = Number(score) || 0;
  if (s >= TRUST_THRESHOLDS.ACCEPT_MIN) return 'good';
  if (s >= TRUST_THRESHOLDS.MONITOR_MIN) return 'warn';
  return 'bad';
}

export function getTrustColor(score) {
  const level = getTrustLevel(score);
  switch (level) {
    case 'good': return '#2dd4a0'; // green
    case 'warn': return '#ffb020'; // amber
    case 'bad': return '#ff4d6a';  // red
    default: return '#3ec9ff';     // accent blue
  }
}
