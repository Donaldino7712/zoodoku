<script lang="ts">
	import { playSound } from '#lib/audio.ts';
	import ConfigOverlay from './ConfigOverlay.svelte';
	import Counter from './Counter.svelte';
	import Lives from './Lives.svelte';
	import PowerUp from '#lib/powerups/PowerUp.svelte';
	import checks from '#lib/powerups/checks.svg';
	import search from '#lib/powerups/search.svg';
	import crossrandom from '#lib/powerups/crossrandom.svg';
	import Zoodoku from './Zoodoku.svelte';
	import type { Board } from './index.svelte';

	let {
		board,
		animal,
		title,
		lives,
		max,
		shareText,
		instructions,
		highlight,
		onerror
	}: {
		board: Board;
		animal: string;
		title: string;
		lives: number;
		max: number;
		shareText?: string;
		instructions?: string;
		highlight?: { row: number; column: number };
		onerror?: () => void;
	} = $props();

	function discoverAnimal(): boolean {
		const discovered = board.discoverRandomAnimal();
		if (discovered) playSound('found');
		return discovered;
	}
</script>

<main class="mx-auto grid max-h-dvh min-h-dvh max-w-2xl grid-rows-[auto_auto_1fr]">
	<div class="grid grid-cols-[auto_1fr_auto] p-8">
		<div class="flex items-start">
			<button class="clicky rounded bg-layer p-2 drop-shadow" onclick={() => history.back()}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-chevron-left preview-icon"><path d="m15 18-6-6 6-6" /></svg
				>
				<span class="sr-only">Back</span>
			</button>
		</div>
		<div>
			<h2 class="text-center font-bold">{title}</h2>
			<Lives {lives} max={3} />
			<Counter found={board.found} {max} {animal} />
			{#if instructions}
				<p class="mx-auto mt-3 max-w-sm text-center text-sm">{instructions}</p>
			{/if}
		</div>
		<div class="flex items-start">
			<ConfigOverlay {shareText} />
		</div>
	</div>

	<div class="px-4">
		<Zoodoku {board} {onerror} {animal} {highlight} />
	</div>

	<div class="flex items-center justify-center gap-4">
		<PowerUp apply={() => board.applyRulesAsChecks()} cooldown={10} icon={checks} />
		<PowerUp apply={discoverAnimal} cooldown={30} icon={search} />
		<PowerUp apply={() => board.crossRandomCells(5)} cooldown={30} icon={crossrandom} />
	</div>
</main>
