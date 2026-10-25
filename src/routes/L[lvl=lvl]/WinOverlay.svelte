<script lang="ts">
	import { playSound } from '#lib/audio.ts';
	import { level } from '#lib/config.svelte.ts';
	import { goto } from '$app/navigation';
	import { animations, barebones } from '#lib/config.svelte.ts';
	import { launchConfetti } from '#lib/effects.ts';
	import { untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let p: {
		next: number;
		visible: boolean;
		customseed: boolean;
		retry: () => void;
		dailyTime?: string;
		dailyStreak?: number;
		dailyShareText?: string;
	} = $props();

	const encouragement = [
		'Awesome',
		'Nice',
		'Well done',
		'Excellent',
		'Great job',
		'Amazing',
		'Perfect',
		'Brilliant',
		'Fantastic',
		'Impressive',
		'Congratulations',
		'You did it',
		'Victory',
		'Flawless',
		'Outstanding',
		'Incredible',
		'Beautiful',
		'Superb',
		'Not bad',
		'Too easy',
		'Legendary',
		'Nailed it',
		'Good game',
		'Success',
		'Unstoppable',
		'Smooth',
		'Clean',
		'Masterful',
		'On point',
		'Champion',
		'Pawsome'
	];
	let randomEncouragement = $state('');

	$effect(() => {
		if (!p.visible) return;
		let timeoutId = setTimeout(() => playSound('win'), 500);
		randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];
		if (!barebones.current)
			void launchConfetti({
				particleCount: 100,
				spread: 70,
				scalar: 2,
				origin: { y: 0.8 }
			});
		if (!p.customseed)
			level.current = Math.max(
				untrack(() => level.current),
				p.next
			);
		return () => {
			clearTimeout(timeoutId);
		};
	});
</script>

{#if p.visible}
	<div
		class="fixed inset-0 z-80 flex items-end justify-center bg-black/50 md:items-center"
		in:fade={{ delay: animations.current ? 500 : 0, duration: animations.current ? 400 : 0 }}
	>
		<div
			class="mb-8 min-w-2xs rounded-3xl bg-bg p-4"
			in:fly={{
				delay: animations.current ? 300 : 0,
				duration: animations.current ? 600 : 0,
				y: 50
			}}
		>
			<h3 class="mt-1 text-center text-2xl font-bold">{randomEncouragement}!</h3>
			{#if p.dailyTime}
				<p class="mt-2 text-center">Today's Zoodoku: <strong>{p.dailyTime}</strong></p>
				{#if p.dailyStreak}
					<p class="mt-1 text-center">{p.dailyStreak} day win streak</p>
				{/if}
				<button
					class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
					onclick={() =>
						p.dailyShareText &&
						(navigator.share?.({ text: p.dailyShareText }) ??
							navigator.clipboard.writeText(p.dailyShareText))}
				>
					Share
				</button>
			{/if}
			{#if !p.customseed}
				<button
					class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
					onclick={() => goto(`/L${p.next}`, { replace: true })}
				>
					Level {p.next}
				</button>
			{:else}
				<button
					class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
					onclick={() => goto(`/`)}
				>
					Play Zoodoku
				</button>
			{/if}
			<button class="mt-4 w-full text-center underline" onclick={() => p.retry()}>
				Play again
			</button>
		</div>
	</div>
{/if}
