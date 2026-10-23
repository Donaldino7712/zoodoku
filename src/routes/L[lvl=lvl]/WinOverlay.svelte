<script lang="ts">
	import { playSound } from '#lib/audio.ts';
	import { level } from '#lib/config.svelte.ts';
	import { goto } from '$app/navigation';
	import { confetti } from '@tsparticles/confetti';
	import { untrack } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	let p: { next: number; visible: boolean } = $props();

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
		'Champion'
	];
	let randomEncouragement = $state('');

	$effect(() => {
		if (!p.visible) return;
		setTimeout(() => playSound('win'), 500);
		randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];
		confetti({
			particleCount: 100,
			spread: 70,
			scalar: 2,
			origin: { y: 0.8 }
		});
		level.current = Math.max(
			untrack(() => level.current),
			p.next
		);
	});
</script>

{#if p.visible}
	<div
		class="absolute inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		in:fade={{ delay: 800 }}
	>
		<div class="min-w-2xs rounded-3xl bg-bg p-4" in:scale={{ delay: 300 }}>
			<h3 class="mt-1 text-center text-2xl font-bold">{randomEncouragement}!</h3>
			<button
				class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
				onclick={() => goto(`/L${p.next}`, { replace: true })}
			>
				Level {p.next}
			</button>
		</div>
	</div>
{/if}
