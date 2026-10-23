<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
import { barebones, theme } from '#lib/config.svelte.ts';

	let { children }: LayoutProps = $props();

	function detectForcedDarkMode() {
		if (
			!navigator.userAgent.match(/Samsung/i) ||
			!window.matchMedia ||
			window.matchMedia('(prefers-color-scheme:dark)').matches
		)
			return false;
		const ctx = document.createElement('canvas').getContext('2d');
		if (!ctx) return false;
		const img = new Image();
		img.src =
			'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
		if (!img.complete) img.dispatchEvent(new Event('load'));
		ctx.drawImage(img, 0, 0);
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		return (r & b & g) < 255;
	}

	$effect(() => {
		document.documentElement.classList.toggle('dark', theme.current === 'dark');
		document.documentElement.classList.toggle('dark-ctp', theme.current === 'dark-ctp');
		document.documentElement.classList.toggle('barebones', barebones.current);

		const backgroundColor = getComputedStyle(document.documentElement)
			.getPropertyValue('--color-bg')
			.trim();
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', backgroundColor);
	});
</script>

<svelte:head>
	<link rel="icon" href="/icons/icon.svg" />
	<meta name="theme-color" content="#f7e9d1" />
	<meta name="description" content="please play my game (^v^)~" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Zoodoku" />
	<meta property="og:description" content="please play my game (^v^)~" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={`${page.url.origin}/icons/icon-512.png`} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Zoodoku" />
	<meta name="twitter:description" content="please play my game (^v^)~" />
	<meta name="twitter:image" content={`${page.url.origin}/icons/icon-512.png`} />
	<title>Zoodoku</title>
</svelte:head>

{#if detectForcedDarkMode()}
	<main class="flex min-h-dvh flex-col items-center justify-center p-4">
		<p>
			Sorry, but due to a bug in Samsung Browser which messes up colors, this game is practically
			unplayable. Please use a different browser, like Chrome. Alternatively, disable dark mode and
			refresh the page.
		</p>
	</main>
{:else}
	{@render children()}
{/if}
