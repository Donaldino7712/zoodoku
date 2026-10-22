<script lang="ts">
	import { draw, scale } from 'svelte/transition';
	import type { Cell } from './index.svelte';

	let {
		cell,
		hue,
		topLeft = false,
		topRight = false,
		bottomLeft = false,
		bottomRight = false,
		seed
	}: {
		cell: Cell;
		hue: number;
		topLeft?: boolean;
		topRight?: boolean;
		bottomLeft?: boolean;
		bottomRight?: boolean;
		seed: number;
	} = $props();

	let dblclick = $state(false);
	let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
	$effect(() => {
		if (dblclick) timeout = setTimeout(() => (dblclick = false), 300);
		else clearTimeout(timeout);
	});
</script>

<button
	style="background-color: hsl({hue} 46% 67%);"
	class={[
		'flex aspect-square size-full min-h-8 min-w-8 items-center',
		'relative clicky justify-center rounded-lg',
		(['misflagged', 'animal'] as (typeof cell.userstate)[]).includes(cell.userstate) && 'disabled',
		topLeft && 'rounded-tl-xl',
		topRight && 'rounded-tr-xl',
		bottomLeft && 'rounded-bl-xl',
		bottomRight && 'rounded-br-xl'
	]}
	onclick={() => {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		if (dblclick) cell.userstate = cell.animal ? 'animal' : 'misflagged';
		else cell.userstate = cell.userstate === 'crossed' ? undefined : 'crossed';
		dblclick = true;
	}}
>
	{#if cell.userstate === 'animal'}
		🐱
	{/if}
	{@render cross(cell.userstate === 'misflagged', 'text-error')}
	{@render cross(cell.userstate === 'crossed', 'text-white')}
</button>

{#snippet cross(shown: boolean, classes: string)}
	{#if shown}
		<svg
			class="pointer-events-none absolute size-2/3 {classes}"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
			stroke-linejoin="round"
			out:scale={{ duration: 300 }}
		>
			<path d="M18 6 6 18" in:draw={{ duration: 200 }} />
			<path d="m6 6 12 12" in:draw={{ delay: 100, duration: 200 }} />
		</svg>
	{/if}
{/snippet}
