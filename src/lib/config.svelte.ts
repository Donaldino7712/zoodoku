import { PersistedState } from 'runed';

export const vibrate = new PersistedState('zoodoku-vibrate', true);
export const audio = new PersistedState('zoodoku-audio', true);
export const barebones = new PersistedState('zoodoku-barebones', false);
export const colorBlind = new PersistedState('zoodoku-color-blind', false);
export const animations = new PersistedState('zoodoku-animations', true);
export const theme = new PersistedState<'dark' | 'light' | 'dark-ctp'>('zoodoku-theme', 'light');
export const seed = new PersistedState('zoodoku-seed', Math.floor(Math.random() * 100000000));
export const level = new PersistedState('zoodoku-level', 1);

export type DailyResult = {
	date: string;
	result: 'win' | 'loss';
	seconds: number;
	streak: number;
};

export const dailyResult = new PersistedState<DailyResult | undefined>(
	'zoodoku-daily-results',
	undefined
);

export function importProgress(progress: string) {
  const decoded = JSON.parse(atob(progress));
  vibrate.current = decoded.vibrate;
  audio.current = decoded.audio;
  barebones.current = decoded.barebones;
  colorBlind.current = decoded.colorBlind;
  animations.current = decoded.animations;
  theme.current = decoded.theme;
  seed.current = decoded.seed;
  level.current = decoded.level;
}

export function exportProgress(): string {
  const progress = btoa(JSON.stringify({
    zoodoku: 1,
    vibrate: vibrate.current,
    audio: audio.current,
    barebones: barebones.current,
    colorBlind: colorBlind.current,
    animations: animations.current,
    theme: theme.current,
    seed: seed.current,
    level: level.current
  }));
  return progress;
}

export function resetProgress() {
  vibrate.current = true;
  audio.current = true;
  barebones.current = false;
  colorBlind.current = false;
  animations.current = true;
  theme.current = "light";
  seed.current = Math.floor(Math.random() * 100000000);
  level.current = 1;
}
