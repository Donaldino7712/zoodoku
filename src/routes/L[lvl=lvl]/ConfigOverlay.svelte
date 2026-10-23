<script lang="ts">
	import { audio, theme, vibrate } from '#lib/config.svelte.ts';
	import { fade } from 'svelte/transition';

	let visible = $state(false);

	function toggle(setting: { current: boolean }): void {
		setting.current = !setting.current;
	}
</script>

<button class="clicky rounded bg-layer p-2 drop-shadow" onclick={() => (visible = true)}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="lucide lucide-cog preview-icon"
		><path d="M11 10.27 7 3.34" /><path d="m11 13.73-4 6.93" /><path d="M12 22v-2" /><path
			d="M12 2v2"
		/><path d="M14 12h8" /><path d="m17 20.66-1-1.73" /><path d="m17 3.34-1 1.73" /><path
			d="M2 12h2"
		/><path d="m20.66 17-1.73-1" /><path d="m20.66 7-1.73 1" /><path d="m3.34 17 1.73-1" /><path
			d="m3.34 7 1.73 1"
		/><circle cx="12" cy="12" r="2" /><circle cx="12" cy="12" r="8" /></svg
	>
	<span class="sr-only">Settings</span>
</button>

{#if visible}
	<div
		class="absolute inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div class="flex min-w-2xs flex-col gap-3 rounded-3xl bg-bg p-4">
			<button
				class="ml-auto clicky rounded-lg bg-layer p-2 drop-shadow"
				onclick={() => (visible = false)}
				aria-label="Close settings"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-x preview-icon"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
				>
				<span class="sr-only">Close</span>
			</button>

			<div class="flex flex-col gap-2">
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(audio)}
					aria-pressed={audio.current}
				>
					<span>Audio</span>
					<span class="font-semibold">{audio.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(vibrate)}
					aria-pressed={vibrate.current}
				>
					<span>Vibrate</span>
					<span class="font-semibold">{vibrate.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => (theme.current = theme.current === 'dark' ? 'light' : 'dark')}
				>
					<span>Theme</span>
					<span class="font-semibold">{theme.current === 'dark' ? 'Dark' : 'Light'}</span>
				</button>
			</div>
		</div>
	</div>
{/if}
