const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');

const pow = Math.pow;

const cell_width = (Math.min(window.innerWidth, window.innerHeight) / 81) - 3;
const cell_height = cell_width;

const BOARD_SIZE = cell_width * 27 * 3;
canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

const ini_state = {
	grid : [],
	rec_level : -1,
	turn : "X",
	guide : [{x: 0, y: 0, scale: 4}]
}

let state = JSON.parse(JSON.stringify(ini_state));

const grid_colors = ['lightgray', 'gray', 'black']
const margin = 4;

function drawX(x_px, y_px, scale = 1) {
	context.strokeStyle = 'green';
	context.lineWidth = 1;

	// First diagonal line
	context.beginPath();
	context.moveTo(x_px * pow(3, scale) + margin, y_px * pow(3, scale) + margin); // Starting
	context.lineTo((x_px + cell_width) * pow(3, scale) - margin, (y_px + cell_height) * pow(3, scale) - margin); // Ending point (bottom-right)
	context.stroke();

	// Second diagonal line
	context.beginPath();
	context.moveTo((x_px + cell_width) * pow(3, scale) - margin, y_px * pow(3, scale) + margin); // Starting point (
	context.lineTo(x_px * pow(3, scale) + margin, (y_px + cell_height) * pow(3, scale) - margin); // Ending point (
	context.stroke();
}

function drawO(x_px, y_px, scale = 1) {
    context.strokeStyle = 'blue';
    context.lineWidth = 1;

    context.beginPath();
    context.arc(x_px * pow(3, scale) + cell_width * pow(3, scale) / 2, y_px * pow(3, scale) + cell_height * pow(3, scale) / 2, cell_width * pow(3, scale) / 2 - margin, 0, 2 * Math.PI);
    context.stroke();
}

function drawSymbol(x, y, sym, scale = 1) {
	if (sym === 'X') {
		drawX(x * cell_width, y * cell_height, scale);
	} else if (sym === 'O') {
		drawO(x * cell_width, y * cell_height, scale);
	}
}

function drawGrid(x, y, scale = 1) {
	context.strokeStyle = grid_colors[scale - 1];
	context.lineWidth = 2 * scale;
	
	const x_px = (x * cell_width);
	const y_px = (y * cell_height);
	const s = pow(3, scale);

	const x_pxs = x_px * s;
	const y_pxs = y_px * s;

	/// Horizontal lines
	context.beginPath();
	context.moveTo(x_pxs * 3, y_pxs * 3 + cell_height * s);
	context.lineTo(x_pxs * 3 + 3 * cell_width * s, y_pxs * 3 + cell_height * s);
	context.stroke();

	context.beginPath();
	context.moveTo(x_pxs * 3, y_pxs * 3 + 2 * cell_height * s);
	context.lineTo(x_pxs * 3 + 3 * cell_width * s, y_pxs * 3 + 2 * cell_height * s);
	context.stroke();

	/// Vertical lines
	context.beginPath();
	context.moveTo(x_pxs * 3 + cell_width * s, y_pxs * 3);
	context.lineTo(x_pxs * 3 + cell_width * s, y_pxs * 3 + 3 * cell_height * s);
	context.stroke();

	context.beginPath();
	context.moveTo(x_pxs * 3 + 2 * cell_width * s, y_pxs * 3);
	context.lineTo(x_pxs * 3 + 2 * cell_width * s, y_pxs * 3 + 3 * cell_height * s);
	context.stroke();
}

function drawTable(scale, x = 0, y = 0) {
	if (scale === 0) {
		return;
	}

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			drawTable(scale - 1, i + (x * 3) , j + (y  * 3));
		}
	}

	drawGrid(x, y, scale);
}

function drawLayer(grid, scale, oi = 0, oj = 0) {
	if (scale === 0) {
		return;
	}

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (typeof grid[i * 3 + j] === "string") {
				drawSymbol(j + (oj / pow(3, scale - 1)), i + (oi / pow(3, scale - 1)), grid[i * 3 + j], scale)
			} else {
				drawLayer(grid[i * 3 + j], scale - 1, i * pow(3, scale - 1) + oi, j * pow(3, scale - 1) + oj);
			}
		}
	}
}

function drawMoves(state) {
	drawLayer(state.grid, state.rec_level);
}

function drawRect(x, y, scale) {
	context.strokeStyle = 'red';
 context.lineWidth = 3;
	context.strokeRect(x * cell_width * pow(3, scale), y * cell_height * pow(3, scale), cell_width * pow(3, scale), cell_height * pow(3, scale));
}

function newState(rec) {
	if (rec === 0) {
		return " "
	}
	let list = [];
	for (let i = 0; i < 9; i++) {
		list.push(newState(rec - 1));
	}

	return list
}

function setup(rec) {
	state = JSON.parse(JSON.stringify(ini_state));
	state.grid = newState(rec);
	state.rec_level = rec;
	moves.push(JSON.parse(JSON.stringify(state)));
}

function clear() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function paint(state) {
	clear();
	drawTable(state.rec_level);
	drawMoves(state);
	if (state.guide !== null) {
		for (let i = 0; i < state.guide.length; i++) {
			drawRect(state.guide[i].x, state.guide[i].y, state.guide[i].scale);
		}
	}
}

const winPatterns = [
	// Rows
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	// Columns
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	// Diagonals
	[0, 4, 8],
	[2, 4, 6]
];
function checkWin(board) {
	for (let pattern of winPatterns) {
		const [a, b, c] = pattern;
		if (board[a] instanceof Array || board[b] instanceof Array || board[c] instanceof Array) 
			continue;

		if (board[a] !== ' ' && board[a] === board[b] && board[b] === board[c]) {
			return board[a];
		}
	}
	return null;
}

function updateBoard(grid, x, y, sym, scale) {
	const tx = Math.floor(x / pow(3, scale - 1));
	const ty = Math.floor(y / pow(3, scale - 1));
	const idx = tx + 3 * ty;

	if (grid[idx] instanceof Array) {
		let r = updateBoard(grid[idx], x % pow(3, scale - 1), y % pow(3, scale - 1), sym, scale - 1);
		let w = checkWin(grid[idx]);
		if (w !== null) {
			grid[idx] = w;
			return true;
		}
		return r;
	} else {
		if (grid[idx] !== ' ') {
			return false;
		} 
		grid[idx] = sym;
		return true;
	}
}

function get(grid, x, y, scale) {
	if (scale === 0) {
		return [0, ' '];
	}

	const tx = Math.floor(x / pow(3, scale - 1));
	const ty = Math.floor(y / pow(3, scale - 1));
	const idx = tx + 3 * ty;

	if (grid[idx] instanceof Array) {
		return get(grid[idx], x % pow(3, scale - 1), y % pow(3, scale - 1), scale - 1);
	} else {
		return [scale, grid[idx]];
	}
}

function updateGuide(x, y) {
	const lv1x = x % 9; 
	const lv1y = y % 9;
	let scale = 1;

	const [s, r] = get(state.grid, lv1x, lv1y, ++scale);
	if (s === 1 && r !== ' ') {
		const lv2x = Math.floor(lv1x / 3);
		const lv2y = Math.floor(lv1y / 3);

		state.guide.push({x: lv2x, y: lv2y, scale: ++scale});

		return;
	}
	if (s === 2 && r != ' ') {
		const lv3x = lv1x % 3;
		const lv3y = lv1y % 3;
	
		let cont = 0;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const [s3, r3] = get(state.grid, i, j, 1);
				if (s3 === 0) {
					state.guide.push({x: lv3x + i * 3, y: lv3y + j * 3, scale: scale});
				} else {
					cont += 1;
				}
			}
		}

		if (cont === 9) {
			state.guide = [{x: 0, y: 0, scale: 4}];
		}

		return;
	}

	state.guide.push({x: lv1x, y: lv1y, scale: scale});
}

let moves = []

canvas.addEventListener('click', (event) => {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor((event.clientX - rect.left) / BOARD_SIZE * 27);
	const y = Math.floor((event.clientY - rect.top) / BOARD_SIZE * 27);

	if (!isValidMove(x, y)) {
		return;
	}

	state.guide = [];
	if (updateBoard(state.grid, x, y, state.turn, state.rec_level)) {
		state.turn = state.turn === "X" ? "O" : "X";
		updateGuide(x, y);

		moves.push(JSON.parse(JSON.stringify(state)));
		paint(state);
	}
});

function isValidMove(x, y) {
	for (let i = 0; i < state.guide.length; i++) {
		const g = state.guide[i];
		const tx = g.x * pow(3, g.scale - 1);
		const ty = g.y * pow(3, g.scale - 1); 

		const lim_x = tx + pow(3, g.scale - 1);
		const lim_y = ty + pow(3, g.scale - 1);
		if ((tx <= x && x < lim_x) && (ty <= y && y < lim_y)) {
			const [s, c] = get(state.grid, x, y, 3);
			return c === ' ';
		}
	}

	return false;
}

function undo() {
	if (moves.length > 1) {
		moves.pop();
		state = moves[moves.length - 1];
		paint(state);
	}
}

function reset() {
	moves = []
	setup(3);
	paint(state);
}

window.onpagehide = () => {
	localStorage.setItem('moves', JSON.stringify(moves));
}

window.onload = () => {
	const moves_str = localStorage.getItem('moves');
	if (moves_str !== null) {
		moves = JSON.parse(moves_str);
		state = moves[moves.length - 1];
	} else {
		setup(3);
	}
	paint(state);
}
