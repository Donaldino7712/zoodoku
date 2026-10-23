<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';

	let p: { retry: () => void; visible: boolean } = $props();

	const encouragement = [
		'Nice try',
		'Almost',
		'Not quite',
		'Better luck next time',
		'Keep trying',
		'So close',
		'Unlucky',
		'Try again',
		'Close one',
		'You got this',
		'Next time',
		'Keep going',
		'Not today',
		'Good effort',
		'Room to improve',
		'Tough luck',
		'Defeat',
		'Game over',
		'Well played',
		'Could be worse',
		'One more try',
		'Back at it',
		'Stay focused',
		'Learn and adapt',
		'It happens'
	];
	let randomEncouragement = $state('');

	$effect(() => {
		if (!p.visible) return;
		randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];
	});
</script>

{#if p.visible}
	<div
		class="absolute inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		in:fade
	>
		<div class="min-w-2xs rounded-3xl bg-bg p-4" in:scale>
			<h3 class="mt-1 text-center text-2xl font-bold text-error">{randomEncouragement}</h3>
			<button
				class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
				onclick={p.retry}
			>
				Retry
			</button>
		</div>
	</div>
{/if}
