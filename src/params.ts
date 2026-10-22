import { defineParams } from '@sveltejs/kit/params';
import * as v from 'valibot';

export const params = defineParams({
	lvl: v.pipe(v.string(), v.toNumber(), v.toMinValue(1))
});
