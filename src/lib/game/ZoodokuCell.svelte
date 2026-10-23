<script lang="ts">
	import { confetti } from '@tsparticles/confetti';
	import { draw, scale } from 'svelte/transition';
	import type { Cell } from './index.svelte';
	import { backOut } from 'svelte/easing';
	import { playSound } from '#lib/audio.ts';

	let {
		cell,
		onTouchStart,
		hue,
		topLeft = false,
		topRight = false,
		bottomLeft = false,
		bottomRight = false,
		onerror,
		animal
	}: {
		cell: Cell;
		onTouchStart: (event: TouchEvent) => void;
		hue: number;
		topLeft?: boolean;
		topRight?: boolean;
		bottomLeft?: boolean;
		bottomRight?: boolean;
		onerror?: () => void;
		animal: string;
	} = $props();

	let suppressTouchClick = false;
	let suppressTouchClickTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastClickAt = 0;
	let clickTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastTouchAt = 0;
	let touchTimeout: ReturnType<typeof setTimeout> | undefined;

	let el = $state<HTMLButtonElement>();
	function toggleCell(): void {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		if (cell.userstate !== 'crossed') playSound('scribble');
		cell.userstate = cell.userstate === 'crossed' ? undefined : 'crossed';
	}

	function markCell(): void {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		cell.userstate = cell.animal ? 'animal' : 'misflagged';
		if (cell.animal) {
			playSound('found');
		}
		if (cell.animal && el) {
			const rect = el.getBoundingClientRect();
			confetti({
				particleCount: 12,
				startVelocity: 10,
				ticks: 100,
				spread: 360,
				origin: {
					y: (rect.top + rect.height / 2) / window.innerHeight,
					x: (rect.left + rect.width / 2) / window.innerWidth
				}
			});
		}
		if (!cell.animal) onerror?.();
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

		if (isDoubleTap) markCell();
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
			markCell();
			return;
		}

		toggleCell();
		lastClickAt = now;
		clearTimeout(clickTimeout);
		clickTimeout = setTimeout(() => (lastClickAt = 0), 300);
	}
</script>

<button
	style="background-color: hsl({hue} var(--cell-sat) var(--cell-lum));"
	ontouchstart={handleTouchStart}
	class={[
		'flex aspect-square size-full min-h-4 min-w-4 items-center',
		'relative clicky justify-center rounded-lg',
		topLeft && 'rounded-tl-xl',
		topRight && 'rounded-tr-xl',
		bottomLeft && 'rounded-bl-xl',
		bottomRight && 'rounded-br-xl'
	]}
	disabled={cell.userstate === 'animal' || cell.userstate === 'misflagged'}
	onclick={handleClick}
	bind:this={el}
>
	{#if cell.userstate === 'animal'}
		<img
			src={animal}
			alt="Successfully found!"
			class="pointer-events-none absolute size-3/4"
			in:scale={{ duration: 300, easing: backOut }}
			out:scale={{ duration: 300 }}
		/>
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
