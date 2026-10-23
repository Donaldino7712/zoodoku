<script lang="ts">
	import { scale } from 'svelte/transition';
	import { Heart } from '@lucide/svelte';

	let { lives, max }: { lives: number; max: number } = $props();
</script>

<div class="flex justify-center">
	{#each { length: max } as _, i}
		<div class="relative">
			<Heart class="size-8 text-text" />
			{#if i < lives}
				<div class="absolute inset-0 size-8" out:scale={{ duration: 300, opacity: 1 }}>
					<Heart class="size-8 text-error" fill="currentColor" />
				</div>
			{/if}
		</div>
	{/each}
</div>
