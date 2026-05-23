export const MAX_ACCEPTED_ACCURACY_METERS = 35;
export const IDEAL_ACCURACY_METERS = 20;
export const MIN_DISTANCE_DELTA_METERS = 2;
export const MAX_RUNNING_SPEED_MPS = 11.2; // ~25 mph
export const MIN_TIME_DELTA_SECONDS = 1;
export const MAX_TIME_DELTA_SECONDS = 15;

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
}

export const calculateDistance = (p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const metersToMiles = (meters: number): number => meters / 1609.34;

export const getGPSAccuracyCategory = (accuracy: number) => {
  if (accuracy <= 10) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  if (accuracy <= 20) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
  if (accuracy <= 35) return { label: 'Weak', color: 'text-amber-500', bg: 'bg-amber-50' };
  return { label: 'Poor', color: 'text-rose-500', bg: 'bg-rose-50' };
};

export const validateGPSPoint = (
  current: GPSPoint,
  previous: GPSPoint | null
): { valid: boolean; reason?: string } => {
  if (!current.accuracy || current.accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
    return { valid: false, reason: 'Poor accuracy' };
  }

  if (previous) {
    const timeDelta = (current.timestamp - previous.timestamp) / 1000;
    const distanceDelta = calculateDistance(previous, current);
    
    if (timeDelta < MIN_TIME_DELTA_SECONDS) return { valid: false, reason: 'Time delta too small' };
    if (timeDelta > MAX_TIME_DELTA_SECONDS) return { valid: false, reason: 'Time delta too large' };
    if (distanceDelta < MIN_DISTANCE_DELTA_METERS) return { valid: false, reason: 'Distance delta too small' };

    const speed = distanceDelta / timeDelta;
    if (speed > MAX_RUNNING_SPEED_MPS) return { valid: false, reason: 'Speed unrealistic' };
  }

  return { valid: true };
};
