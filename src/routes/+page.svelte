<script>
	import { level } from '#lib/config.svelte.ts';
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
</script>

<main class="mt-1/3 mx-auto flex min-h-dvh max-w-lg flex-col items-center p-8">
	<img src="/icons/icon.svg" alt="logo" class="size-2/3" />
	{#if browser}
		<button
			class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
			onclick={() => goto(`/L${level.current}`)}
		>
			Play: Level {level.current}
		</button>
		<div class="mt-6 grid w-full grid-cols-5 gap-1.5">
			{#each { length: level.current - 1 } as _, i}
				<button
					class="clicky rounded-lg border border-depress bg-layer py-4 text-center drop-shadow"
					onclick={() => goto(`/L${level.current - i - 1}`)}
				>
					{level.current - i - 1}
				</button>
			{/each}
		</div>
	{:else}
		<p class="mt-4">Loading...</p>
	{/if}
	<i class="mt-4 text-sm">
		Copyright © 2026 Ruby H.
		<a href="https://g.tizu.dev/zoodoku" class="underline">Source</a>
	</i>
</main>
