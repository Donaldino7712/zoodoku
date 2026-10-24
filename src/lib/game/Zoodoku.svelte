<script lang="ts">
	import type { Board } from './index.svelte';
	import ZoodokuCell, { type DragState } from './ZoodokuCell.svelte';

	let p: {
		board: Board;
		onerror?: () => void;
		animal: string;
		highlight?: { row: number; column: number };
	} = $props();

	let dragState = $state<DragState>();
	let boardElement = $state<HTMLDivElement>();
</script>

<svelte:window onmouseup={() => (dragState = undefined)} />

<div
	class="flex touch-none flex-col gap-1 rounded-3xl bg-white p-3 drop-shadow"
	bind:this={boardElement}
	role="group"
>
	{#each p.board.cells as row, i}
		<div class="flex gap-1">
			{#each row as cell, j}
				<ZoodokuCell
					{cell}
					board={p.board}
					bind:dragState
					row={i}
					column={j}
					{boardElement}
					hue={p.board.groupHues[cell.group]}
					groupBorders={{
						top: i === 0 || p.board.cells[i - 1][j]?.group !== cell.group,
						right: j === row.length - 1 || row[j + 1]?.group !== cell.group,
						bottom: i === p.board.cells.length - 1 || p.board.cells[i + 1][j]?.group !== cell.group,
						left: j === 0 || row[j - 1]?.group !== cell.group
					}}
					topLeft={i === 0 && j === 0}
					topRight={i === 0 && j === row.length - 1}
					bottomLeft={i === p.board.cells.length - 1 && j === 0}
					bottomRight={i === p.board.cells.length - 1 && j === row.length - 1}
					onerror={p.onerror}
					animal={p.animal}
					highlight={p.highlight?.row === i && p.highlight.column === j}
				/>
			{/each}
		</div>
	{/each}
</div>
