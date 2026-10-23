<script>
	import { level } from '#lib/config.svelte.ts';
	import { goto } from '$app/navigation';
</script>

<main class="flex min-h-dvh flex-col items-center justify-center p-8">
	<img src="/icons/icon.svg" alt="logo" class="size-2/3" />
	<button
		class="mt-4 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
		onclick={() => goto(`/L${level.current}`)}
	>
		Play: Level {level.current}
	</button>
</main>
