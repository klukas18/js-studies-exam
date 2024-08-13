const canvas = document.getElementById('gameOfLife');
const ctx = canvas.getContext('2d');

// Initial cell size
let cellSize = 5;

// Grid dimensions (in cells)
let width = Math.floor(canvas.width / cellSize);
let height = Math.floor(canvas.height / cellSize);

// Create a 2D array to represent the grid (0 - dead, 1 - alive)
let grid = new Array(height);
for (let y = 0; y < height; y++) {
	grid[y] = new Array(width).fill(0);
}

document.getElementById('cellSize').addEventListener('input', function () {
	cellSize = this.value;
	// Recalculate the grid dimensions
	width = Math.floor(canvas.width / cellSize);
	height = Math.floor(canvas.height / cellSize);
	// Recreate the grid array with the new dimensions
	grid = new Array(height);
	for (let y = 0; y < height; y++) {
		grid[y] = new Array(width).fill(0);
	}
	// Redraw the grid with the new cell size
	drawGrid();
	document.getElementById('startButton').textContent = 'Start';
});

// Function to draw the grid
function drawGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (grid[y][x] === 1) {
				ctx.fillStyle = liveColor;
			} else {
				ctx.fillStyle = deadColor;
			}
			ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
		}
	}
}

// Get the number of live neighbors for a cell
function getLiveNeighbors(x, y) {
	let count = 0;
	for (let yOffset = -1; yOffset <= 1; yOffset++) {
		for (let xOffset = -1; xOffset <= 1; xOffset++) {
			const neighborX = (x + xOffset + width) % width;
			const neighborY = (y + yOffset + height) % height;
			count += grid[neighborY][neighborX];
		}
	}
	// Don't count the current cell
	count -= grid[y][x];
	return count;
}

// Update the grid to the next generation
function updateGrid() {
	const newGrid = new Array(height);
	for (let y = 0; y < height; y++) {
		newGrid[y] = new Array(width).fill(0);
		for (let x = 0; x < width; x++) {
			const liveNeighbors = getLiveNeighbors(x, y);
			if (grid[y][x]) {
				// Any live cell with two or three live neighbours lives on
				if (liveNeighbors === 2 || liveNeighbors === 3) {
					newGrid[y][x] = 1;
				}
			} else {
				// Any dead cell with exactly three live neighbours becomes a live cell
				if (liveNeighbors === 3) {
					newGrid[y][x] = 1;
				}
			}
		}
	}
	grid = newGrid;
}

let liveColor = '#000';
let deadColor = '#fff';
let colorIndex = 0;

document.getElementById('colorScheme').addEventListener('change', function () {
	if (this.value === 'reversed') {
		// Swap the colors
		[liveColor, deadColor] = [deadColor, liveColor];
	} else if (this.value === 'rainbow') {
		// Start color cycling
		colorIndex = 0; // Reset the color index
	} else {
		// Set the colors to their original values
		liveColor = '#000';
		deadColor = '#fff';
	}
	drawGrid(); // Redraw the grid to show the changes
});
// Start the game loop
let animationId;
function startGame() {
	if (!animationId) {
		// Prevent multiple game loops
		animationId = requestAnimationFrame(gameLoop);
	}
}

function stopGame() {
	cancelAnimationFrame(animationId);
	animationId = null; // Reset animationId when game is stopped
}

// Game speed
let n = 15 - document.getElementById('gameSpeed').value;

document.getElementById('gameSpeed').addEventListener('input', function () {
	n = 15 - this.value;
});

// Game loop function
let frameCount = 60;

function gameLoop() {
	frameCount++;
	if (frameCount % n === 0) {
		updateGrid();
		// Check if color cycling is enabled
		if (document.getElementById('colorScheme').value === 'rainbow') {
			// Update the color index
			colorIndex = (colorIndex + 1) % 360; // Cycle through 360 degrees
			// Convert the color index to an RGB color
			liveColor = `hsl(${colorIndex}, 100%, 50%)`;
		}
		drawGrid();
	}
	animationId = requestAnimationFrame(gameLoop);
}

function clearGrid() {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			grid[y][x] = 0;
		}
	}
	drawGrid(); // Redraw the grid to show the changes
}

// Randomly initialize the grid
function randomizeGrid() {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			grid[y][x] = Math.random() < 0.1 ? 1 : 0;
		}
	}
	startGame();
}

// Draw on the canvas using mouse events
let isDrawing = false;

canvas.addEventListener('mousedown', function (e) {
	isDrawing = true;
	addCell(e);
});

canvas.addEventListener('mousemove', function (e) {
	if (isDrawing) {
		addCell(e);
	}
});

canvas.addEventListener('mouseup', function () {
	isDrawing = false;
});

function addCell(e) {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left) / cellSize);
	const y = Math.floor((e.clientY - rect.top) / cellSize);
	grid[y][x] = 1;
	drawGrid();
}

canvas.addEventListener('click', function (event) {
	// Calculate the x and y position of the clicked cell
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor((event.clientX - rect.left) / cellSize);
	const y = Math.floor((event.clientY - rect.top) / cellSize);

	// Toggle the state of the clicked cell
	grid[y][x] = grid[y][x] ? 0 : 1;

	// Redraw the grid to show the changes
	drawGrid();
});

// Add event listeners for buttons
document.getElementById('startButton').addEventListener('click', function () {
	startGame();
	this.textContent = 'Playing...';
});
document.getElementById('pauseButton').addEventListener('click', function () {
	stopGame();
	document.getElementById('startButton').textContent = 'Start';
});
document.getElementById('randomButton').addEventListener('click', function () {
	randomizeGrid();
	document.getElementById('startButton').textContent = 'Playing...';
});
document.getElementById('clearButton').addEventListener('click', function () {
	clearGrid();
	stopGame();
	document.getElementById('startButton').textContent = 'Start';
});
