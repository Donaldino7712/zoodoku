<script lang="ts">
	import { Board } from '#lib/game/index.svelte.ts';
	import Zoodoku from '#lib/game/Zoodoku.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const SEED = 1610612741; // idk this is some large prime
</script>

{params.lvl}

<div class="p-4">
	<Zoodoku board={Board.generateGame(4, SEED * params.lvl)} />
</div>

<div class="p-4">
	<Zoodoku board={Board.generateGame(8, SEED * params.lvl)} />
</div>
