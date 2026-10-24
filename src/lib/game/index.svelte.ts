export class Board {
	static readonly maxGenerationAttempts = 100_000;
	static readonly generationYieldInterval = 16;

	/** cells[y][x] */
	cells = $state<Cell[][]>([]);
	groupHues = $state<number[]>([]);
	seed = 0;
	size = $derived(this.cells.length);

	static async generateGame(
		size: number,
		seed: number,
		onProgress?: (progress: GenerationProgress) => void
	): Promise<Board> {
		if (!Number.isInteger(size) || size < 1)
			throw new RangeError('size must be a positive integer');
		if (!Number.isFinite(seed)) throw new RangeError('seed must be a finite number');

		const groups = size; // TODO: should groups be untied from size?
		const random = seededRandom(seed);
		const board = new Board();
		board.seed = seed;

		onProgress?.({ attempts: 0, maxAttempts: Board.maxGenerationAttempts });

		// Yield periodically so the browser can render progress and respond to input.
		for (let attempt = 0; attempt < Board.maxGenerationAttempts; attempt += 1) {
			const cells = Array.from({ length: size }, () =>
				Array.from({ length: size }, () => ({ group: -1, animal: false }))
			);

			const animalColumns = findNonTouchingPermutation(size, random);
			for (let y = 0; y < size; y += 1) {
				const x = animalColumns[y];
				cells[y][x].animal = true;
				cells[y][x].group = y;
			}

			growRegions(cells, size, random);
			if (!hasUniqueSolution(cells)) {
				const attempts = attempt + 1;
				onProgress?.({ attempts, maxAttempts: Board.maxGenerationAttempts });
				if (attempts % Board.generationYieldInterval === 0) await yieldToBrowser();
				continue;
			}

			board.groupHues = chooseGroupHues(cells, groups, random);
			board.cells = cells;
			onProgress?.({ attempts: attempt + 1, maxAttempts: Board.maxGenerationAttempts });
			return board;
		}

		throw new Error('unable to generate an easily solvable Zoodoku board');
	}

	get statehash() {
		let mask = 0n;
		let bit = 1n;
		for (const row of this.cells)
			for (const cell of row) {
				if (cell.userstate !== undefined && !(cell.animal && cell.userstate === 'crossed'))
					mask |= bit;
				bit <<= 1n;
			}
		return mask === 0n ? '' : mask.toString(16);
	}
	set statehash(hash: string) {
		if (hash.length === 0) return;
		if (!/^[0-9a-f]+$/i.test(hash)) throw new Error('invalid statehash');

		const mask = BigInt(`0x${hash}`);
		if (mask >> BigInt(this.size * this.size) !== 0n) throw new Error('invalid statehash');

		let i = 0;
		for (const row of this.cells)
			for (const cell of row) {
				if ((mask >> BigInt(i)) & 1n) cell.userstate = cell.animal ? 'animal' : 'crossed';
				i += 1;
			}
	}

	get found() {
		return this.cells.flat().filter((cell) => cell.userstate === 'animal').length;
	}
	get won() {
		return this.found >= this.size;
	}

	applyRulesAsChecks(): boolean {
		let changed = false;

		const animalChoices: Array<[number, number]> = [];
		for (let y = 0; y < this.cells.length; y += 1)
			for (let x = 0; x < this.cells[y].length; x += 1)
				if (this.cells[y][x].userstate === 'animal') animalChoices.push([x, y]);

		const cross = (cell: Cell | undefined): void => {
			if (cell && cell.userstate !== 'animal' && cell.userstate !== 'misflagged') {
				if (cell.userstate !== 'crossed') changed = true;
				cell.userstate = 'crossed';
			}
		};

		for (const [animalX, animalY] of animalChoices) {
			const animal = this.cells[animalY][animalX];

			for (let x = 0; x < this.cells[animalY].length; x += 1)
				if (x !== animalX) cross(this.cells[animalY][x]);
			for (let y = 0; y < this.cells.length; y += 1)
				if (y !== animalY) cross(this.cells[y][animalX]);

			for (const row of this.cells)
				for (const cell of row) if (cell.group === animal.group && cell !== animal) cross(cell);

			for (const y of [animalY - 1, animalY + 1]) {
				const row = this.cells[y];
				if (!row) continue;
				for (let x = animalX - 1; x <= animalX + 1; x += 1) cross(row[x]);
			}
		}

		return changed;
	}
	discoverRandomAnimal(): boolean {
		const animals = this.cells.flat().filter((cell) => cell.animal && cell.userstate !== 'animal');
		if (animals.length === 0) return false;
		const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
		randomAnimal.userstate = 'animal';
		return true;
	}
	crossRandomCells(n: number): boolean {
		const cells = this.cells.flat().filter((cell) => !cell.userstate && !cell.animal);
		if (cells.length === 0) return false;
		for (let i = 0; i < n; i += 1) {
			const randomCell = cells[Math.floor(Math.random() * cells.length)];
			randomCell.userstate = 'crossed';
		}
		return true;
	}
}

export interface GenerationProgress {
	attempts: number;
	maxAttempts: number;
}

function yieldToBrowser(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

function hasUniqueSolution(cells: Cell[][]): boolean {
	const size = cells.length;
	const usedColumns = new Set<number>();
	const usedGroups = new Set<number>();
	const placement: number[] = [];
	let solutions = 0;

	function search(row: number): boolean {
		if (row === size) {
			solutions += 1;
			return solutions < 2;
		}

		for (let column = 0; column < size; column += 1) {
			const group = cells[row][column].group;
			if (
				usedColumns.has(column) ||
				usedGroups.has(group) ||
				(row > 0 && Math.abs(column - placement[row - 1]) < 2)
			) {
				continue;
			}

			usedColumns.add(column);
			usedGroups.add(group);
			placement[row] = column;
			if (!search(row + 1) && solutions > 1) return false;
			usedColumns.delete(column);
			usedGroups.delete(group);
		}

		return true;
	}

	search(0);
	return solutions === 1;
}

export interface Cell {
	group: number;
	animal: boolean;
	userstate?: 'crossed' | 'animal' | 'misflagged';
}

function findNonTouchingPermutation(size: number, random: () => number): number[] {
	const result: number[] = [];
	const used = new Array<boolean>(size).fill(false);

	function search(row: number): boolean {
		if (row === size) return true;

		// trying candidates in random order produces different games while the
		// backtracking makes generation reliable for every supported board size
		const candidates = Array.from({ length: size }, (_, column) => column);
		shuffle(candidates, random);
		for (const column of candidates) {
			if (used[column] || (row > 0 && Math.abs(column - result[row - 1]) < 2)) {
				continue;
			}
			used[column] = true;
			result[row] = column;
			if (search(row + 1)) return true;
			used[column] = false;
		}
		return false;
	}

	if (!search(0)) throw new RangeError('no non-touching solution exists for this board size');
	return result;
}

function growRegions(cells: Cell[][], size: number, random: () => number): void {
	const frontiers = cells.map(() => new Set<number>());
	const unassigned = new Set<number>();

	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			const index = y * size + x;
			if (cells[y][x].group === -1) unassigned.add(index);
		}
	}

	for (let group = 0; group < size; group += 1) {
		const animalColumn = cells[group].findIndex((cell) => cell.animal);
		for (const [x, y] of neighbors(animalColumn, group, size)) {
			const index = y * size + x;
			if (unassigned.has(index)) frontiers[group].add(index);
		}
	}

	while (unassigned.size > 0) {
		const options: Array<[number, number]> = [];
		for (let group = 0; group < size; group += 1) {
			for (const index of frontiers[group]) {
				if (unassigned.has(index)) options.push([group, index]);
			}
		}
		if (options.length === 0) throw new Error('unable to grow Zoodoku regions');

		const [group, index] = options[randomInt(options.length, random)];
		const y = Math.floor(index / size);
		const x = index % size;
		cells[y][x].group = group;
		unassigned.delete(index);

		for (const frontier of frontiers) frontier.delete(index);
		for (const [nextX, nextY] of neighbors(x, y, size)) {
			const nextIndex = nextY * size + nextX;
			if (unassigned.has(nextIndex)) frontiers[group].add(nextIndex);
		}
	}
}

function chooseGroupHues(cells: Cell[][], groupCount: number, random: () => number): number[] {
	const adjacency = buildGroupAdjacency(cells, groupCount);
	const hueSlots = Array.from({ length: groupCount }, (_, i) => (i * 360) / groupCount);
	const hues = new Array<number>(groupCount);
	const usedSlots = new Set<number>();

	const groups = Array.from({ length: groupCount }, (_, group) => group).sort(
		(a, b) => adjacency[b].size - adjacency[a].size || a - b
	);

	for (const group of groups) {
		const availableSlots = hueSlots.map((_, slot) => slot).filter((slot) => !usedSlots.has(slot));

		let bestSlot = availableSlots[0];
		let bestScore = -Infinity;

		for (const slot of availableSlots) {
			const score = hueScore(slot, group, adjacency, hues, hueSlots);
			if (score > bestScore) {
				bestScore = score;
				bestSlot = slot;
			}
		}

		if (usedSlots.size === 0) bestSlot = randomInt(availableSlots.length, random);

		usedSlots.add(bestSlot);
		hues[group] = hueSlots[bestSlot];
	}

	return hues;
}

function buildGroupAdjacency(cells: Cell[][], groupCount: number): Set<number>[] {
	const adjacency = Array.from({ length: groupCount }, () => new Set<number>());

	for (let y = 0; y < cells.length; y += 1) {
		for (let x = 0; x < cells[y].length; x += 1) {
			const group = cells[y][x].group;
			if (x + 1 < cells[y].length) addGroupEdge(adjacency, group, cells[y][x + 1].group);
			if (y + 1 < cells.length) addGroupEdge(adjacency, group, cells[y + 1][x].group);
		}
	}

	return adjacency;
}

function addGroupEdge(adjacency: Set<number>[], first: number, second: number): void {
	if (first === second) return;
	adjacency[first].add(second);
	adjacency[second].add(first);
}

function hueScore(
	slot: number,
	group: number,
	adjacency: Set<number>[],
	hues: number[],
	hueSlots: number[]
): number {
	const neighborHues = [...adjacency[group]]
		.filter((neighbor) => hues[neighbor] !== undefined)
		.map((neighbor) => hues[neighbor]);

	if (neighborHues.length === 0) return 0;

	const distances = neighborHues.map((hue) => hueDistance(hueSlots[slot], hue));
	const minimumDistance = Math.min(...distances);
	const totalDistance = distances.reduce((sum, distance) => sum + distance, 0);
	return minimumDistance * 1000 + totalDistance;
}

function hueDistance(first: number, second: number): number {
	const difference = Math.abs(first - second) % 360;
	return Math.min(difference, 360 - difference);
}

function neighbors(x: number, y: number, size: number): Array<[number, number]> {
	const adjacent: Array<[number, number]> = [
		[x - 1, y],
		[x + 1, y],
		[x, y - 1],
		[x, y + 1]
	];
	return adjacent.filter(
		([nextX, nextY]) => nextX >= 0 && nextX < size && nextY >= 0 && nextY < size
	);
}

function shuffle<T>(values: T[], random: () => number): void {
	for (let i = values.length - 1; i > 0; i -= 1) {
		const j = randomInt(i + 1, random);
		[values[i], values[j]] = [values[j], values[i]];
	}
}

function randomInt(max: number, random: () => number): number {
	return Math.floor(random() * max);
}

function seededRandom(seed: number): () => number {
	let state = (seed >= 0 && seed < 1 ? seed * 0x100000000 : seed) >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
	};
}
