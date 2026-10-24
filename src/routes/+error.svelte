<script>
	import { browser } from '$app/env';
</script>

<main class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center p-8">
	<p>Something went wrong :(</p>
	{#if browser}
		<p class="text-sm text-depress">
			{#if window.matchMedia('(display-mode: standalone)').matches}
				Please restart Zoodoku.
			{:else}
				Try refreshing the page or going back <button
					class="underline"
					onclick={() => (window.location.href = '/')}
				>
					home
				</button>.
			{/if}
		</p>
	{/if}
</main>
