const cells = document.querySelectorAll('.cell');
let redBallPlaced = false;
let startButtonPressed = false;
let orangeDiamondsPlaced = false;
let orangeDiamondsSwitched = false;
let moveCounter = 0;

//   place the red ball on the board
cells.forEach((cell) => {
	cell.addEventListener('mousedown', function (event) {
		if (
			event.button === 0 &&
			!this.classList.contains('diamond') &&
			!startButtonPressed
		) {
			const existingRedBallCell = document.querySelector('.cell[value="🔴"]');
			if (existingRedBallCell) {
				existingRedBallCell.value = '';
				existingRedBallCell.classList.remove('ball-transition');
			}
			this.value = '🔴';
			redBallPlaced = true;
			animateRedBall(this);
		}
	});
	cell.addEventListener('contextmenu', function (event) {
		event.preventDefault();
	});
});

//  animate the red ball movement

function animateRedBall(startCell) {
	let currentCell = startCell;
	let direction = getRandomDirection();

	function animate() {
		if (!startButtonPressed) {
			return;
		}
		const [row, col] = currentCell.id.split('-').slice(1).map(Number);
		let nextCell;

		if (direction === 'down-right') {
			nextCell = document.getElementById(`cell-${row + 1}-${col + 1}`);
		} else if (direction === 'up-right') {
			nextCell = document.getElementById(`cell-${row - 1}-${col + 1}`);
		} else if (direction === 'up-left') {
			nextCell = document.getElementById(`cell-${row - 1}-${col - 1}`);
		} else if (direction === 'down-left') {
			nextCell = document.getElementById(`cell-${row + 1}-${col - 1}`);
		}

		if (nextCell && !nextCell.classList.contains('dark-bg')) {
			if (nextCell.classList.contains('diamond')) {
				const [nextRow, nextCol] = getNextCellCoordinates(row, col, direction);
				const possibleDirections = getPossibleDirections(nextRow, nextCol);
				if (possibleDirections.length > 0) {
					direction = getRandomDirectionFromOptions(possibleDirections);
				}
				nextCell.classList.remove('diamond'); // remove the diamond class
			}

			nextCell.value = '🔴';
			currentCell.value = '';
			currentCell.classList.remove('ball-transition');
			nextCell.classList.add('ball-transition');
			currentCell = nextCell;
			moveCounter++;
			document.getElementById(
				'move-counter'
			).textContent = `Moves: ${moveCounter}`;
			// console.log(
			// 	`Moving from cell-${row}-${col} to cell-${row + 1}-${col + 1}`
			// );
		} else {
			const oppositeDirection = getOppositeDirection(direction);
			const possibleDirections = getPossibleDirections(
				row,
				col,
				oppositeDirection
			);
			if (possibleDirections.length > 0) {
				direction = getRandomDirectionFromOptions(possibleDirections);
			} else {
				direction = getOppositeDirection(direction);
			}
		}

		if (!nextCell) {
			return;
		}
		setTimeout(function () {
			requestAnimationFrame(animate);
		}, 200);
	}
	animate();
}

// get possible directions for the red ball

function getPossibleDirections(row, col, excludeDirection) {
	const directions = ['down-right', 'up-right', 'up-left', 'down-left'];
	const possibleDirections = [];
	directions.forEach((direction) => {
		if (direction !== excludeDirection) {
			const [nextRow, nextCol] = getNextCellCoordinates(row, col, direction);
			const nextCell = document.getElementById(`cell-${nextRow}-${nextCol}`);
			if (nextCell && !nextCell.classList.contains('dark-bg')) {
				possibleDirections.push(direction);
			}
		}
	});
	return possibleDirections;
}

function getNextCellCoordinates(row, col, direction) {
	let nextRow = row;
	let nextCol = col;
	if (direction === 'down-right') {
		nextRow = row + 1;
		nextCol = col + 1;
	} else if (direction === 'up-right') {
		nextRow = row - 1;
		nextCol = col + 1;
	} else if (direction === 'up-left') {
		nextRow = row - 1;
		nextCol = col - 1;
	} else if (direction === 'down-left') {
		nextRow = row + 1;
		nextCol = col - 1;
	}
	return [nextRow, nextCol];
}

function getRandomDirectionFromOptions(possibleDirections) {
	const randomIndex = Math.floor(Math.random() * possibleDirections.length);
	return possibleDirections[randomIndex];
}

function getRandomDirection() {
	const directions = ['down-right', 'up-right', 'up-left', 'down-left'];
	const randomIndex = Math.floor(Math.random() * directions.length);
	return directions[randomIndex];
}

function getOppositeDirection(direction) {
	switch (direction) {
		case 'down-right':
			return 'up-left';
		case 'up-right':
			return 'down-left';
		case 'up-left':
			return 'down-right';
		case 'down-left':
			return 'up-right';
		default:
			return null;
	}
}

// place the orange diamonds on the board

function placeOrangeDiamonds() {
	const diamondCells = document.querySelectorAll('.cell:not(.dark-bg)');
	const randomIndexes = getRandomIndexes(diamondCells.length, 5);
	randomIndexes.forEach((index) => {
		diamondCells[index].classList.add('diamond');
		diamondCells[index].value = '🔶';
	});
	orangeDiamondsPlaced = true;
}

function getRandomIndexes(max, count) {
	const indexes = [];
	while (indexes.length < count) {
		const randomIndex = Math.floor(Math.random() * max);
		if (!indexes.includes(randomIndex)) {
			indexes.push(randomIndex);
		}
	}
	return indexes;
}

// buttons

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', function () {
	if (!redBallPlaced) {
		alert(
			'Please place the red ball 🔴 on the board before starting the game.'
		);
		return;
	}
	if (!startButtonPressed) {
		startButton.textContent = 'Pause';
		startButtonPressed = true;
		const redBallStartCell = document.querySelector('.cell[value="🔴"]');
		animateRedBall(redBallStartCell);
	} else {
		startButton.textContent = 'Resume';
		startButtonPressed = false;
	}
});

const resetButton = document.getElementById('reset-button');
resetButton.addEventListener('click', function () {
	moveCounter = 0;
	redBallPlaced = false;
	startButtonPressed = false;
	startButton.disabled = false;
	startButton.textContent = 'Start';

	const redBallCell = document.querySelector('.cell[value="🔴"]');
	if (redBallCell) {
		redBallCell.value = '';
		redBallCell.classList.remove('ball-transition');
	}

	document.getElementById('move-counter').textContent = `Moves: ${moveCounter}`;

	const diamondCells = document.querySelectorAll('.cell.diamond');
	diamondCells.forEach((cell) => {
		cell.classList.remove('diamond');
		cell.value = '';
	});

	placeOrangeDiamonds();
});

window.addEventListener('DOMContentLoaded', function () {
	placeOrangeDiamonds();
});
