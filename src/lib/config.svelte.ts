import { PersistedState } from 'runed';
import * as v from 'valibot';

const themeSchema = v.union([v.literal('light'), v.literal('dark'), v.literal('dark-ctp')]);
type Theme = v.InferInput<typeof themeSchema>;

const dailyResultSchema = v.optional(
	v.object({
		date: v.pipe(v.string(), v.isoDate(), v.minValue('2026-01-01')),
		result: v.union([v.literal('win'), v.literal('lose')]),
		seconds: v.pipe(v.number(), v.gtValue(0)),
		streak: v.pipe(v.number(), v.gtValue(0))
	})
);
export type DailyResult = v.InferInput<typeof dailyResultSchema>;

const saveSchema = v.object({
	zoodoku: v.pipe(v.number(), v.literal(1)),
	vibrate: v.boolean(),
	audio: v.boolean(),
	barebones: v.boolean(),
	colorBlind: v.boolean(),
	animations: v.boolean(),
	theme: themeSchema,
	seed: v.pipe(v.number(), v.minValue(1), v.maxValue(1e8)),
	level: v.pipe(v.number(), v.gtValue(0)),
	daily: dailyResultSchema
});

export const vibrate = new PersistedState('zoodoku-vibrate', true);
export const audio = new PersistedState('zoodoku-audio', true);
export const barebones = new PersistedState('zoodoku-barebones', false);
export const colorBlind = new PersistedState('zoodoku-color-blind', false);
export const animations = new PersistedState('zoodoku-animations', true);
export const theme = new PersistedState<Theme>('zoodoku-theme', 'light');
export const seed = new PersistedState('zoodoku-seed', Math.floor(Math.random() * 1e8));
export const level = new PersistedState('zoodoku-level', 1);
export const dailyResult = new PersistedState<DailyResult>('zoodoku-daily-results', undefined);

function decodeSave(save: string) {
	// JSON.parse might throw an error if the decoded string isn't valid JSON
	// We can handle it by just returning an empty object if it threw an error (it'll fail validation later on)
	try {
		return JSON.parse(atob(save));
	} catch {
		return {};
	}
}

export function validateSave(save: Object | string) {
	return v.safeParse(saveSchema, typeof save === 'object' ? save : decodeSave(save)).success;
}

export function importSave(save: string) {
	const decoded = decodeSave(save);
	if (!validateSave(decoded)) return;
	vibrate.current = decoded.vibrate;
	audio.current = decoded.audio;
	barebones.current = decoded.barebones;
	colorBlind.current = decoded.colorBlind;
	animations.current = decoded.animations;
	theme.current = decoded.theme;
	seed.current = decoded.seed;
	level.current = decoded.level;
	dailyResult.current = decoded.daily;
}

export function exportSave(): string {
	return btoa(
		JSON.stringify({
			zoodoku: 1,
			vibrate: vibrate.current,
			audio: audio.current,
			barebones: barebones.current,
			colorBlind: colorBlind.current,
			animations: animations.current,
			theme: theme.current,
			seed: seed.current,
			level: level.current,
			daily: dailyResult.current
		})
	);
}

export function resetSave() {
	vibrate.current = true;
	audio.current = true;
	barebones.current = false;
	colorBlind.current = false;
	animations.current = true;
	theme.current = 'light';
	seed.current = Math.floor(Math.random() * 100000000);
	level.current = 1;
	dailyResult.current = undefined;
}
