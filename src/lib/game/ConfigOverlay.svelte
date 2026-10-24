<script lang="ts">
	import { animations, audio, barebones, colorBlind, theme, vibrate } from '#lib/config.svelte.ts';
	import { Cog } from '@lucide/svelte';
	import { fade } from 'svelte/transition';

	let { shareText }: { shareText?: string } = $props();
	let visible = $state(false);

	function toggle(setting: { current: boolean }): void {
		setting.current = !setting.current;
	}
</script>

<button class="clicky rounded bg-layer p-2 drop-shadow" onclick={() => (visible = true)}>
	<Cog />
	<span class="sr-only">Settings</span>
</button>

{#if visible}
	<div
		class="absolute inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: animations.current ? 200 : 0 }}
	>
		<div class="flex min-w-2xs flex-col gap-3 rounded-3xl bg-bg p-4">
			<button
				class="ml-auto clicky rounded-lg bg-layer p-2 drop-shadow"
				onclick={() => (visible = false)}
				aria-label="Close settings"
			>
				<span aria-hidden="true">×</span>
				<span class="sr-only">Close</span>
			</button>

			<div class="flex flex-col gap-2">
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(audio)}
					aria-pressed={audio.current}
				>
					<span>Audio</span><span class="font-semibold">{audio.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(vibrate)}
					aria-pressed={vibrate.current}
				>
					<span>Vibrate</span><span class="font-semibold">{vibrate.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(barebones)}
					aria-pressed={barebones.current}
				>
					<span>Performance</span>
					<span class="font-semibold">{barebones.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(colorBlind)}
					aria-pressed={colorBlind.current}
				>
					<span>Color blind mode</span>
					<span class="font-semibold">{colorBlind.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => toggle(animations)}
					aria-pressed={animations.current}
				>
					<span>Animations</span>
					<span class="font-semibold">{animations.current ? 'On' : 'Off'}</span>
				</button>
				<button
					class="flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
					onclick={() => {
						const next = { light: 'dark', dark: 'dark-ctp', 'dark-ctp': 'light' } as const;
						theme.current = next[theme.current];
					}}
				>
					<span>Theme</span>
					<span class="font-semibold"
						>{({ dark: 'Dark', light: 'Light', 'dark-ctp': 'Catppuccin' } as const)[
							theme.current
						]}</span
					>
				</button>

				{#if shareText && navigator.canShare?.({ text: shareText })}
					<button
						class="mt-4 flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
						onclick={() => navigator.share({ text: shareText })}
					>
						Share this level
					</button>
				{:else if shareText}
					<button
						class="mt-4 flex clicky items-center justify-between rounded-lg border border-depress bg-layer p-3 text-left"
						onclick={() => navigator.clipboard.writeText(shareText)}
					>
						Copy share text
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
