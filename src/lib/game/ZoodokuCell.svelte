<script lang="ts">
	import { draw, scale } from 'svelte/transition';
	import type { Board, Cell } from './index.svelte';
	import { backOut } from 'svelte/easing';
	import { playSound } from '#lib/audio.ts';
	import { animations, colorBlind, vibrate } from '#lib/config.svelte.ts';
	import { launchConfetti } from '#lib/effects.ts';

	export type DragAction = 'cross' | 'uncross';
	export type DragState = { action: DragAction } | undefined;

	let {
		cell,
		board,
		dragState = $bindable<DragState>(),
		row,
		column,
		boardElement,
		hue,
		groupBorders,
		topLeft = false,
		topRight = false,
		bottomLeft = false,
		bottomRight = false,
		onerror,
		animal,
		highlight = false
	}: {
		cell: Cell;
		board: Board;
		dragState?: DragState;
		row: number;
		column: number;
		boardElement?: HTMLDivElement;
		hue: number;
		groupBorders: { top: boolean; right: boolean; bottom: boolean; left: boolean };
		topLeft?: boolean;
		topRight?: boolean;
		bottomLeft?: boolean;
		bottomRight?: boolean;
		onerror?: () => void;
		animal: string;
		highlight?: boolean;
	} = $props();

	let suppressTouchClick = false;
	let suppressTouchClickTimeout: ReturnType<typeof setTimeout> | undefined;
	let suppressMouseClick = false;
	let lastClickAt = 0;
	let clickTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastTouchAt = 0;
	let touchTimeout: ReturnType<typeof setTimeout> | undefined;

	let el = $state<HTMLButtonElement>();
	function toggleCell(): void {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		if (cell.userstate !== 'crossed') playSound('scribble');
		cell.userstate = cell.userstate === 'crossed' ? undefined : 'crossed';
	}

	function markCell(): void {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;
		cell.userstate = cell.animal ? 'animal' : 'misflagged';
		if (cell.animal) {
			playSound('found');
		}
		if (cell.animal && el) {
			const rect = el.getBoundingClientRect();
			void launchConfetti({
				particleCount: 12,
				startVelocity: 10,
				ticks: 100,
				spread: 360,
				origin: {
					y: (rect.top + rect.height / 2) / window.innerHeight,
					x: (rect.left + rect.width / 2) / window.innerWidth
				}
			});
		}
		if (!cell.animal) onerror?.();
	}

	function cellFromTouch(touch: Touch): { row: number; column: number } | undefined {
		const element = document.elementFromPoint(touch.clientX, touch.clientY);
		const button = element?.closest<HTMLButtonElement>('button[data-row][data-column]');
		if (!button || !boardElement?.contains(button)) return;

		return {
			row: Number(button.dataset.row),
			column: Number(button.dataset.column)
		};
	}

	function applyDrag(row: number, column: number, action: DragAction): void {
		const targetCell = board.cells[row]?.[column];
		if (!targetCell || targetCell.userstate === 'animal' || targetCell.userstate === 'misflagged')
			return;
		if ((targetCell.userstate === 'crossed') === (action === 'cross')) return;
		if (vibrate.current) navigator.vibrate?.(1);
		if (action === 'cross') playSound('scribble');
		targetCell.userstate = action === 'cross' ? 'crossed' : undefined;
	}

	function handleDragStart(event: Event): void {
		if (cell.userstate === 'animal' || cell.userstate === 'misflagged') return;

		event.preventDefault();
		const action = cell.userstate === 'crossed' ? 'uncross' : 'cross';
		dragState = { action };
		applyDrag(row, column, action);
	}

	function handleTouchMove(event: TouchEvent): void {
		if (!dragState) return;

		const touch = event.touches[0];
		if (!touch) return;

		event.preventDefault();
		const position = cellFromTouch(touch);
		if (position) applyDrag(position.row, position.column, dragState.action);
	}

	function handleTouchEnd(): void {
		dragState = undefined;
	}

	function handleMouseDown(event: MouseEvent): void {
		if (event.button !== 0) return;
		if (Date.now() - lastTouchAt < 500) return;

		suppressMouseClick = Date.now() - lastClickAt >= 300;
		handleDragStart(event);
	}

	function handleMouseMove(event: MouseEvent): void {
		if (!dragState || !(event.buttons & 1)) return;

		event.preventDefault();
		applyDrag(row, column, dragState.action);
	}

	function handleMouseUp(): void {
		dragState = undefined;
	}

	function handleContextMenu(event: MouseEvent): void {
		event.preventDefault();
		markCell();
	}

	function handleCellTouchStart(event: TouchEvent): void {
		const now = Date.now();
		const isDoubleTap = now - lastTouchAt < 300;
		lastTouchAt = now;
		clearTimeout(touchTimeout);
		touchTimeout = setTimeout(() => (lastTouchAt = 0), 300);

		suppressTouchClick = true;
		clearTimeout(suppressTouchClickTimeout);
		suppressTouchClickTimeout = setTimeout(() => (suppressTouchClick = false), 500);
		handleDragStart(event);

		if (isDoubleTap) markCell();
	}

	function handleClick(): void {
		if (suppressTouchClick) {
			suppressTouchClick = false;
			clearTimeout(suppressTouchClickTimeout);
			return;
		}

		if (suppressMouseClick) {
			suppressMouseClick = false;
			lastClickAt = Date.now();
			clearTimeout(clickTimeout);
			clickTimeout = setTimeout(() => (lastClickAt = 0), 300);
			return;
		}

		const now = Date.now();
		if (now - lastClickAt < 300) {
			clearTimeout(clickTimeout);
			lastClickAt = 0;
			markCell();
			return;
		}

		toggleCell();
		lastClickAt = now;
		clearTimeout(clickTimeout);
		clickTimeout = setTimeout(() => (lastClickAt = 0), 300);
	}
</script>

<button
	data-row={row}
	data-column={column}
	style="background-color: hsl({hue} var(--cell-sat) var(--cell-lum));"
	ontouchstart={handleCellTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	ontouchcancel={handleTouchEnd}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	class={[
		'flex aspect-square size-full items-center',
		'relative clicky justify-center rounded border-2 border-transparent',
		colorBlind.current && groupBorders.top && 'border-t-white',
		colorBlind.current && groupBorders.right && 'border-r-white',
		colorBlind.current && groupBorders.bottom && 'border-b-white',
		colorBlind.current && groupBorders.left && 'border-l-white',
		highlight && 'z-10 outline-4 outline-offset-2 outline-error',
		topLeft && 'rounded-tl-xl',
		topRight && 'rounded-tr-xl',
		bottomLeft && 'rounded-bl-xl',
		bottomRight && 'rounded-br-xl'
	]}
	disabled={cell.userstate === 'animal' || cell.userstate === 'misflagged'}
	onclick={handleClick}
	oncontextmenu={handleContextMenu}
	bind:this={el}
>
	{#if cell.userstate === 'animal'}
		<img
			src={animal}
			alt="Successfully found!"
			class="animal-art pointer-events-none absolute size-3/4"
			in:scale={{ duration: animations.current ? 300 : 0, easing: backOut }}
			out:scale={{ duration: animations.current ? 300 : 0 }}
		/>
	{/if}
	{@render cross(cell.userstate === 'misflagged', 'text-error')}
	{@render cross(cell.userstate === 'crossed', 'text-white')}
</button>

{#snippet cross(shown: boolean, classes: string)}
	{#if shown}
		<svg
			class="pointer-events-none absolute size-2/3 {classes}"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
			stroke-linejoin="round"
			out:scale={{ duration: animations.current ? 300 : 0 }}
		>
			<path d="M18 6 6 18" in:draw={{ duration: animations.current ? 200 : 0 }} />
			<path
				d="m6 6 12 12"
				in:draw={{ delay: animations.current ? 100 : 0, duration: animations.current ? 200 : 0 }}
			/>
		</svg>
	{/if}
{/snippet}
