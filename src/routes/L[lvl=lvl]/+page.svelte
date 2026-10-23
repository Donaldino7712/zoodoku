<script lang="ts">
	import { getAnimal } from '#lib/animals/index.ts';
	import { Board } from '#lib/game/index.svelte.ts';
	import GameScreen from '#lib/game/GameScreen.svelte';
	import type { PageProps } from './$types';
	import LossOverlay from './LossOverlay.svelte';
	import WinOverlay from './WinOverlay.svelte';
	import { page } from '$app/state';
	import { playSound } from '#lib/audio.ts';
	import { seed } from '#lib/config.svelte.ts';

	let { params }: PageProps = $props();

	let usedseed = $state(parseInt(page.url.searchParams.get('s')!) || seed.current);

	const boardSize = $derived.by(() => {
		if (params.lvl <= 5) return params.lvl + 3;
		const sizes = [8, 8, 8, 8, 7, 8, 6, 8, 5];
		return sizes[(params.lvl - 6) % sizes.length];
	});
	let board = $derived(Board.generateGame(boardSize, usedseed * params.lvl));

	let lives = $derived((params.lvl, 3));

	function retry(): void {
		lives = 3;
		board = Board.generateGame(boardSize, usedseed * params.lvl);
	}
</script>

<WinOverlay
	visible={board.won}
	next={params.lvl + 1}
	customseed={page.url.searchParams.has('s')}
	{retry}
/>
<LossOverlay visible={lives <= 0} {retry} />

<GameScreen
	{board}
	{lives}
	max={boardSize}
	title={`Level ${params.lvl}`}
	animal={getAnimal(params.lvl)}
	onerror={() => (playSound('lose'), lives--)}
	shareText={`Try solving my level ${params.lvl} of Zoodoku! https://${window.location.hostname}/L${params.lvl}?s=${seed.current}`}
/>
