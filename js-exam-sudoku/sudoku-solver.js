// ************************************************************************************
// SUDOKU SOLVER LOGIC

function isSafe(board, row, col, num) {
	// Check the row
	for (let x = 0; x <= 8; x++) {
		if (board[row][x] == num) {
			return false;
		}
	}
	// Check the column
	for (let x = 0; x <= 8; x++) {
		if (board[x][col] == num) {
			return false;
		}
	}
	// Check the 3x3 box
	let startRow = row - (row % 3);
	let startCol = col - (col % 3);
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i + startRow][j + startCol] == num) {
				return false;
			}
		}
	}
	return true;
}

function findEmpty(board) {
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (board[i][j] == 0) {
				return [i, j];
			}
		}
	}
	return [-1, -1];
}
/////////////////////////////////////////////////////////////////////////////
//////////////////// **** QUICK RESPONSE **** ///////////////////////////////
/////////////////////////////////////////////////////////////////////////////

function solveSudokuQuick(board) {
	let emptySpot = findEmpty(board);
	let row = emptySpot[0];
	let col = emptySpot[1];

	// Base case: If no empty spot, the board is solved
	if (row == -1) {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let cell = document.getElementById(`cell-${i}-${j}`);
				if (cell) {
					cell.classList.add('solved');
				}
			}
		}
		setTimeout(function () {
			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					let cell = document.getElementById(`cell-${i}-${j}`);
					if (cell) {
						cell.classList.remove('solved');
					}
				}
			}
		}, 1000);
		return true;
	}

	for (let num = 1; num <= 9; num++) {
		if (isSafe(board, row, col, num)) {
			board[row][col] = num;
			if (solveSudokuQuick(board)) {
				return true;
			}
			board[row][col] = 0; // undo the move
		}
	}
	return false; // trigger backtracking
}

/////////////////////////////////////////////////////////////////////////////
//////////////////// **** ANIMATED RESPONSE **** ////////////////////////////
/////////////////////////////////////////////////////////////////////////////

let cancel = false;

async function solveSudokuCool(board) {
	if (cancel) {
		cancel = false; // Reset the flag
		throw new Error('Cancelled');
	}
	let emptySpot = findEmpty(board);
	let row = emptySpot[0];
	let col = emptySpot[1];

	// Base case: If no empty spot, the board is solved
	if (row == -1) {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let cell = document.getElementById(`cell-${i}-${j}`);
				if (cell) {
					cell.classList.add('solved');
				}
			}
		}
		return true;
	}

	for (let num = 1; num <= 9; num++) {
		if (isSafe(board, row, col, num)) {
			board[row][col] = num;

			// Add animation to the current cell
			let cell = document.getElementById(`cell-${row}-${col}`);
			if (cell) {
				cell.value = num; // Show the number
				cell.classList.add('animate-input');

				// Add a delay
				await new Promise((resolve) => setTimeout(resolve, 100));
				cell.classList.remove('animate-input');
			}

			if (await solveSudokuCool(board)) {
				return true;
			}

			board[row][col] = 0; // undo the move
			if (cell) {
				cell.value = ''; // Clear the cell value
			}
		}
	}

	return false; // trigger backtracking
}

// ************************************************************************************
// SUDOKU BOARD INTERACTION

window.onload = function () {
	// Add input event listener to each cell
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			let cell = document.getElementById(`cell-${i}-${j}`);
			if (cell) {
				cell.addEventListener('input', function () {
					cell.classList.add('animate-input');

					let value = parseInt(cell.value, 10);

					// Check for numbers less than 1 or greater than 9
					if (value < 1 || value > 9) {
						// If an invalid number is found, clear the input and show an alert
						cell.value = '';
						alert('Only numbers between 1 and 9 are allowed');
						cell.classList.remove('animate-input');
						return;
					}

					// Check for duplicates in the current row and column
					for (let k = 0; k < 9; k++) {
						if (
							(k != j &&
								document.getElementById(`cell-${i}-${k}`).value ==
									cell.value) ||
							(k != i &&
								document.getElementById(`cell-${k}-${j}`).value == cell.value)
						) {
							// If a duplicate is found, clear the input and show an alert
							cell.value = '';
							alert(
								'Negatives and duplicate numbers in the same row or column are not allowed'
							);
							cell.classList.remove('animate-input');
							return;
						}
					}

					// Check for duplicates in the current block
					let blockRowStart = Math.floor(i / 3) * 3;
					let blockColStart = Math.floor(j / 3) * 3;
					for (let bi = 0; bi < 3; bi++) {
						for (let bj = 0; bj < 3; bj++) {
							let otherCell = document.getElementById(
								`cell-${blockRowStart + bi}-${blockColStart + bj}`
							);
							if (otherCell != cell && otherCell.value == cell.value) {
								// If a duplicate is found, clear the input and show an alert
								cell.value = '';
								alert('Duplicate numbers in the same block are not allowed');
								cell.classList.remove('animate-input');
								return;
							}
						}
					}

					// Remove the class after the animation duration (0.5s)
					setTimeout(function () {
						cell.classList.remove('animate-input');
					}, 500);
				});
			}
		}
	}

	document
		.getElementById('quick-solve-button')
		.addEventListener('click', async function () {
			// Read board state from inputs
			let board = [];
			for (let i = 0; i < 9; i++) {
				let row = [];
				for (let j = 0; j < 9; j++) {
					let cell = document.getElementById(`cell-${i}-${j}`);
					let value = cell ? cell.value : '';
					row.push(value ? parseInt(value, 10) : 0);
				}
				board.push(row);
			}

			// Solve the board
			if (await solveSudokuQuick(board)) {
				// Update inputs with solved board state
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						let cell = document.getElementById(`cell-${i}-${j}`);
						if (cell) {
							cell.value = board[i][j];
						}
					}
				}

				// Remove the 'solved' class from all cells after 1 second
				setTimeout(function () {
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							let cell = document.getElementById(`cell-${i}-${j}`);
							if (cell) {
								cell.classList.remove('solved');
							}
						}
					}
				}, 1000);
			} else {
				alert('This puzzle cannot be solved');
			}
		});

	// Add event listener to the 'Animated Solve' button
	document
		.getElementById('cool-solve-button')
		.addEventListener('click', async function () {
			cancel = false;

			let board = [];
			try {
				// Read board state from inputs
				for (let i = 0; i < 9; i++) {
					let row = [];
					for (let j = 0; j < 9; j++) {
						let cell = document.getElementById(`cell-${i}-${j}`);
						let value = cell ? cell.value : '';
						row.push(value ? parseInt(value, 10) : 0);
					}
					board.push(row);
				}
			} catch (error) {
				if (error.message === 'Cancelled') {
					console.log('Execution cancelled');
				} else {
					throw error;
				}
			}

			// Solve the board
			if (await solveSudokuCool(board)) {
				// Update inputs with solved board state
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						let cell = document.getElementById(`cell-${i}-${j}`);
						if (cell) {
							cell.value = board[i][j];
						}
					}
				}

				// Remove the 'solved' class from all cells after 1 second
				setTimeout(function () {
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							let cell = document.getElementById(`cell-${i}-${j}`);
							if (cell) {
								cell.classList.remove('solved');
							}
						}
					}
				}, 1000);
			} else {
				alert('This puzzle cannot be solved');
			}
		});
};

document.getElementById('clear-button').addEventListener('click', function () {
	cancel = true; // Stop the execution

	let cells = document.querySelectorAll('#sudoku-board input');
	cells.forEach(function (cell) {
		cell.value = '';
	});
});
