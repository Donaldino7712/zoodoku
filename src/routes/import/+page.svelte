<script lang="ts">
	import { importSave, validateSave } from '#lib/config.svelte.ts';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	if (!page.url.searchParams.has('d')) goto('/');

	let save = page.url.searchParams.get('d')!;
	let isValid = validateSave(save);

	function onimport() {
		importSave(save);
		goto('/', { replace: true });
	}
</script>

<div class="m-16 flex flex-col items-center justify-center gap-4">
	{#if isValid}
		<p>Are you sure you want to import?</p>
		<p class="font-extrabold text-error">You will lose all of your current progress!</p>
	{:else}
		<p class="font-bold">The save is malformed, unable to import</p>
	{/if}
	<div class="flex gap-4">
		{#if isValid}
			<button
				class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
				onclick={onimport}>Reset and import</button
			>
		{/if}
		<button
			class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
			onclick={() => goto('/', { replace: true })}>Cancel</button
		>
	</div>
</div>
