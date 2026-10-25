<script lang="ts">
	import { animations, exportProgress, importProgress, resetProgress } from '#lib/config.svelte.ts';
	import { fade } from 'svelte/transition';

	let { managementVisible = $bindable() }: { managementVisible: boolean } = $props();
	let resetClicked = $state(false);
	let exportClicked = $state(false);
	let timeout = $state(-1);

	function onexport() {
	    navigator.clipboard.writeText(`https://${window.location.hostname}/import?d=${exportProgress()}`)
		exportClicked = true;
		if (timeout !== -1) clearTimeout(timeout);
		timeout = setTimeout(() => (exportClicked = false), 1.5e3);
	}

	function onreset() {
	    resetClicked = !resetClicked;
		if (!resetClicked) resetProgress();
	}
</script>

{#if managementVisible}
	<div
		class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: animations.current ? 200 : 0 }}
	>
		<div class="flex min-w-2xs flex-col gap-3 rounded-3xl bg-bg p-4">
    		<div class="flex items-center w-full justify-center">
    		    <p class="absolute left-1/2 -translate-x-1/2 font-semibold"> Manage progress </p>
    			<button
    				class="ml-auto clicky rounded-lg bg-layer p-2 drop-shadow"
    				onclick={() => (managementVisible = false)}
    				aria-label="Close settings"
    			>
    				<span aria-hidden="true">×</span>
    				<span class="sr-only">Close</span>
    			</button>
    		</div>

			<div class="flex flex-col">
           	    <button
         			class="mt-4 flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-center"
         			onclick={onexport}
          		>
         			{exportClicked ? "Copied!" : "Export"}
          		</button>
           	    <button
         			class="mt-4 flex clicky items-center justify-between rounded-lg border border-error bg-error p-3 text-center"
         			onclick={onreset}
          		>
         			{resetClicked ? "Are you sure?" : "Reset progress"}
          		</button>
			</div>
		</div>
	</div>
{/if}
