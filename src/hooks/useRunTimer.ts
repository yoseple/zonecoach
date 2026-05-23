import { useState, useRef, useCallback, useEffect } from 'react';

export const useRunTimer = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsTimerRunning] = useState(false);
  
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0); // in ms
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isRunning) return;
    
    startTimeRef.current = Date.now();
    setIsTimerRunning(true);

    intervalRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        const delta = Date.now() - startTimeRef.current;
        const totalMs = accumulatedTimeRef.current + delta;
        setElapsedSeconds(Math.floor(totalMs / 1000));
      }
    }, 100); // Higher frequency for smoother UI if needed, though we set seconds
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    
    if (startTimeRef.current) {
      accumulatedTimeRef.current += (Date.now() - startTimeRef.current);
    }
    
    startTimeRef.current = null;
    setIsTimerRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning]);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const stop = useCallback(() => {
    pause();
  }, [pause]);

  const reset = useCallback(() => {
    stop();
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
    setElapsedSeconds(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    elapsedSeconds,
    isRunning,
    start,
    pause,
    resume,
    stop,
    reset
  };
};
