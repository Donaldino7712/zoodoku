<script lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getAnimal } from '#lib/animals/index.ts';
	import {
		DAILY_SIZE,
		dailySeed,
		formatDailyTime,
		loadDailyResult,
		saveDailyResult,
		type DailyResult
	} from '#lib/daily.ts';
	import { Board } from '#lib/game/index.svelte.ts';
	import GameScreen from '#lib/game/GameScreen.svelte';
	import LossOverlay from '#lib/game/LossOverlay.svelte';
	import WinOverlay from '../L[lvl=lvl]/WinOverlay.svelte';
	import { playSound } from '#lib/audio.ts';

	type Generation = { status: 'loading' | 'ready' | 'error'; board?: Board; message?: string };
	const todaySeed = dailySeed();
	let completed = $state<DailyResult | undefined>(browser ? loadDailyResult() : undefined);
	let generation = $state<Generation>({ status: 'loading' });
	let lives = $state(3);
	let elapsed = $state(0);
	let startedAt = 0;
	let saved = false;

	$effect(() => {
		if (completed) return;
		let cancelled = false;
		Board.generateGame(DAILY_SIZE, todaySeed)
			.then((board) => {
				if (!cancelled) {
					generation = { status: 'ready', board };
					startedAt = Date.now();
				}
			})
			.catch((error: unknown) => {
				if (!cancelled)
					generation = {
						status: 'error',
						message: error instanceof Error ? error.message : 'Unable to generate today’s board'
					};
			});
		return () => (cancelled = true);
	});

	$effect(() => {
		if (generation.status !== 'ready' || saved) return;
		const timer = setInterval(() => (elapsed = Math.floor((Date.now() - startedAt) / 1000)), 1000);
		return () => clearInterval(timer);
	});

	$effect(() => {
		if (generation.status === 'ready' && generation.board?.won) finish('win');
	});

	function finish(result: 'win' | 'loss'): void {
		if (saved) return;
		saved = true;
		const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
		completed = saveDailyResult({ result, seconds });
	}

	function loseLife(): void {
		playSound('lose');
		lives -= 1;
		if (lives <= 0) finish('loss');
	}

	const shareText = $derived(
		completed?.result === 'win'
			? `I did today's Zoodoku in ${formatDailyTime(completed.seconds)}, winning ${completed.streak} day${
					completed.streak === 1 ? '' : 's'
				} in a row! ${page.url.origin}/daily`
			: `I tried today's Zoodoku. Can you do better? ${page.url.origin}/daily`
	);
</script>

{#if completed}
	<main
		class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center p-8 text-center"
	>
		<h1 class="text-3xl font-bold">
			{completed.result === 'win' ? 'Daily complete!' : 'Daily finished'}
		</h1>
		<p class="mt-3 text-xl">
			{completed.result === 'win'
				? `You did today's Zoodoku in ${formatDailyTime(completed.seconds)}!`
				: "Better luck with tomorrow's Zoodoku!"}
		</p>
		<p class="mt-4 font-bold">{completed.streak} day win streak</p>
		<p class="mt-2">Come back tomorrow to continue your streak!</p>
		<button
			class="mt-6 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
			onclick={() =>
				navigator.share?.({ text: shareText }) ?? navigator.clipboard.writeText(shareText)}
		>
			Share result
		</button>
		<button class="mt-3 w-full p-2 underline" onclick={() => goto('/')}>Back home</button>
	</main>
{:else if generation.status === 'ready' && generation.board}
	<WinOverlay
		visible={generation.board.won}
		next={0}
		customseed={true}
		retry={() => {}}
		dailyTime={formatDailyTime(elapsed)}
		dailyStreak={0}
		dailyShareText={shareText}
	/>
	<LossOverlay visible={lives <= 0} retry={() => {}} />
	<GameScreen
		board={generation.board}
		{lives}
		max={DAILY_SIZE}
		title="Daily BETA"
		animal={getAnimal(8)}
		onerror={loseLife}
		{shareText}
		backIsHome
		powerups={false}
	/>
{:else if generation.status === 'loading'}
	<main class="flex min-h-dvh items-center justify-center p-8">Generating today's Zoodoku...</main>
{:else}
	<main class="flex min-h-dvh flex-col items-center justify-center p-8 text-center">
		<p>{generation.message}</p>
	</main>
{/if}
