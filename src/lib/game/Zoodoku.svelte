<script lang="ts">
	import { draw, scale } from 'svelte/transition';
	import type { Board } from './index.svelte';

	let p: { board: Board } = $props();
</script>

<div class="flex flex-col gap-1 rounded-3xl bg-white p-3">
	{#each p.board.cells as row, i}
		<div class="flex gap-1">
			{#each row as cell, j}
				<button
					style="background-color: hsl({p.board.groupHues[cell.group]} 46% 67%);"
					class={[
						'flex aspect-square size-full min-h-8 min-w-8 items-center',
						'clicky justify-center rounded-lg',
						i === 0 && j === 0 && 'rounded-tl-xl',
						i === 0 && j === row.length - 1 && 'rounded-tr-xl',
						i === p.board.cells.length - 1 && j === 0 && 'rounded-bl-xl',
						i === p.board.cells.length - 1 && j === row.length - 1 && 'rounded-br-xl'
					]}
					onclick={() => (p.board.cells[i][j].crossed = !p.board.cells[i][j].crossed)}
				>
					{#if cell.animal}
						<div class="size-1/2 rounded-full bg-[#ff0000]"></div>
					{/if}
					{#if cell.crossed}
						<svg
							class="size-2/3 text-white"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round"
							out:scale={{ duration: 300 }}
						>
							<path d="M18 6 6 18" in:draw={{ duration: 200 }} />
							<path d="m6 6 12 12" in:draw={{ delay: 100, duration: 200 }} />
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>
