<script lang="ts">
	import { getAnimal } from '#lib/animals/index.ts';
	import { Board } from '#lib/game/index.svelte.ts';
	import GameScreen from '#lib/game/GameScreen.svelte';
	import type { PageProps } from './$types';
	import LossOverlay from '#lib/game/LossOverlay.svelte';
	import WinOverlay from './WinOverlay.svelte';
	import { page } from '$app/state';
	import { playSound } from '#lib/audio.ts';
	import { seed } from '#lib/config.svelte.ts';

	const typicalGenerationAttempts = 5_000;

	let { params }: PageProps = $props();

	let usedseed = $state(parseInt(page.url.searchParams.get('s')!) || seed.current);

	const boardSize = $derived.by(() => {
		if (params.lvl <= 5) return params.lvl + 3;
		const sizes = [8, 8, 8, 8, 7, 8, 6, 8, 5];
		return sizes[(params.lvl - 6) % sizes.length];
	});
	type GenerationState =
		| { status: 'loading'; attempts: number }
		| { status: 'ready'; board: Board }
		| { status: 'error'; message: string };

	let generation = $state<GenerationState>({ status: 'loading', attempts: 0 });
	let retryCount = $state(0);

	let lives = $derived((params.lvl, 3));

	$effect(() => {
		retryCount;
		let cancelled = false;
		generation = { status: 'loading', attempts: 0 };

		Board.generateGame(boardSize, usedseed * params.lvl, (progress) => {
			if (!cancelled) generation = { status: 'loading', attempts: progress.attempts };
		})
			.then((board) => {
				if (!cancelled) generation = { status: 'ready', board };
			})
			.catch((error: unknown) => {
				if (!cancelled)
					generation = {
						status: 'error',
						message: error instanceof Error ? error.message : 'Unable to generate this board'
					};
			});

		return () => {
			cancelled = true;
		};
	});

	function retry(): void {
		lives = 3;
		retryCount += 1;
	}

	function progressPercent(attempts: number): number {
		if (attempts <= typicalGenerationAttempts)
			return (Math.log1p(attempts) / Math.log1p(typicalGenerationAttempts)) * 98;

		const tailProgress =
			(Math.log1p(attempts) - Math.log1p(typicalGenerationAttempts)) /
			(Math.log1p(Board.maxGenerationAttempts) - Math.log1p(typicalGenerationAttempts));
		return 98 + tailProgress * 2;
	}
</script>

{#if generation.status === 'ready'}
	<WinOverlay
		visible={generation.board.won}
		next={params.lvl + 1}
		customseed={page.url.searchParams.has('s')}
		{retry}
	/>
	<LossOverlay visible={lives <= 0} {retry} />

	<GameScreen
		board={generation.board}
		{lives}
		max={boardSize}
		title={`Level ${params.lvl}`}
		animal={getAnimal(params.lvl)}
		onerror={() => (playSound('lose'), lives--)}
		shareText={`Try solving my level ${params.lvl} of Zoodoku! https://${window.location.hostname}/L${params.lvl}?s=${seed.current}`}
	/>
{:else if generation.status === 'loading'}
	<main class="mx-auto flex min-h-dvh max-w-2xl items-center justify-center p-8">
		<div class="w-full max-w-sm text-center">
			<div
				class="mt-4 h-3 overflow-hidden rounded-full bg-layer"
				role="progressbar"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={progressPercent(generation.attempts)}
			>
				<div
					class="h-full rounded-full bg-text transition-[width] duration-150"
					style={`width: ${progressPercent(generation.attempts)}%`}
				></div>
			</div>
		</div>
	</main>
{:else}
	<main class="mx-auto flex min-h-dvh max-w-2xl items-center justify-center p-8">
		<div class="text-center">
			<p class="text-red-600">{generation.message}</p>
			<button class="mt-4 underline" onclick={retry}>Try again</button>
		</div>
	</main>
{/if}
