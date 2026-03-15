(function () {
  const canvas = document.getElementById('tetris-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 20;
  const colors = ['#00f5ff', '#bf00ff', '#00ff88', '#ff00aa', '#ffff00', '#ff8800', '#00aaff'];

  const shapes = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[0,1,1],[1,1,0]],
    [[1,1,0],[0,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]]
  ];

  let grid = [];
  let current = null;
  let nextPiece = null;
  let score = 0;
  let level = 1;
  let lines = 0;
  let running = false;
  let gameInterval = null;
  let dropInterval = 1200;

  const scoreEl = document.getElementById('tetris-score');
  const levelEl = document.getElementById('tetris-level');
  const overlay = document.getElementById('tetris-overlay');
  const finalScoreEl = document.getElementById('tetris-final-score');

  function createGrid() {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  }

  function randomPiece() {
    const i = Math.floor(Math.random() * shapes.length);
    return { shape: shapes[i].map(r => [...r]), color: colors[i], x: Math.floor((COLS - shapes[i][0].length) / 2), y: 0 };
  }

  function drawBlock(x, y, color) {
    const px = x * BLOCK;
    const py = y * BLOCK;
    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, BLOCK, BLOCK);
  }

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x]) drawBlock(x, y, grid[y][x]);
      }
    }
    if (current) {
      current.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell) drawBlock(current.x + dx, current.y + dy, current.color);
        });
      });
    }
  }

  function collide(p, ox, oy) {
    for (let dy = 0; dy < p.shape.length; dy++) {
      for (let dx = 0; dx < p.shape[0].length; dx++) {
        if (!p.shape[dy][dx]) continue;
        const nx = p.x + dx + ox;
        const ny = p.y + dy + oy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx]) return true;
      }
    }
    return false;
  }

  function merge() {
    current.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell && current.y + dy >= 0) {
          grid[current.y + dy][current.x + dx] = current.color;
        }
      });
    });
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (grid[y].every(c => c)) {
        grid.splice(y, 1);
        grid.unshift(Array(COLS).fill(0));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800];
      score += (points[cleared] || 800) * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(150, 1200 - (level - 1) * 80);
      if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(tick, dropInterval);
      }
    }
  }

  function spawn() {
    current = nextPiece || randomPiece();
    nextPiece = randomPiece();
    if (collide(current, 0, 0)) {
      running = false;
      if (gameInterval) clearInterval(gameInterval);
      window.tetrisScore = score;
      if (finalScoreEl) finalScoreEl.textContent = score;
      if (overlay) overlay.style.display = 'flex';
      if (typeof showSubmitScore === 'function') showSubmitScore('Tetris', score, overlay);
      return;
    }
  }

  function tick() {
    if (!running || !current) return;
    if (collide(current, 0, 1)) {
      merge();
      clearLines();
      spawn();
    } else {
      current.y++;
    }
    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = level;
    draw();
  }

  function move(dx) {
    if (!running || !current) return;
    if (!collide(current, dx, 0)) {
      current.x += dx;
      draw();
    }
  }

  function rotate() {
    if (!running || !current) return;
    const rotated = current.shape[0].map((_, i) => current.shape.map(r => r[i]).reverse());
    const prev = current.shape;
    current.shape = rotated;
    if (collide(current, 0, 0)) current.shape = prev;
    else draw();
  }

  function hardDrop() {
    if (!running || !current) return;
    while (!collide(current, 0, 1)) current.y++;
    merge();
    score += (current.y - 0) * 2;
    clearLines();
    spawn();
    if (scoreEl) scoreEl.textContent = score;
    draw();
  }

  function start() {
    if (gameInterval) clearInterval(gameInterval);
    canvas.width = COLS * BLOCK;
    canvas.height = ROWS * BLOCK;
    grid = createGrid();
    score = 0;
    level = 1;
    lines = 0;
    nextPiece = null;
    dropInterval = 1200;
    running = true;
    if (overlay) overlay.style.display = 'none';
    if (scoreEl) scoreEl.textContent = '0';
    if (levelEl) levelEl.textContent = '1';
    spawn();
    draw();
    gameInterval = setInterval(tick, dropInterval);
  }

  document.addEventListener('keydown', function (e) {
    if (!running) return;
    const k = e.key || e.code;
    if (k === 'ArrowLeft' || k === 'Left') { e.preventDefault(); move(-1); }
    else if (k === 'ArrowRight' || k === 'Right') { e.preventDefault(); move(1); }
    else if (k === 'ArrowDown' || k === 'Down') { e.preventDefault(); tick(); }
    else if (k === 'ArrowUp' || k === 'Up') { e.preventDefault(); rotate(); }
    else if (k === ' ') { e.preventDefault(); hardDrop(); }
  });

  var tetrisStart = document.getElementById('tetris-start');
  var tetrisRestart = document.getElementById('tetris-restart');
  if (tetrisStart) tetrisStart.addEventListener('click', start);
  if (tetrisRestart) tetrisRestart.addEventListener('click', start);
  var overlayRestart = document.getElementById('tetris-overlay-restart');
  if (overlayRestart) overlayRestart.addEventListener('click', function () { if (overlay) overlay.style.display = 'none'; start(); });

  function bindMobileBtn(id, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
  }
  bindMobileBtn('tetris-left', function () { move(-1); });
  bindMobileBtn('tetris-right', function () { move(1); });
  bindMobileBtn('tetris-rotate', rotate);
  bindMobileBtn('tetris-drop', hardDrop);
})();
