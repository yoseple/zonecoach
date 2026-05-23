import { useState, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isSupported] = useState('wakeLock' in navigator);
  const [status, setStatus] = useState<'on' | 'off' | 'unsupported' | 'denied'>('off');

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }
    
    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);
      setStatus('on');
      
      lock.addEventListener('release', () => {
        setStatus('off');
      });
      
      console.log('Wake Lock is active');
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
      setStatus('denied');
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setStatus('off');
      console.log('Wake Lock released');
    }
  }, [wakeLock]);

  // Handle visibility change (re-request lock if window becomes visible)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, requestWakeLock]);

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return { 
    isSupported, 
    wakeLock, 
    requestWakeLock, 
    releaseWakeLock, 
    status 
  };
};
