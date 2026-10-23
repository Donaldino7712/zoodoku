<script lang="ts">
	import { scale } from 'svelte/transition';
	import { barebones } from '#lib/config.svelte.ts';

	let { animal, found, max }: { animal: string; found: number; max: number } = $props();
</script>

<div class="mx-auto mt-4 flex w-fit justify-center gap-2 rounded-lg bg-layer p-2 drop-shadow">
	{#each { length: max } as _, i}
		<div class="relative">
			<div
				class="size-4 bg-depress"
				style="
					mask-image: url({`"${animal}"`});
					mask-size: contain;
					mask-repeat: no-repeat;
					mask-position: center;
				"
			></div>
			{#if i < found}
				<img
					src={animal}
					alt=""
					class="absolute inset-0 size-4"
					in:scale={{ duration: barebones.current ? 0 : 300, opacity: 1 }}
				/>
			{/if}
		</div>
	{/each}
</div>
