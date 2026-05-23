import { useState, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isSupported] = useState('wakeLock' in navigator);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;
    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);
      console.log('Wake Lock is active');
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      console.log('Wake Lock released');
    }
  }, [wakeLock]);

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return { isSupported, wakeLock, requestWakeLock, releaseWakeLock };
};
