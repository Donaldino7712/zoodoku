<script lang="ts">
	import { scale } from 'svelte/transition';

	let p: { apply: () => boolean; cooldown: number; icon: string } = $props();

	let cooldownLeft = $state(0);
	let timeout = $state<ReturnType<typeof setInterval>>();

	$effect(() => {
		timeout = setInterval(() => cooldownLeft > 0 && cooldownLeft--, 1000);
		return () => clearInterval(timeout);
	});
</script>

<button
	onclick={() => {
		if (p.apply()) cooldownLeft = p.cooldown;
	}}
	disabled={cooldownLeft > 0}
	class="relative clicky rounded-lg bg-layer p-4 drop-shadow"
	aria-label="Use ability"
>
	{#if cooldownLeft > 0}
		<div
			class={[
				'absolute -bottom-3 mx-auto h-6 w-10 items-center justify-center',
				'inset-x-0 z-10 flex rounded-full bg-depress drop-shadow'
			]}
			transition:scale
		>
			{cooldownLeft}
		</div>
	{/if}
	<div
		class="size-8 bg-text"
		style="mask-image: url({`"${p.icon}"`}); mask-size: contain; mask-repeat: no-repeat;"
	></div>
</button>
