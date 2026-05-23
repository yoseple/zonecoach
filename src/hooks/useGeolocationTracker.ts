import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  validateGPSPoint, 
  calculateDistance, 
  metersToMiles
} from '../utils/gps';
import type { GPSPoint } from '../utils/gps';
import { interpolateSplitTime, createLiveSplit } from '../utils/splits';
import type { LiveSplit } from '../utils/splits';

interface TrackerState {
  points: GPSPoint[];
  acceptedPoints: GPSPoint[];
  rejectedCount: number;
  totalDistance: number; // in miles
  splits: LiveSplit[];
  accuracy: number | null;
  lastRejectedReason: string | null;
}

export const useGeolocationTracker = (isActive: boolean) => {
  const [state, setState] = useState<TrackerState>({
    points: [],
    acceptedPoints: [],
    rejectedCount: 0,
    totalDistance: 0,
    splits: [],
    accuracy: null,
    lastRejectedReason: null
  });

  const watchId = useRef<number | null>(null);
  const prevState = useRef<TrackerState>(state);
  prevState.current = state;

  const handleUpdate = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
    const newPoint: GPSPoint = {
      lat: latitude,
      lng: longitude,
      timestamp: position.timestamp,
      accuracy: accuracy || 0,
      altitude,
      speed,
      heading
    };

    const previousAccepted = prevState.current.acceptedPoints[prevState.current.acceptedPoints.length - 1] || null;
    const validation = validateGPSPoint(newPoint, previousAccepted);

    if (validation.valid && isActive) {
      const distanceMeters = previousAccepted ? calculateDistance(previousAccepted, newPoint) : 0;
      const distanceMiles = metersToMiles(distanceMeters);
      const newTotalDistance = prevState.current.totalDistance + distanceMiles;

      // Split logic
      const currentMileGoal = prevState.current.splits.length + 1;
      let newSplits = [...prevState.current.splits];
      
      if (newTotalDistance >= currentMileGoal) {
        // Interpolate split time
        const interpolatedTime = interpolateSplitTime(
          prevState.current.totalDistance,
          newTotalDistance,
          previousAccepted?.timestamp || newPoint.timestamp,
          newPoint.timestamp,
          currentMileGoal
        );

        const lastSplitEnd = newSplits[newSplits.length - 1]?.endTime || (newSplits.length === 0 ? (prevState.current.acceptedPoints[0]?.timestamp || newPoint.timestamp) : newPoint.timestamp);
        
        const split = createLiveSplit(
          currentMileGoal,
          lastSplitEnd,
          interpolatedTime,
          currentMileGoal,
          interpolatedTime - (prevState.current.acceptedPoints[0]?.timestamp || newPoint.timestamp)
        );
        newSplits.push(split);
      }

      setState(prev => ({
        ...prev,
        acceptedPoints: [...prev.acceptedPoints, newPoint],
        totalDistance: newTotalDistance,
        splits: newSplits,
        accuracy: newPoint.accuracy,
        lastRejectedReason: null
      }));
    } else {
      setState(prev => ({
        ...prev,
        points: [...prev.points, newPoint],
        rejectedCount: validation.valid ? prev.rejectedCount : prev.rejectedCount + 1,
        accuracy: newPoint.accuracy,
        lastRejectedReason: validation.reason || null
      }));
    }
  }, [isActive]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        handleUpdate,
        (err) => console.error(err),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [handleUpdate]);

  const reset = () => {
    setState({
      points: [],
      acceptedPoints: [],
      rejectedCount: 0,
      totalDistance: 0,
      splits: [],
      accuracy: null,
      lastRejectedReason: null
    });
  };

  return { ...state, reset };
};
