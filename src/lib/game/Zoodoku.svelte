<script lang="ts">
	import type { Board } from '.';

	let p: { board: Board } = $props();
</script>

<div class="flex flex-col gap-1 rounded-3xl bg-white p-3">
	{#each p.board.cells as row, i}
		<div class="flex gap-1">
			{#each row as cell, j}
				<div
					style="background-color: hsl({p.board.groupHues[cell.group]} 46% 67%);"
					class={[
						'flex aspect-square size-full min-h-8 min-w-8 items-center justify-center rounded-lg',
						i === 0 && j === 0 && 'rounded-tl-xl',
						i === 0 && j === row.length - 1 && 'rounded-tr-xl',
						i === p.board.cells.length - 1 && j === 0 && 'rounded-bl-xl',
						i === p.board.cells.length - 1 && j === row.length - 1 && 'rounded-br-xl'
					]}
				>
					{#if cell.animal}
						<div class="size-1/2 rounded-full bg-[#ff0000]"></div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>
