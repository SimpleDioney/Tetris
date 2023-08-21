

let speed = 500;
let level = 1;
let gameInterval;
let touchStartX = 0;
let touchStartY = 0;
const game = document.getElementById('game');
const rows = 20;
const cols = 10;
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let score = 0;

const pieces = [
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'blue' },
  { shape: [[1, 1], [1, 1]], color: 'red' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'green' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'yellow' },
  { shape: [[1, 1, 1, 1]], color: 'purple' },
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'orange' },
  { shape: [[1, 1, 1], [0, 0, 1]], color: 'cyan' }
];

let nextPiece = randomPiece();
let currentPiece = randomPiece();
let pieceX = 3;
let pieceY = 0;

function randomPiece() {
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function drawBoard() {
  game.innerHTML = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.left = `${x * 20}px`;
      cell.style.top = `${y * 20}px`;
      if (y >= pieceY && y < pieceY + currentPiece.shape.length &&
        x >= pieceX && x < pieceX + currentPiece.shape[0].length &&
        currentPiece.shape[y - pieceY][x - pieceX]) {
        cell.style.background = currentPiece.color;
      } else {
        cell.style.background = board[y][x] ? board[y][x] : 'white';
      }
      game.appendChild(cell);
    }
  }

  // Mostrar a próxima peça
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const cell = document.createElement('div');
      cell.className = 'preview-cell';
      if (nextPiece.shape[y] && nextPiece.shape[y][x]) {
        cell.style.background = nextPiece.color;
      } else {
        cell.style.background = 'transparent'; // Definindo como transparente se não faz parte da próxima peça
      }
      preview.appendChild(cell);
    }
  }
}
function rotatePiece() {
  let originalShape = currentPiece.shape;
  let newShape = [];
  for (let y = 0; y < originalShape[0].length; y++) {
    newShape[y] = [];
    for (let x = 0; x < originalShape.length; x++) {
      newShape[y][x] = originalShape[x][originalShape[0].length - y - 1];
    }
  }
  currentPiece.shape = newShape;

  if (collision()) {
    currentPiece.shape = originalShape; // Revert to original shape if collision detected
  }

  drawBoard();
}

function updateLevel() {
  level = Math.floor(score / 100) + 1;
  speed = 500 - (level - 1) * 50;
  document.getElementById('level').innerText = `Nível: ${level}`;
  clearInterval(gameInterval);
  gameInterval = setInterval(() => movePiece(0, 1), speed);
}

function collision() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        let newX = x + pieceX;
        let newY = y + pieceY;
        if (newX < 0 || newX >= cols || newY < 0 || newY >= rows || board[newY][newX] !== 0) return true;
      }
    }
  }
  return false;
}


function movePiece(dx, dy) {
  let oldX = pieceX;
  let oldY = pieceY;
  pieceX += dx;
  pieceY += dy;

  if (collision()) {
    pieceX = oldX;
    pieceY = oldY;
    if (dy !== 0) {
      mergePiece();
      pieceY = 0;
      pieceX = 3;
      currentPiece = nextPiece;
      nextPiece = randomPiece();
      if (collision()) {
        clearInterval(gameInterval);
        gameOver(); // Chame esta função quando o jogo terminar
        return;
      }
    }
  }
  drawBoard();
}

function mergePiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        board[y + pieceY][x + pieceX] = currentPiece.color;
      }
    }
  }
  updateLevel();
  removeLines();

  // Atualizar a pontuação
  score += 10;
  document.getElementById('score').innerText = `Pontuação: ${score}`;
}

function gameOver() {
  clearInterval(gameInterval);
  document.getElementById('game-over-screen').style.display = 'flex';
}

document.getElementById('restart-button').addEventListener('click', function() {
  // Reinicialize todas as variáveis do jogo
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  score = 0;
  level = 1;
  speed = 500;
  pieceX = 3;
  pieceY = 0;
  nextPiece = randomPiece();
  currentPiece = randomPiece();

  // Atualize a pontuação e o nível
  document.getElementById('score').innerText = `Pontuação: ${score}`;
  document.getElementById('level').innerText = `Nível: ${level}`;

  // Oculte a tela de "Game Over"
  document.getElementById('game-over-screen').style.display = 'none';

  // Comece um novo intervalo do jogo
  gameInterval = setInterval(() => movePiece(0, 1), speed);

  // Desenhe o quadro
  drawBoard();
});


function removeLines() {
  let linesRemoved = 0;

  for (let y = rows - 1; y >= 0;) {
    let isComplete = true;
    for (let x = 0; x < cols; x++) {
      if (!board[y][x]) {
        isComplete = false;
        break;
      }
    }

    if (isComplete) {
      const row = board.splice(y, 1)[0].fill(0);
      board.unshift(row);
      linesRemoved++;
      // Não decrementar y aqui, pois queremos verificar a mesma linha novamente após a remoção
    } else {
      y--; // Somente passar para a próxima linha se a linha atual não for completa
    }
  }

  // Atualizando a pontuação com base nas linhas removidas
  score += linesRemoved * 10 * linesRemoved; // Pontos extras para múltiplas linhas
  document.getElementById('score').innerText = `Pontuação: ${score}`;
  updateLevel(); // Atualizar o nível
}



document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    movePiece(-1, 0);
  } else if (e.key === 'ArrowRight') {
    movePiece(1, 0);
  } else if (e.key === 'ArrowDown') {
    movePiece(0, 1);
  } else if (e.key === 'r') {
    rotatePiece();
  }
});

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  e.preventDefault(); // Prevenir a rolagem padrão
  const touchEndX = e.touches[0].clientX;
  const touchEndY = e.touches[0].clientY;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;

  // Configurar sensibilidade para os gestos
  const sensitivity = 1;

  if (Math.abs(diffX) > sensitivity) {
    if (diffX > 0) {
      movePiece(-1, 0); // Deslizar para a esquerda
    } else {
      movePiece(1, 0); // Deslizar para a direita
    }
  } else if (Math.abs(diffY) > sensitivity) {
    if (diffY > 0) {
      movePiece(0, 1); // Deslizar para baixo
    }
  }
}

function handleTouchEnd() {
  // Rotacionar a peça no toque simples
  rotatePiece();
}

const gameArea = document.getElementById('game');
gameArea.addEventListener('touchstart', handleTouchStart, false);
gameArea.addEventListener('touchmove', handleTouchMove, false);
gameArea.addEventListener('touchend', handleTouchEnd, false);


gameInterval = setInterval(() => movePiece(0, 1), speed);

drawBoard();