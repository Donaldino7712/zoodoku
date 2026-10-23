import { PersistedState } from 'runed';

export const vibrate = new PersistedState('zoodoku-vibrate', true);
export const audio = new PersistedState('zoodoku-audio', true);
export const barebones = new PersistedState('zoodoku-barebones', false);
export const theme = new PersistedState<'dark' | 'light' | 'dark-ctp'>('zoodoku-theme', 'light');
export const seed = new PersistedState('zoodoku-seed', Math.floor(Math.random() * 100000000));
export const level = new PersistedState('zoodoku-level', 1);
