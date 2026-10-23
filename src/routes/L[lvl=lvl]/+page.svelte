<script lang="ts">
	import { Board } from '#lib/game/index.svelte.ts';
	import Zoodoku from '#lib/game/Zoodoku.svelte';
	import type { PageProps } from './$types';
	import Lives from './Lives.svelte';

	let { params }: PageProps = $props();

	const boardSize = $derived.by(() => {
		if (params.lvl <= 6) return Math.max(params.lvl + 2, 4);
		const sizes = [8, 8, 8, 8, 7, 8, 6, 8, 5];
		return sizes[(params.lvl - 6) % sizes.length];
	});
	let board = $derived(Board.generateGame(boardSize, 1610612741 * params.lvl));

	let lives = $state(3);
</script>

<h2 class="pt-8 text-center font-bold">Level {params.lvl}</h2>
<Lives {lives} max={3} />

{#if board}
	<div class="p-4">
		<Zoodoku {board} onerror={() => lives--} />
	</div>

	<button class="bg-amber-200 p-4" onclick={() => board?.applyRulesAsChecks()}>apply rules</button>

	<a href="/L{params.lvl - 1}" class="bg-amber-200 p-4">prev</a>
	<a href="/L{params.lvl + 1}" class="bg-amber-200 p-4">next</a>
{:else}
	<div class="p-4">Loading...</div>
{/if}
