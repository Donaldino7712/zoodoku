import { PersistedState } from 'runed';
import * as v from 'valibot';

const themeSchema = v.union([v.literal('light'), v.literal('dark'), v.literal('dark-ctp')]);
type Theme = v.InferInput<typeof themeSchema>;

const dailyResultSchema = v.nullable(
	v.object({
		date: v.pipe(v.string(), v.isoDate(), v.minValue('2026-01-01')),
		result: v.union([v.literal('win'), v.literal('loss')]),
		seconds: v.pipe(v.number(), v.gtValue(0)),
		streak: v.pipe(v.number(), v.gtValue(0))
	})
);
export type DailyResult = v.InferInput<typeof dailyResultSchema>;

const saveSchema = v.union([
	v.object({
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
	}),
	v.tuple([
		v.pipe(v.number(), v.literal(2)), // zoodoku
		v.boolean(), // vibrate
		v.boolean(), // audio
		v.boolean(), // barebones
		v.boolean(), // colorBlind
		v.boolean(), // animations
		themeSchema, // theme
		v.pipe(v.number(), v.minValue(1), v.maxValue(1e8)), // seed
		v.pipe(v.number(), v.gtValue(0)), // level
		dailyResultSchema, // daily
		v.pipe(v.number(), v.minValue(8), v.maxValue(12)) // maxsize
	])
]);

export const vibrate = new PersistedState('zoodoku-vibrate', true);
export const audio = new PersistedState('zoodoku-audio', true);
export const barebones = new PersistedState('zoodoku-barebones', false);
export const colorBlind = new PersistedState('zoodoku-color-blind', false);
export const animations = new PersistedState('zoodoku-animations', true);
export const maxsize = new PersistedState('zoodoku-maxsize', 8);
export const theme = new PersistedState<Theme>('zoodoku-theme', 'light');
export const seed = new PersistedState('zoodoku-seed', Math.floor(Math.random() * 1e8));
export const level = new PersistedState('zoodoku-level', 1);
export const dailyResult = new PersistedState<DailyResult>('zoodoku-daily-results', null);

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
	const decoded = decodeSave(save) as v.InferOutput<typeof saveSchema>;
	if (!validateSave(decoded)) return;
	if ('zoodoku' in decoded) {
		// v1
		vibrate.current = decoded.vibrate;
		audio.current = decoded.audio;
		barebones.current = decoded.barebones;
		colorBlind.current = decoded.colorBlind;
		animations.current = decoded.animations;
		theme.current = decoded.theme;
		seed.current = decoded.seed;
		level.current = decoded.level;
		dailyResult.current = decoded.daily ?? null;
		return;
	}
	if (decoded[0] === 2) {
		vibrate.current = decoded[1];
		audio.current = decoded[2];
		barebones.current = decoded[3];
		colorBlind.current = decoded[4];
		animations.current = decoded[5];
		theme.current = decoded[6];
		seed.current = decoded[7];
		level.current = decoded[8];
		dailyResult.current = decoded[9] ?? null;
		maxsize.current = decoded[10];
		return;
	}
}

export function exportSave(): string {
	return btoa(
		JSON.stringify([
			2,
			vibrate.current,
			audio.current,
			barebones.current,
			colorBlind.current,
			animations.current,
			theme.current,
			seed.current,
			level.current,
			dailyResult.current ?? null,
			maxsize.current
		] satisfies v.InferInput<typeof saveSchema>)
	);
}

export function resetSave() {
	vibrate.current = true;
	audio.current = true;
	barebones.current = false;
	colorBlind.current = false;
	animations.current = true;
	maxsize.current = 8;
	theme.current = 'light';
	seed.current = Math.floor(Math.random() * 100000000);
	level.current = 1;
	dailyResult.current = null;
}
