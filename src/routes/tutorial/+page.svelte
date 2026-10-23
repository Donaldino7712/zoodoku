<script lang="ts">
	import { getAnimal } from '#lib/animals/index.ts';
	import GameScreen from '#lib/game/GameScreen.svelte';
	import LossOverlay from '#lib/game/LossOverlay.svelte';
	import { Board } from '#lib/game/index.svelte.ts';
	import { goto } from '$app/navigation';
	import checks from '#lib/powerups/checks.svg';
	import search from '#lib/powerups/search.svg';
	import crossrandom from '#lib/powerups/crossrandom.svg';
	import { fade, scale } from 'svelte/transition';
	import { barebones } from '#lib/config.svelte.ts';

	const boardSize = 5;
	const animalColumns = [3, 0, 2, 4, 1];
	const groupMap = [
		[0, 0, 1, 1, 2],
		[0, 0, 0, 2, 2],
		[4, 4, 3, 2, 2],
		[4, 4, 4, 2, 2],
		[4, 4, 4, 2, 2]
	];

	function createTutorialBoard(): Board {
		const board = new Board();
		board.cells = groupMap.map((groups, row) =>
			groups.map((group, column) => ({
				group,
				animal: animalColumns[row] === column
			}))
		);
		board.groupHues = [0, 72, 144, 216, 288];
		return board;
	}

	let board = $state(createTutorialBoard());
	let lives = $state(3);
	let step = $state(0);

	const animalCell = { row: 2, column: 2 };
	const rowCells = [0, 1, 3, 4].map((column) => ({ row: 2, column }));
	const columnCells = [0, 1, 3, 4].map((row) => ({ row, column: 2 }));
	const edgeCells = [
		{ row: 1, column: 1 },
		{ row: 1, column: 2 },
		{ row: 1, column: 3 },
		{ row: 2, column: 1 },
		{ row: 2, column: 3 },
		{ row: 3, column: 1 },
		{ row: 3, column: 2 },
		{ row: 3, column: 3 }
	];
	const nextAnimalCell = { row: 0, column: 3 };
	const guidedCells = [animalCell, ...rowCells, ...columnCells, ...edgeCells, nextAnimalCell];
	const nextAnimalStep = guidedCells.length - 1;
	const highlight = $derived(guidedCells[step]);
	const instructions = $derived(
		step === 0
			? 'This color group has one cell, so it must contain an animal. Double-tap it.'
			: step <= rowCells.length
				? 'There can be only one animal per row. Cross out every highlighted cell in this row.'
				: step <= rowCells.length + columnCells.length
					? 'There can be only one animal per column. Cross out every highlighted cell in this column.'
					: step < nextAnimalStep
						? 'Animals cannot touch. Cross out all eight cells around the animal.'
						: step === nextAnimalStep
							? 'Only one cell remains in this color group. Double-tap it to find the next animal.'
							: 'Follow the same rules to find the rest of the animals. You can also swipe to cross out multiple cells at once.'
	);

	$effect(() => {
		const cell = guidedCells[step];
		if (!cell) return;
		const userstate = board.cells[cell.row]?.[cell.column]?.userstate;
		if (
			((step === 0 || step === nextAnimalStep) && userstate === 'animal') ||
			(step > 0 && step < nextAnimalStep && userstate === 'crossed')
		)
			step += 1;
	});

	function retry(): void {
		lives = 3;
		step = 0;
		board = createTutorialBoard();
	}

	function handleTutorialError(): void {
		for (const row of board.cells)
			for (const cell of row) if (cell.userstate === 'misflagged') cell.userstate = undefined;
		lives -= 1;
	}
</script>

<LossOverlay visible={lives <= 0} {retry} />

{#if board.won}
	<div
		class="absolute inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		in:fade={{ delay: 800, duration: barebones.current ? 0 : 400 }}
	>
		<div
			in:scale={{ delay: 300, duration: barebones.current ? 0 : 300 }}
			class="max-w-sm min-w-2xs rounded-3xl bg-bg p-4"
		>
			<h3 class="text-center text-2xl font-bold">Tutorial complete!</h3>
			<p class="mt-2">
				You're ready to play. If you're stuck, you can use these power-ups to help you:
			</p>
			<div class="mt-4 space-y-2 text-sm">
				<div class="flex items-center gap-2">
					<div
						class="size-8 shrink-0 bg-text"
						style="mask-image: url({`"${checks}"`}); mask-size: contain; mask-repeat: no-repeat; mask-position: center;"
					></div>
					<p>Cross out every cell ruled out by animals you have found.</p>
				</div>
				<div class="flex items-center gap-2">
					<div
						class="size-8 shrink-0 bg-text"
						style="mask-image: url({`"${search}"`}); mask-size: contain; mask-repeat: no-repeat; mask-position: center;"
					></div>
					<p>Reveal a random animal.</p>
				</div>
				<div class="flex items-center gap-2">
					<div
						class="size-8 shrink-0 bg-text"
						style="mask-image: url({`"${crossrandom}"`}); mask-size: contain; mask-repeat: no-repeat; mask-position: center;"
					></div>
					<p>Cross out five random empty cells.</p>
				</div>
			</div>
			<button
				class="mt-6 w-full clicky rounded-lg border border-depress bg-layer p-4 drop-shadow"
				onclick={() => goto('/')}
			>
				Play Zoodoku
			</button>
			<button class="mt-4 w-full text-center underline" onclick={retry}>Play again</button>
		</div>
	</div>
{/if}

<GameScreen
	{board}
	{lives}
	max={boardSize}
	title="Tutorial"
	animal={getAnimal(0)}
	{instructions}
	{highlight}
	onerror={handleTutorialError}
/>
