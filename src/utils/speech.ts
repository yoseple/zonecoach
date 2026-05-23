export interface SpeechOptions {
  enabled: boolean;
  mileAnnouncements: boolean;
  paceAlerts: boolean;
  rate: number;
  pitch: number;
}

const lastAlerts: Record<string, number> = {};
const COOLDOWN_MS = 75000; // 75 seconds

export const speak = (text: string, options: SpeechOptions) => {
  if (!options.enabled || !window.speechSynthesis) return;

  // Simple cooldown logic
  const now = Date.now();
  if (lastAlerts[text] && now - lastAlerts[text] < COOLDOWN_MS) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate;
  utterance.pitch = options.pitch;
  
  window.speechSynthesis.speak(utterance);
  lastAlerts[text] = now;
};

export const announceMile = (mile: number, pace: string, options: SpeechOptions) => {
  if (!options.mileAnnouncements) return;
  const text = `Mile ${mile} complete. Pace was ${pace.replace(':', ' minutes and ')} seconds.`;
  speak(text, { ...options, enabled: true }); // Mile announcements always play once if mileAnnouncements is on
};
