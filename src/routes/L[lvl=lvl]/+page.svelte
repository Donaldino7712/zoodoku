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

	let { params }: PageProps = $props();

	const boardSize = $derived.by(() => {
		if (params.lvl <= 6) return Math.max(params.lvl + 2, 4);
		const sizes = [8, 8, 8, 8, 7, 8, 6, 8, 5];
		return sizes[(params.lvl - 6) % sizes.length];
	});
	let board = $derived(Board.generateGame(boardSize, 1610612741 * params.lvl));

	let lives = $derived((params.lvl, 3));
</script>

<WinOverlay visible={board.won} next={params.lvl + 1} />
<LossOverlay
	visible={lives <= 0}
	retry={() => ((lives = 3), (board = Board.generateGame(boardSize, 1610612741 * params.lvl)))}
/>

<main class="mx-auto grid max-h-dvh min-h-dvh max-w-2xl grid-rows-[auto_auto_1fr]">
	<div class="p-8">
		<h2 class="text-center font-bold">Level {params.lvl}</h2>
		<Lives {lives} max={3} />
		<Counter found={board.found} max={boardSize} animal={getAnimal(params.lvl)} />
	</div>

	{#if board}
		<div class="px-4">
			<Zoodoku {board} onerror={() => lives--} animal={getAnimal(params.lvl)} />
		</div>
	{:else}
		<div class="p-4">Loading...</div>
	{/if}

	<div class="flex items-center justify-center gap-4">
		<PowerUp apply={() => board?.applyRulesAsChecks()} cooldown={10} icon={checks} />
		<PowerUp apply={() => board?.discoverRandomAnimal()} cooldown={30} icon={search} />
		<PowerUp apply={() => board?.crossRandomCells(5)} cooldown={30} icon={crossrandom} />
	</div>
	<div class="flex">
		<a href="/L{params.lvl - 1}" class="bg-layer p-4">prev</a>
		<a href="/L{params.lvl + 1}" class="bg-layer p-4">next</a>
	</div>
</main>
