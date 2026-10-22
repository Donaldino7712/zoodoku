<script lang="ts">
	import { Board } from '#lib/game/index.svelte.ts';
	import Zoodoku from '#lib/game/Zoodoku.svelte';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	let board = $state<Board>();
	onMount(async () => {
		board = Board.generateGame(8, 1610612741 * params.lvl);
	});
</script>

<h2 class="pt-8 text-center font-bold">Level {params.lvl}</h2>

{#if board}
	<div class="p-4">
		<Zoodoku {board} />
	</div>

	<button class="bg-amber-200 p-4" onclick={() => board?.applyRulesAsChecks()}>apply rules</button>
{:else}
	<div class="p-4">Loading...</div>
{/if}
