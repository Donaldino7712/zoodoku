<script lang="ts">
	import { getAnimal } from '#lib/animals/index.ts';
	import { Board } from '#lib/game/index.svelte.ts';
	import Zoodoku from '#lib/game/Zoodoku.svelte';
	import type { PageProps } from './$types';
	import Counter from './Counter.svelte';
	import Lives from './Lives.svelte';
	import LossOverlay from './LossOverlay.svelte';
	import PowerUp from '#lib/powerups/PowerUp.svelte';
	import checks from '#lib/powerups/checks.svg';
	import search from '#lib/powerups/search.svg';
	import crossrandom from '#lib/powerups/crossrandom.svg';
	import WinOverlay from './WinOverlay.svelte';
	import { playSound } from '#lib/audio.ts';
	import { seed } from '#lib/config.svelte.ts';
	import ConfigOverlay from './ConfigOverlay.svelte';
	import { page } from '$app/state';

	let { params }: PageProps = $props();

	let usedseed = $state(parseInt(page.url.searchParams.get('s')!) || seed.current);

	const boardSize = $derived.by(() => {
		if (params.lvl <= 5) return params.lvl + 3;
		const sizes = [8, 8, 8, 8, 7, 8, 6, 8, 5];
		return sizes[(params.lvl - 6) % sizes.length];
	});
	let board = $derived(Board.generateGame(boardSize, usedseed * params.lvl));

	let lives = $derived((params.lvl, 3));

	function discoverAnimal(): boolean {
		const discovered = board?.discoverRandomAnimal() ?? false;
		if (discovered) playSound('found');
		return discovered;
	}
</script>

<WinOverlay
	visible={board.won}
	next={params.lvl + 1}
	customseed={page.url.searchParams.has('s')}
	retry={() => ((lives = 3), (board = Board.generateGame(boardSize, usedseed * params.lvl)))}
/>
<LossOverlay
	visible={lives <= 0}
	retry={() => ((lives = 3), (board = Board.generateGame(boardSize, usedseed * params.lvl)))}
/>

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
			<h2 class="text-center font-bold">Level {params.lvl}</h2>
			<Lives {lives} max={3} />
			<Counter found={board.found} max={boardSize} animal={getAnimal(params.lvl)} />
		</div>
		<div class="flex items-start">
			<ConfigOverlay currentLevel={params.lvl} />
		</div>
	</div>

	{#if board}
		<div class="px-4">
			<Zoodoku
				{board}
				onerror={() => (playSound('lose'), lives--)}
				animal={getAnimal(params.lvl)}
			/>
		</div>
	{:else}
		<div class="p-4">Loading...</div>
	{/if}

	<div class="flex items-center justify-center gap-4">
		<PowerUp apply={() => board?.applyRulesAsChecks()} cooldown={10} icon={checks} />
		<PowerUp apply={discoverAnimal} cooldown={30} icon={search} />
		<PowerUp apply={() => board?.crossRandomCells(5)} cooldown={30} icon={crossrandom} />
	</div>
</main>
