/**
 * Game constants
 */

const playButton = document.getElementById("play-button");
const endGameContainer = document.getElementById("end-game-container");
const scoreLabels = document.querySelectorAll(".score");

// souds
const eatAppleAudio = new Audio("../assets/sounds/eat-apple-one.mp3");
const environmentSound = new Audio("../assets/sounds/environment-sound.mp3");
environmentSound.loop = true;
const deathSound = new Audio("../assets/sounds/death-sound.mp3");
const startGameSound = new Audio("../assets/sounds/start-game-sound.mp3");

const constants = {
  TILE_SIZE: 20,
  COLS_COUNT: 30,
  ROWS_COUNT: 30,
  ONE_SECOND: 1000,
  FRAME_RATE: 10,
  APPLE_COLOR: "#ff0000",
  BOARD_COLOR: "#000000",
  WALL_COLOR: "#c8c8c8",
  HEAD_COLOR: "#800080",
  BODY_COLOR: "#f17df1",
  WIN: "win",
  LOSE: "lose",
  NOT_STARTED: "not-started",
  RUNNING: "running",
  AIR: "air",
  APPLE: "apple",
  HEAD: "head",
  BODY: "body",
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom",
  BLOCK: "block",
};

/**
 * Game global variables
 */

let boardMap = [[]];
let ctx;
let frameAnimationId;
let snake = {
  x: undefined,
  y: undefined,
  i: undefined,
  j: undefined,
  body: [
    {
      x: undefined,
      y: undefined,
      i: undefined,
      j: undefined,
    },
  ],
};
let apple = {
  x: undefined,
  y: undefined,
  i: undefined,
  j: undefined,
};
let previousDirection;
let currentDirection = constants.LEFT;
let score = 0;
let gameState = constants.NOT_STARTED;

/**
 * Draw functions
 */

function drawApple(x, y) {
  ctx.fillStyle = constants.APPLE_COLOR;
  ctx.fillRect(x, y, constants.TILE_SIZE, constants.TILE_SIZE);
}

function drawHead(x, y) {
  ctx.fillStyle = constants.HEAD_COLOR;
  ctx.fillRect(x, y, constants.TILE_SIZE, constants.TILE_SIZE);
}

function drawSnake() {
  ctx.fillStyle = constants.BODY_COLOR;

  snake.body.forEach((segment, i) => {
    if (i === snake.body.length - 1) {
      ctx.fillStyle = constants.HEAD_COLOR;
      boardMap[segment.i][segment.j] = constants.HEAD;
    } else {
      boardMap[segment.i][segment.j] = constants.BODY;
    }

    ctx.fillRect(
      segment.x,
      segment.y,
      constants.TILE_SIZE,
      constants.TILE_SIZE
    );
  });
}

function drawBoard() {
  const board = document.querySelector("canvas");

  board.width = constants.COLS_COUNT * constants.TILE_SIZE + "";
  board.height = constants.ROWS_COUNT * constants.TILE_SIZE + "";
  board.style.backgroundColor = constants.BOARD_COLOR;

  for (let i = 1; i < constants.COLS_COUNT; i++) {
    boardMap[i] = [];

    for (let j = 1; j < constants.ROWS_COUNT; j++) {
      boardMap[i][j] = constants.AIR;
    }
  }

  return board;
}

function drawWalls() {
  ctx.fillStyle = constants.WALL_COLOR;

  // left wall
  for (let j = 0; j < constants.ROWS_COUNT; j++) {
    boardMap[0][j] = constants.BLOCK;

    const y = j * constants.TILE_SIZE;

    ctx.fillRect(0, y, constants.TILE_SIZE, constants.TILE_SIZE);
  }

  // rigth wall
  const rightWallX = (constants.COLS_COUNT - 1) * constants.TILE_SIZE;
  for (let j = 0; j < constants.ROWS_COUNT; j++) {
    boardMap[constants.COLS_COUNT - 1][j] = constants.BLOCK;

    const y = j * constants.TILE_SIZE;

    ctx.fillRect(rightWallX, y, constants.TILE_SIZE, constants.TILE_SIZE);
  }

  // top wall
  for (let i = 0; i < constants.ROWS_COUNT; i++) {
    boardMap[i][0] = constants.BLOCK;

    const x = i * constants.TILE_SIZE;
    ctx.fillRect(x, 0, constants.TILE_SIZE, constants.TILE_SIZE);
  }

  // bottom wall
  const bottomWallY = (constants.ROWS_COUNT - 1) * constants.TILE_SIZE;
  for (let i = 0; i < constants.ROWS_COUNT; i++) {
    boardMap[i][constants.ROWS_COUNT - 1] = constants.BLOCK;

    const x = i * constants.TILE_SIZE;

    ctx.fillRect(x, bottomWallY, constants.TILE_SIZE, constants.TILE_SIZE);
  }

  ctx.fillStyle = constants.BOARD_COLOR;
}

function drawEntities() {
  addSnakeHead();
  addNewApple();
}

function drawGame() {
  const board = drawBoard();
  ctx = board.getContext("2d");

  drawBoard();
  drawWalls();
}

/**
 * Data manipulation functions
 */

function pushSnakeSegment(x, y, i, j) {
  snake.body.push({ x, y, i, j });
}

function addSnakeSegment() {
  let i = snake.i;
  let j = snake.j;
  let x = snake.x;
  let y = snake.y;

  if (currentDirection === constants.TOP) {
    i -= 1;
  }

  if (currentDirection === constants.BOTTOM) {
    i += 1;
  }

  if (currentDirection === constants.LEFT) {
    j -= 1;
  }

  if (currentDirection === constants.RIGHT) {
    j += 1;
  }

  pushSnakeSegment(x, y, i, j);
  boardMap[i][j] = constants.HEAD;
}

function resetGameData() {
  boardMap = [[]];
  ctx = undefined;
  frameAnimationId = undefined;
  snake = {
    x: undefined,
    y: undefined,
    i: undefined,
    j: undefined,
    body: [],
  };
  apple = {
    x: undefined,
    y: undefined,
    i: undefined,
    j: undefined,
  };
  previousDirection = undefined;
  currentDirection = constants.LEFT;
  score = 0;
}

function clearScoreLabels() {
  Array.from(scoreLabels).forEach((scoreLabel) => (scoreLabel.textContent = 0));
}

function updateScore() {
  score += 10;
  Array.from(scoreLabels).forEach(
    (scoreLabel) => (scoreLabel.textContent = score)
  );
}

function clearTile(x, y) {
  ctx.fillStyle = constants.BOARD_COLOR;
  ctx.fillRect(x, y, constants.TILE_SIZE, constants.TILE_SIZE);
}

function clearBoardCell(i, j) {
  boardMap[i][j] = constants.AIR;
}

function addSnakeHead() {
  const i = Math.ceil(constants.COLS_COUNT / 2);
  const j = Math.ceil(constants.ROWS_COUNT / 2);
  const x = i * constants.TILE_SIZE;
  const y = j * constants.TILE_SIZE;

  drawHead(x, y);

  snake.x = x;
  snake.y = y;
  snake.i = i;
  snake.j = j;

  boardMap[i][j] = constants.HEAD;
  pushSnakeSegment(x, y, i, j);
}

function addNewApple() {
  const { i, j, x, y } = newValidCoord();

  drawApple(x, y);

  apple.x = x;
  apple.y = y;
  apple.i = i;
  apple.j = j;

  boardMap[i][j] = constants.APPLE;
}

function newValidCoord() {
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;

  do {
    x =
      Math.round(Math.random() * (constants.COLS_COUNT - 1)) *
      constants.TILE_SIZE;
    y =
      Math.round(Math.random() * (constants.ROWS_COUNT - 1)) *
      constants.TILE_SIZE;

    i = x / constants.TILE_SIZE;
    j = y / constants.TILE_SIZE;
  } while (boardMap[i][j] !== constants.AIR);

  return { x, y, i, j };
}

/**
 * Game state functions
 */

function checkWin() {
  for (let i = 1; i < constants.COLS_COUNT - 1; i++) {
    for (let j = 1; j < constants.ROWS_COUNT - 1; j++) {
      if (
        boardMap[i][j] === constants.AIR ||
        boardMap[i][j] === constants.APPLE
      ) {
        return;
      }
    }
  }

  gameState = constants.WIN;
}

function checkLose() {
  let i = snake.i;
  let j = snake.j;

  if (currentDirection === constants.LEFT) {
    i = snake.i - 1;
  }

  if (currentDirection === constants.RIGHT) {
    i = snake.i + 1;
  }

  if (currentDirection === constants.TOP) {
    j = snake.j - 1;
  }

  if (currentDirection === constants.BOTTOM) {
    j = snake.j + 1;
  }

  if (
    boardMap[i][j] !== constants.AIR &&
    boardMap[i][j] !== constants.APPLE &&
    boardMap[i][j] !== constants.HEAD
  ) {
    endGameContainer.style.display = "flex";
    gameState = constants.LOSE;
    deathSound.play();
  }
}

function checkGameState() {
  checkWin();
  checkLose();
}

function update() {
  const FRAMES_COUNT = constants.FRAME_RATE * (score ? score * 0.05 : 1);
  const FPS = constants.ONE_SECOND / FRAMES_COUNT;

  setTimeout(() => {
    checkGameState();
    checkEatenApple();
    moveSnake();

    frameAnimationId = requestAnimationFrame(update);

    if (gameState !== constants.RUNNING) {
      cancelAnimationFrame(frameAnimationId);
      stopGame();
    }
  }, FPS);
}

function startGame() {
  if (gameState !== constants.NOT_STARTED) {
    endGameContainer.style.display = "none";
    resetGameData();
    drawGame();
    clearScoreLabels();
  }

  gameState = constants.RUNNING;

  drawEntities();

  playButton.style.display = "none";
  startGameSound.play();
  update();
}

function stopGame() {
  playButton.style.display = "block";
}

function checkEatenApple() {
  if (snake.i == apple.i && snake.j === apple.j) {
    addSnakeSegment();

    snake.i = apple.i;
    snake.j = apple.j;
    snake.x = apple.x;
    snake.y = apple.y;

    clearTile(apple.x, apple.y);
    addNewApple();
    updateScore();
    eatAppleAudio.play();
  }
}

function updateSnakeDirection(key) {
  previousDirection = currentDirection;

  if (
    (key === "ArrowUp" || key === "w") &&
    previousDirection !== constants.BOTTOM &&
    previousDirection !== constants.TOP
  ) {
    currentDirection = constants.TOP;
  }

  if (
    (key === "ArrowDown" || key === "s") &&
    previousDirection !== constants.TOP &&
    previousDirection !== constants.BOTTOM
  ) {
    currentDirection = constants.BOTTOM;
  }

  if (
    (key === "ArrowLeft" || key === "a") &&
    previousDirection !== constants.RIGHT &&
    previousDirection !== constants.LEFT
  ) {
    currentDirection = constants.LEFT;
  }

  if (
    (key === "ArrowRight" || key === "d") &&
    previousDirection !== constants.LEFT &&
    previousDirection !== constants.RIGHT
  ) {
    currentDirection = constants.RIGHT;
  }
}

/**
 * Player movement functions
 */

function moveSnake() {
  switch (currentDirection) {
    case constants.LEFT: {
      moveLeft();
      break;
    }
    case constants.RIGHT: {
      moveRight();
      break;
    }
    case constants.TOP: {
      moveUp();
      break;
    }
    case constants.BOTTOM: {
      moveDown();
      break;
    }
  }
}

function moveLeft() {
  snake.body.forEach((segment) => {
    if (segment.x && segment.y) {
      clearTile(segment.x, segment.y);
    }

    if (segment.i && segment.j) {
      clearBoardCell(segment.i, segment.j);
    }
  });

  snake.x -= constants.TILE_SIZE;
  snake.i -= 1;

  const { x, y, i, j } = snake;

  snake.body.shift();
  pushSnakeSegment(x, y, i, j);

  drawSnake();

  currentDirection = constants.LEFT;
}

function moveRight() {
  snake.body.forEach((segment) => {
    if (segment.x && segment.y) {
      clearTile(segment.x, segment.y);
    }

    if (segment.i && segment.j) {
      clearBoardCell(segment.i, segment.j);
    }
  });

  snake.x += constants.TILE_SIZE;
  snake.i += 1;

  const { x, y, i, j } = snake;

  snake.body.shift();
  pushSnakeSegment(x, y, i, j);

  drawSnake();

  currentDirection = constants.RIGHT;
}

function moveUp() {
  snake.body.forEach((segment) => {
    if (segment.x && segment.y) {
      clearTile(segment.x, segment.y);
    }

    if (segment.i && segment.j) {
      clearBoardCell(segment.i, segment.j);
    }
  });

  snake.y -= constants.TILE_SIZE;
  snake.j -= 1;

  const { x, y, i, j } = snake;

  snake.body.shift();
  pushSnakeSegment(x, y, i, j);

  drawSnake();

  currentDirection = constants.TOP;
}

function moveDown() {
  snake.body.forEach((segment) => {
    if (segment.x && segment.y) {
      clearTile(segment.x, segment.y);
    }

    if (segment.i && segment.j) {
      clearBoardCell(segment.i, segment.j);
    }
  });

  snake.y += constants.TILE_SIZE;
  snake.j += 1;

  const { x, y, i, j } = snake;

  snake.body.shift();
  pushSnakeSegment(x, y, i, j);

  drawSnake();

  currentDirection = constants.BOTTOM;
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
    case "a":
    case "s":
    case "d":
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowLeft":
    case "ArrowRight": {
      updateSnakeDirection(e.key);
    }
  }
});

document.addEventListener("mousemove", () => {
  environmentSound.play();
});

drawGame();
