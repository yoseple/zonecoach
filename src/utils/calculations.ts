import type { Split, ZoneSettings, Run } from '../types';

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? h : null,
    m.toString().padStart(h > 0 ? 2 : 1, '0'),
    s.toString().padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');
};

export const calculatePace = (seconds: number, miles: number): string => {
  if (miles === 0) return '0:00';
  const paceSeconds = Math.round(seconds / miles);
  const m = Math.floor(paceSeconds / 60);
  const s = paceSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const paceToSeconds = (paceStr: string): number => {
  const [m, s] = paceStr.split(':').map(Number);
  return m * 60 + s;
};

export const calculateZones = (settings: ZoneSettings) => {
  const maxHR = settings.method === 'simple' ? 220 - settings.age : settings.maxHeartRate;
  
  if (settings.method === 'manual' && settings.manualZones) {
    return settings.manualZones;
  }

  // Standard percentages
  return {
    z1: [Math.round(maxHR * 0.5), Math.round(maxHR * 0.6)],
    z2: [Math.round(maxHR * 0.6), Math.round(maxHR * 0.7)],
    z3: [Math.round(maxHR * 0.7), Math.round(maxHR * 0.8)],
    z4: [Math.round(maxHR * 0.8), Math.round(maxHR * 0.9)],
    z5: [Math.round(maxHR * 0.9), maxHR],
  };
};

export const getZoneAnalysis = (avgHR: number, settings: ZoneSettings) => {
  const zones = calculateZones(settings);
  const [z2Min, z2Max] = zones.z2;

  if (avgHR < z2Min) {
    return {
      score: 60,
      feedback: 'Your heart rate was below Zone 2. Pick it up slightly next time.',
      color: 'text-blue-500',
    };
  } else if (avgHR <= z2Max) {
    return {
      score: 100,
      feedback: 'Great job. You stayed mostly in Zone 2.',
      color: 'text-green-500',
    };
  } else if (avgHR <= zones.z3[1]) {
    return {
      score: 70,
      feedback: 'You pushed too hard. Slow down next time to stay in Zone 2.',
      color: 'text-yellow-500',
    };
  } else {
    return {
      score: 40,
      feedback: 'This became more of a tempo run than a Zone 2 run.',
      color: 'text-red-500',
    };
  }
};

export const getFastestSplit = (splits: Split[]): Split | null => {
  if (splits.length === 0) return null;
  return [...splits].sort((a, b) => a.time - b.time)[0];
};

export const getSlowestSplit = (splits: Split[]): Split | null => {
  if (splits.length === 0) return null;
  return [...splits].sort((a, b) => b.time - a.time)[0];
};

export const calculatePersonalRecords = (runs: Run[], settings: ZoneSettings) => {
  const records = {
    fastestMile: { value: Infinity, run: null as Run | null },
    fastest5k: { value: Infinity, run: null as Run | null },
    fastest10k: { value: Infinity, run: null as Run | null },
    longestRun: { value: 0, run: null as Run | null },
    bestZone2Score: { value: 0, run: null as Run | null },
  };

  runs.forEach(run => {
    // Longest Run
    if (run.distance > records.longestRun.value) {
      records.longestRun = { value: run.distance, run };
    }

    // Zone 2 Score
    if (run.type === 'Zone 2 Run') {
      const { score } = getZoneAnalysis(run.avgHeartRate, settings);
      if (score > records.bestZone2Score.value) {
        records.bestZone2Score = { value: score, run };
      }
    }

    // Fastest Mile from splits
    run.splits.forEach((split: Split) => {
      if (split.time > 0 && split.time < records.fastestMile.value) {
        records.fastestMile = { value: split.time, run };
      }
    });

    // 5K (approx 3.1 miles)
    if (run.distance >= 3.1) {
      const pacePerMile = run.duration / run.distance;
      const time5k = pacePerMile * 3.1;
      if (time5k < records.fastest5k.value) {
        records.fastest5k = { value: time5k, run };
      }
    }

    // 10K (approx 6.2 miles)
    if (run.distance >= 6.2) {
      const pacePerMile = run.duration / run.distance;
      const time10k = pacePerMile * 6.2;
      if (time10k < records.fastest10k.value) {
        records.fastest10k = { value: time10k, run };
      }
    }
  });

  return records;
};
