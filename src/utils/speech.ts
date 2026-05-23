import type { CoachingSettings } from '../types';

let lastAlerts: Record<string, number> = {};

export const speak = (text: string, options: Partial<CoachingSettings>) => {
  const enabled = options.enabled ?? true;
  if (!enabled || !window.speechSynthesis) return;

  // Simple cooldown logic
  const now = Date.now();
  const cooldownMs = (options.cooldownSeconds ?? 75) * 1000;
  if (lastAlerts[text] && now - lastAlerts[text] < cooldownMs) return;

  // Cancel any existing speech to avoid queuing a lot of messages
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.voiceRate ?? 1;
  utterance.pitch = options.voicePitch ?? 1;
  
  window.speechSynthesis.speak(utterance);
  lastAlerts[text] = now;
};

export const announceMile = (mile: number, pace: string, isFastest: boolean, options: Partial<CoachingSettings>) => {
  if (options.mileAnnouncements === false) return;
  
  let text = `Mile ${mile} complete. Pace was ${pace.replace(':', ' minutes and ')} seconds.`;
  if (isFastest) {
    text += " Fastest mile so far.";
  }
  
  speak(text, { ...options, enabled: true }); 
};

export const clearSpeechCooldowns = () => {
  lastAlerts = {};
};
