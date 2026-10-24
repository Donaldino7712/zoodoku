import { self } from '$app/service-worker';
import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { resolve } from '$app/paths';

const staticCache = `zoodoku-static-${version}`;
const runtimeCache = `zoodoku-runtime-${version}`;
const root = resolve('/');
const precache = [root, ...[...immutable, ...assets, ...prerendered].map(({ path }) => path)];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(staticCache)
			.then((cache) => cache.addAll(precache))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(key) => key.startsWith('zoodoku-') && ![staticCache, runtimeCache].includes(key)
						)
						.map((key) => caches.delete(key))
				)
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const copy = response.clone();
					event.waitUntil(
						caches.open(runtimeCache).then((cache) => cache.put(event.request, copy))
					);
					return response;
				})
				.catch(async () => {
					const response = await caches.match(event.request);
					if (response) return response;
					const fallback = await caches.match(root);
					return fallback ?? new Response('Offline', { status: 503 });
				})
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cached) => {
			if (cached) return cached;
			return fetch(event.request).then((response) => {
				if (!response || response.status !== 200 || response.type !== 'basic') return response;
				const copy = response.clone();
				event.waitUntil(caches.open(runtimeCache).then((cache) => cache.put(event.request, copy)));
				return response;
			});
		})
	);
});
