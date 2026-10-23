<script lang="ts">
	import { draw, scale } from 'svelte/transition';
	import type { Cell } from './index.svelte';
	import cat from '#lib/assets/cat.svg';

	let {
		cell,
		onTouchStart,
		hue,
		topLeft = false,
		topRight = false,
		bottomLeft = false,
		bottomRight = false,
		onerror
	}: {
		cell: Cell;
		onTouchStart: (event: TouchEvent) => void;
		hue: number;
		topLeft?: boolean;
		topRight?: boolean;
		bottomLeft?: boolean;
		bottomRight?: boolean;
		onerror?: () => void;
	} = $props();

	let suppressTouchClick = false;
	let suppressTouchClickTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastClickAt = 0;
	let clickTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastTouchAt = 0;
	let touchTimeout: ReturnType<typeof setTimeout> | undefined;

	function toggleCell(): void {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		cell.userstate = cell.userstate === 'crossed' ? undefined : 'crossed';
	}

	function handleTouchStart(event: TouchEvent): void {
		const now = Date.now();
		const isDoubleTap = now - lastTouchAt < 300;
		lastTouchAt = now;
		clearTimeout(touchTimeout);
		touchTimeout = setTimeout(() => (lastTouchAt = 0), 300);

		suppressTouchClick = true;
		clearTimeout(suppressTouchClickTimeout);
		suppressTouchClickTimeout = setTimeout(() => (suppressTouchClick = false), 500);
		onTouchStart(event);

		if (isDoubleTap && cell.userstate !== 'animal' && cell.userstate !== 'misflagged') {
			cell.userstate = cell.animal ? 'animal' : 'misflagged';
			if (!cell.animal) onerror?.();
		}
	}

	function handleClick(): void {
		if (suppressTouchClick) {
			suppressTouchClick = false;
			clearTimeout(suppressTouchClickTimeout);
			return;
		}

		const now = Date.now();
		if (now - lastClickAt < 300) {
			clearTimeout(clickTimeout);
			lastClickAt = 0;
			if (cell.userstate !== 'animal' && cell.userstate !== 'misflagged') {
				cell.userstate = cell.animal ? 'animal' : 'misflagged';
			}
			return;
		}

		toggleCell();
		lastClickAt = now;
		clearTimeout(clickTimeout);
		clickTimeout = setTimeout(() => (lastClickAt = 0), 300);
	}
</script>

<button
	style="background-color: hsl({hue} 46% 67%);"
	ontouchstart={handleTouchStart}
	class={[
		'flex aspect-square size-full min-h-8 min-w-8 items-center',
		'relative clicky justify-center rounded-lg',
		(['misflagged', 'animal'] as (typeof cell.userstate)[]).includes(cell.userstate) && 'disabled',
		topLeft && 'rounded-tl-xl',
		topRight && 'rounded-tr-xl',
		bottomLeft && 'rounded-bl-xl',
		bottomRight && 'rounded-br-xl'
	]}
	onclick={handleClick}
>
	{#if cell.userstate === 'animal'}
		<img src={cat} alt="Successfully found!" class="size-1/2" />
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
