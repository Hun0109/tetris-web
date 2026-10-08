/**
 * Neon Tetris - Complete Game Engine
 */
document.addEventListener('DOMContentLoaded', () => {
  // Canvas Elements & Contexts
  const boardCanvas = document.getElementById('tetrisCanvas');
  const boardCtx = boardCanvas.getContext('2d');

  const holdCanvas = document.getElementById('holdCanvas');
  const holdCtx = holdCanvas.getContext('2d');

  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas.getContext('2d');

  // Board Constants
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30; // 300px / 10 = 30px per block

  // DOM Elements
  const scoreEl = document.getElementById('scoreValue');
  const highScoreEl = document.getElementById('highScoreValue');
  const levelEl = document.getElementById('levelValue');
  const linesEl = document.getElementById('linesValue');

  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');
  const newRecordNotice = document.getElementById('newRecordNotice');

  const startBtn = document.getElementById('startBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const restartBtn = document.getElementById('restartBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  // Tetromino Definitions with Neon Colors
  const PIECES = {
    I: {
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.7)',
      matrix: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    },
    J: {
      color: '#0077ff',
      glow: 'rgba(0, 119, 255, 0.7)',
      matrix: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ]
    },
    L: {
      color: '#ff8800',
      glow: 'rgba(255, 136, 0, 0.7)',
      matrix: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ]
    },
    O: {
      color: '#ffe600',
      glow: 'rgba(255, 230, 0, 0.7)',
      matrix: [
        [1, 1],
        [1, 1]
      ]
    },
    S: {
      color: '#00ff66',
      glow: 'rgba(0, 255, 102, 0.7)',
      matrix: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ]
    },
    T: {
      color: '#aa00ff',
      glow: 'rgba(170, 0, 255, 0.7)',
      matrix: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ]
    },
    Z: {
      color: '#ff0055',
      glow: 'rgba(255, 0, 85, 0.7)',
      matrix: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ]
    }
  };

  const PIECE_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  // SRS Wall Kick Tables
  const WALLKICK_3X3 = [
    [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]], // 0 -> R
    [[0,0], [1,0], [1,-1], [0,2], [1,2]],    // R -> 0
    [[0,0], [1,0], [1,-1], [0,2], [1,2]],    // R -> 2
    [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]], // 2 -> R
    [[0,0], [1,0], [1,1], [0,-2], [1,-2]],    // 2 -> L
    [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],  // L -> 2
    [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],  // L -> 0
    [[0,0], [1,0], [1,1], [0,-2], [1,-2]]     // 0 -> L
  ];

  const WALLKICK_I = [
    [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],  // 0 -> R
    [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],  // R -> 0
    [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],  // R -> 2
    [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],  // 2 -> R
    [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],  // 2 -> L
    [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],  // L -> 2
    [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],  // L -> 0
    [[0,0], [-1,0], [2,0], [-1,2], [2,-1]]   // 0 -> L
  ];

  // Game State Variables
  let board = createMatrix(COLS, ROWS);
  let score = 0;
  let highScore = parseInt(localStorage.getItem('tetris_high_score') || '0', 10);
  let level = 1;
  let lines = 0;
  
  let currentPiece = null;
  let nextQueue = [];
  let holdPiece = null;
  let canHold = true;

  let gameState = 'START'; // START, PLAYING, PAUSED, GAMEOVER
  let dropCounter = 0;
  let dropInterval = 1000;
  let lastTime = 0;

  let particles = [];
  let bag = [];

  // Update Initial High Score Display
  highScoreEl.textContent = highScore;
  updateSoundButtonUI();

  // Helper Functions
  function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  function getNextPieceFromBag() {
    if (bag.length === 0) {
      bag = [...PIECE_NAMES];
      // Shuffle 7-Bag
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    const type = bag.pop();
    const pieceInfo = PIECES[type];
    return {
      type: type,
      matrix: pieceInfo.matrix.map(row => [...row]),
      color: pieceInfo.color,
      glow: pieceInfo.glow,
      x: Math.floor(COLS / 2) - Math.ceil(pieceInfo.matrix[0].length / 2),
      y: type === 'I' ? -1 : 0,
      rotation: 0
    };
  }

  function fillNextQueue() {
    while (nextQueue.length < 3) {
      nextQueue.push(getNextPieceFromBag());
    }
  }

  function spawnPiece() {
    fillNextQueue();
    currentPiece = nextQueue.shift();
    fillNextQueue();
    canHold = true;

    // Check Immediate Game Over collision
    if (collide(board, currentPiece)) {
      triggerGameOver();
    }
  }

  function holdCurrentPiece() {
    if (!canHold || gameState !== 'PLAYING') return;

    window.soundEngine.playRotate();
    canHold = false;

    if (!holdPiece) {
      holdPiece = {
        type: currentPiece.type,
        matrix: PIECES[currentPiece.type].matrix.map(row => [...row]),
        color: PIECES[currentPiece.type].color,
        glow: PIECES[currentPiece.type].glow
      };
      spawnPiece();
    } else {
      const tempType = holdPiece.type;
      holdPiece = {
        type: currentPiece.type,
        matrix: PIECES[currentPiece.type].matrix.map(row => [...row]),
        color: PIECES[currentPiece.type].color,
        glow: PIECES[currentPiece.type].glow
      };
      const pieceInfo = PIECES[tempType];
      currentPiece = {
        type: tempType,
        matrix: pieceInfo.matrix.map(row => [...row]),
        color: pieceInfo.color,
        glow: pieceInfo.glow,
        x: Math.floor(COLS / 2) - Math.ceil(pieceInfo.matrix[0].length / 2),
        y: tempType === 'I' ? -1 : 0,
        rotation: 0
      };
    }
    drawHold();
  }

  function collide(boardMatrix, piece) {
    const m = piece.matrix;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (
            boardX < 0 ||
            boardX >= COLS ||
            boardY >= ROWS ||
            (boardY >= 0 && boardMatrix[boardY][boardX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function merge(boardMatrix, piece) {
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const targetY = piece.y + y;
          const targetX = piece.x + x;
          if (targetY >= 0 && targetY < ROWS && targetX >= 0 && targetX < COLS) {
            boardMatrix[targetY][targetX] = {
              color: piece.color,
              glow: piece.glow
            };
          }
        }
      });
    });
  }

  function rotateMatrix(matrix, dir) {
    const N = matrix.length;
    const result = createMatrix(N, N);
    for (let y = 0; y < N; ++y) {
      for (let x = 0; x < N; ++x) {
        if (dir > 0) {
          result[x][N - 1 - y] = matrix[y][x];
        } else {
          result[N - 1 - x][y] = matrix[y][x];
        }
      }
    }
    return result;
  }

  function playerRotate(dir) {
    if (gameState !== 'PLAYING' || !currentPiece) return;
    
    const prevRotation = currentPiece.rotation;
    const newRotation = (prevRotation + dir + 4) % 4;
    const originalMatrix = currentPiece.matrix;
    const rotated = rotateMatrix(originalMatrix, dir);

    currentPiece.matrix = rotated;

    // SRS Wallkick test
    const kickTable = currentPiece.type === 'I' ? WALLKICK_I : WALLKICK_3X3;
    let kickIndex = 0;
    if (dir > 0) {
      kickIndex = prevRotation * 2;
    } else {
      kickIndex = (newRotation * 2 + 1) % 8;
    }

    const kicks = kickTable[kickIndex] || [[0, 0]];
    let success = false;

    for (let i = 0; i < kicks.length; i++) {
      const [offsetX, offsetY] = kicks[i];
      currentPiece.x += offsetX;
      currentPiece.y -= offsetY; // Canvas y is inverted
      if (!collide(board, currentPiece)) {
        success = true;
        currentPiece.rotation = newRotation;
        window.soundEngine.playRotate();
        break;
      }
      // Revert kick offset
      currentPiece.x -= offsetX;
      currentPiece.y += offsetY;
    }

    if (!success) {
      currentPiece.matrix = originalMatrix;
    }
  }

  function playerMove(dir) {
    if (gameState !== 'PLAYING' || !currentPiece) return;
    currentPiece.x += dir;
    if (collide(board, currentPiece)) {
      currentPiece.x -= dir;
    } else {
      window.soundEngine.playMove();
    }
  }

  function playerDrop() {
    if (gameState !== 'PLAYING' || !currentPiece) return;
    currentPiece.y++;
    if (collide(board, currentPiece)) {
      currentPiece.y--;
      lockPiece();
    } else {
      dropCounter = 0;
      score += 1; // Soft drop bonus
      updateScoreUI();
      window.soundEngine.playDrop();
    }
  }

  function playerHardDrop() {
    if (gameState !== 'PLAYING' || !currentPiece) return;
    let dropDistance = 0;
    while (!collide(board, currentPiece)) {
      currentPiece.y++;
      dropDistance++;
    }
    currentPiece.y--;
    dropDistance--;

    score += dropDistance * 2; // Hard drop bonus
    updateScoreUI();

    triggerScreenShake();
    window.soundEngine.playHardDrop();
    lockPiece();
  }

  function lockPiece() {
    merge(board, currentPiece);
    checkLineClears();
    spawnPiece();
    drawHold();
    drawNext();
  }

  function getGhostY() {
    if (!currentPiece) return 0;
    let ghostY = currentPiece.y;
    while (!collide(board, { ...currentPiece, y: ghostY + 1 })) {
      ghostY++;
    }
    return ghostY;
  }

  function checkLineClears() {
    let linesCleared = 0;
    const clearedRows = [];

    for (let y = ROWS - 1; y >= 0; y--) {
      let isFull = true;
      for (let x = 0; x < COLS; x++) {
        if (board[y][x] === 0) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        linesCleared++;
        clearedRows.push(y);
      }
    }

    if (linesCleared > 0) {
      // Spawn particles along cleared lines
      clearedRows.forEach(rowY => {
        for (let x = 0; x < COLS; x++) {
          const color = board[rowY][x].color || '#00f0ff';
          createParticles(x * BLOCK_SIZE + BLOCK_SIZE / 2, rowY * BLOCK_SIZE + BLOCK_SIZE / 2, color);
        }
      });

      // Remove lines
      clearedRows.forEach(rowY => {
        board.splice(rowY, 1);
        board.unshift(new Array(COLS).fill(0));
      });

      // Score multipliers
      const lineScores = [0, 100, 300, 500, 800];
      score += (lineScores[linesCleared] || 800) * level;
      lines += linesCleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(80, 1000 - (level - 1) * 85);

      if (linesCleared === 4) {
        triggerScreenShake();
      }

      window.soundEngine.playLineClear(linesCleared);
      updateScoreUI();
    }
  }

  function triggerScreenShake() {
    const container = document.getElementById('boardContainer');
    container.classList.remove('shake');
    void container.offsetWidth; // Trigger reflow
    container.classList.add('shake');
    setTimeout(() => {
      container.classList.remove('shake');
    }, 200);
  }

  function updateScoreUI() {
    scoreEl.textContent = score.toLocaleString();
    levelEl.textContent = level;
    linesEl.textContent = lines;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('tetris_high_score', highScore);
      highScoreEl.textContent = highScore.toLocaleString();
    }
  }

  // Particle System
  function createParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 4 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  function updateAndDrawParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Render Functions
  function drawBlock(ctx, x, y, color, glow, isGhost = false) {
    const pixelX = x * BLOCK_SIZE;
    const pixelY = y * BLOCK_SIZE;

    ctx.save();

    if (isGhost) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(pixelX + 2, pixelY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    } else {
      ctx.shadowColor = glow || color;
      ctx.shadowBlur = 12;

      // Base Neon Fill
      ctx.fillStyle = color;
      ctx.fillRect(pixelX + 1, pixelY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

      // Inner Highlight Gradient
      const grad = ctx.createLinearGradient(pixelX, pixelY, pixelX + BLOCK_SIZE, pixelY + BLOCK_SIZE);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(pixelX + 2, pixelY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    }

    ctx.restore();
  }

  function drawBoard() {
    boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

    // Draw Grid Lines
    boardCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    boardCtx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      boardCtx.beginPath();
      boardCtx.moveTo(x * BLOCK_SIZE, 0);
      boardCtx.lineTo(x * BLOCK_SIZE, boardCanvas.height);
      boardCtx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      boardCtx.beginPath();
      boardCtx.moveTo(0, y * BLOCK_SIZE);
      boardCtx.lineTo(boardCanvas.width, y * BLOCK_SIZE);
      boardCtx.stroke();
    }

    // Draw Locked Blocks
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x] !== 0) {
          const block = board[y][x];
          drawBlock(boardCtx, x, y, block.color, block.glow);
        }
      }
    }

    // Draw Ghost Piece & Active Piece
    if (currentPiece && gameState === 'PLAYING') {
      const ghostY = getGhostY();
      // Draw Ghost
      currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const drawY = ghostY + y;
            if (drawY >= 0) {
              drawBlock(boardCtx, currentPiece.x + x, drawY, currentPiece.color, currentPiece.glow, true);
            }
          }
        });
      });

      // Draw Active Piece
      currentPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const drawY = currentPiece.y + y;
            if (drawY >= 0) {
              drawBlock(boardCtx, currentPiece.x + x, drawY, currentPiece.color, currentPiece.glow);
            }
          }
        });
      });
    }

    // Draw Particles
    updateAndDrawParticles(boardCtx);
  }

  function drawMiniPiece(ctx, piece, width, height) {
    ctx.clearRect(0, 0, width, height);
    if (!piece) return;

    const matrix = piece.matrix;
    const miniSize = 22;
    const offsetX = (width - matrix[0].length * miniSize) / 2;
    const offsetY = (height - matrix.length * miniSize) / 2;

    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const px = offsetX + x * miniSize;
          const py = offsetY + y * miniSize;

          ctx.save();
          ctx.shadowColor = piece.glow || piece.color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = piece.color;
          ctx.fillRect(px + 1, py + 1, miniSize - 2, miniSize - 2);

          const grad = ctx.createLinearGradient(px, py, px + miniSize, py + miniSize);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
          ctx.fillStyle = grad;
          ctx.fillRect(px + 2, py + 2, miniSize - 4, miniSize - 4);

          ctx.restore();
        }
      });
    });
  }

  function drawHold() {
    drawMiniPiece(holdCtx, holdPiece, holdCanvas.width, holdCanvas.height);
  }

  function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const miniSize = 20;

    nextQueue.forEach((piece, index) => {
      const matrix = piece.matrix;
      const offsetX = (nextCanvas.width - matrix[0].length * miniSize) / 2;
      const offsetY = 20 + index * 80 + (80 - matrix.length * miniSize) / 2;

      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const px = offsetX + x * miniSize;
            const py = offsetY + y * miniSize;

            nextCtx.save();
            nextCtx.shadowColor = piece.glow || piece.color;
            nextCtx.shadowBlur = 6;
            nextCtx.fillStyle = piece.color;
            nextCtx.fillRect(px + 1, py + 1, miniSize - 2, miniSize - 2);
            nextCtx.restore();
          }
        });
      });
    });
  }

  // Main Loop
  function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (gameState === 'PLAYING') {
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        playerDrop();
      }
    }

    drawBoard();
    requestAnimationFrame(gameLoop);
  }

  // Game Control Functions
  function startGame() {
    board = createMatrix(COLS, ROWS);
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    bag = [];
    nextQueue = [];
    holdPiece = null;
    particles = [];

    updateScoreUI();
    spawnPiece();
    drawHold();
    drawNext();

    gameState = 'PLAYING';
    startOverlay.classList.add('hidden');
    startOverlay.classList.remove('active');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
  }

  function togglePause() {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
      pauseOverlay.classList.remove('hidden');
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
      pauseOverlay.classList.add('hidden');
    }
  }

  function triggerGameOver() {
    gameState = 'GAMEOVER';
    window.soundEngine.playGameOver();

    finalScoreEl.textContent = score.toLocaleString();
    if (score >= highScore && score > 0) {
      newRecordNotice.classList.remove('hidden');
    } else {
      newRecordNotice.classList.add('hidden');
    }

    gameOverOverlay.classList.remove('hidden');
  }

  function updateSoundButtonUI() {
    if (window.soundEngine.isMuted) {
      soundIcon.textContent = '🔇';
      soundText.textContent = '사운드 OFF';
    } else {
      soundIcon.textContent = '🔊';
      soundText.textContent = '사운드 ON';
    }
  }

  // Event Listeners
  startBtn.addEventListener('click', startGame);
  resumeBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', startGame);

  soundToggleBtn.addEventListener('click', () => {
    window.soundEngine.toggleMute();
    updateSoundButtonUI();
  });

  // Keyboard Event Listener
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' || e.code === 'Escape') {
      togglePause();
      return;
    }

    if (gameState !== 'PLAYING') return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        playerMove(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        playerMove(1);
        break;
      case 'ArrowDown':
      case 'KeyS':
        playerDrop();
        break;
      case 'Space':
        e.preventDefault();
        playerHardDrop();
        break;
      case 'ArrowUp':
      case 'KeyX':
        playerRotate(1);
        break;
      case 'KeyZ':
        playerRotate(-1);
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyC':
        holdCurrentPiece();
        break;
    }
  });

  // Mobile Touch Controls Listener
  document.getElementById('btnLeft').addEventListener('click', () => playerMove(-1));
  document.getElementById('btnRight').addEventListener('click', () => playerMove(1));
  document.getElementById('btnDown').addEventListener('click', () => playerDrop());
  document.getElementById('btnRotate').addEventListener('click', () => playerRotate(1));
  document.getElementById('btnHardDrop').addEventListener('click', () => playerHardDrop());
  document.getElementById('btnHold').addEventListener('click', () => holdCurrentPiece());
  document.getElementById('btnPause').addEventListener('click', () => togglePause());

  // Start Animation Loop
  requestAnimationFrame(gameLoop);
});
