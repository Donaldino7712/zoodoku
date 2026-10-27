<script lang="ts">
	import { playSound } from '#lib/audio.ts';
	import { ChevronLeft, Dices, Grid2X2Check, Home, Search } from '@lucide/svelte';
	import ConfigOverlay from './ConfigOverlay.svelte';
	import Counter from './Counter.svelte';
	import Lives from './Lives.svelte';
	import PowerUp from './PowerUp.svelte';
	import Zoodoku from './Zoodoku.svelte';
	import type { Board } from './index.svelte';
	import { goto } from '$app/navigation';

	let {
		board,
		animal,
		title,
		lives,
		max,
		shareText,
		instructions,
		highlight,
		onerror,
		backIsHome,
		powerups = true
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
		backIsHome?: boolean;
		powerups?: boolean;
	} = $props();

	function discoverAnimal(): boolean {
		const discovered = board.discoverRandomAnimal();
		if (discovered) playSound('found');
		return discovered;
	}
</script>

<main class="mx-auto grid max-h-dvh min-h-dvh max-w-2xl grid-rows-[auto_auto_1fr]">
	<div class="flex justify-center p-8">
		<div class="absolute top-4 left-4">
			{#if !backIsHome}
				<button class="clicky rounded bg-layer p-2 drop-shadow" onclick={() => history.back()}>
					<ChevronLeft />
					<span class="sr-only">Back</span>
				</button>
			{:else}
				<button class="clicky rounded bg-layer p-2 drop-shadow" onclick={() => goto('/')}>
					<Home />
					<span class="sr-only">Home</span>
				</button>
			{/if}
		</div>
		<div>
			<h2 class="text-center font-bold">{title}</h2>
			<Lives {lives} max={3} />
			<Counter found={board.found} {max} {animal} />
			{#if instructions}
				<p class="mx-auto mt-3 max-w-sm text-center text-sm">{instructions}</p>
			{/if}
		</div>
		<div class="absolute top-4 right-4">
			<ConfigOverlay {shareText} />
		</div>
	</div>

	<div class="px-4">
		<Zoodoku {board} {onerror} {animal} {highlight} />
	</div>

	{#if powerups}
		<div class="flex items-center justify-center gap-4 py-4">
			<PowerUp apply={() => board.applyRulesAsChecks()} cooldown={10} icon={Grid2X2Check} />
			<PowerUp apply={discoverAnimal} cooldown={30} icon={Search} />
			<PowerUp apply={() => board.crossRandomCells(5)} cooldown={30} icon={Dices} />
		</div>
	{/if}
</main>
