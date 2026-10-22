<script lang="ts">
	import type { Board } from './index.svelte';
	import ZoodokuCell from './ZoodokuCell.svelte';

	let p: { board: Board } = $props();
</script>

<div class="flex flex-col gap-1 rounded-3xl bg-white p-3">
	{#each p.board.cells as row, i}
		<div class="flex gap-1">
			{#each row as cell, j}
				<ZoodokuCell
					{cell}
					hue={p.board.groupHues[cell.group]}
					topLeft={i === 0 && j === 0}
					topRight={i === 0 && j === row.length - 1}
					bottomLeft={i === p.board.cells.length - 1 && j === 0}
					bottomRight={i === p.board.cells.length - 1 && j === row.length - 1}
					seed={p.board.seed}
				/>
			{/each}
		</div>
	{/each}
</div>
