<script lang="ts">
	import type { Board } from './index.svelte';
	import ZoodokuCell from './ZoodokuCell.svelte';

	let p: { board: Board; onerror?: () => void; animal: string } = $props();

	type SwipeAction = 'cross' | 'uncross';

	let swipe = $state<{ action: SwipeAction }>();
	let boardElement: HTMLDivElement;

	function cellFromTouch(touch: Touch): { row: number; column: number } | undefined {
		const element = document.elementFromPoint(touch.clientX, touch.clientY);
		const button = element?.closest<HTMLButtonElement>('button');
		if (!button) return;

		const rowElement = button.parentElement;
		if (!rowElement || rowElement.parentElement !== boardElement) return;

		const row = Array.from(boardElement.children).indexOf(rowElement);
		const column = Array.from(rowElement.children).indexOf(button);
		if (row < 0 || column < 0) return;
		return { row, column };
	}

	function applySwipe(row: number, column: number, action: SwipeAction): void {
		const cell = p.board.cells[row]?.[column];
		if (!cell || cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		if ((cell.userstate === 'crossed') === (action === 'cross')) return;
		navigator.vibrate?.(1);
		cell.userstate = action === 'cross' ? 'crossed' : undefined;
	}

	function startSwipe(event: TouchEvent, row: number, column: number): void {
		const cell = p.board.cells[row]?.[column];
		if (!cell || cell.userstate === 'animal' || cell.userstate === 'misflagged') return;

		event.preventDefault();
		swipe = { action: cell.userstate === 'crossed' ? 'uncross' : 'cross' };
		applySwipe(row, column, swipe.action);
	}

	function continueSwipe(event: TouchEvent): void {
		if (!swipe) return;

		const touch = event.touches[0];
		if (!touch) return;

		event.preventDefault();
		const position = cellFromTouch(touch);
		if (position) applySwipe(position.row, position.column, swipe.action);
	}

	function endSwipe(): void {
		swipe = undefined;
	}
</script>

<div
	class="flex touch-none flex-col gap-1 rounded-3xl bg-white p-3 drop-shadow"
	bind:this={boardElement}
	role="group"
	ontouchmove={continueSwipe}
	ontouchend={endSwipe}
	ontouchcancel={endSwipe}
>
	{#each p.board.cells as row, i}
		<div class="flex gap-1">
			{#each row as cell, j}
				<ZoodokuCell
					{cell}
					onTouchStart={(event) => startSwipe(event, i, j)}
					hue={p.board.groupHues[cell.group]}
					topLeft={i === 0 && j === 0}
					topRight={i === 0 && j === row.length - 1}
					bottomLeft={i === p.board.cells.length - 1 && j === 0}
					bottomRight={i === p.board.cells.length - 1 && j === row.length - 1}
					onerror={p.onerror}
					animal={p.animal}
				/>
			{/each}
		</div>
	{/each}
</div>
