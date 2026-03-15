(function () {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const cell = 20;
  let W = 20;
  let H = 20;

  let snake = [];
  let food = { x: 0, y: 0 };
  let dir = { x: 0, y: 0 };
  let score = 0;
  let running = false;
  let gameInterval = null;
  let startTimeout = null;
  let tickCount = 0;
  const MOVE_DELAY_MS = 140;

  const scoreEl = document.getElementById('snake-score');
  const overlay = document.getElementById('snake-overlay');
  const finalScoreEl = document.getElementById('snake-final-score');

  function randPos() {
    return { x: (Math.random() * W) | 0, y: (Math.random() * H) | 0 };
  }

  function placeFood() {
    do {
      food = randPos();
    } while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= W; i++) ctx.fillStyle = 'rgba(0,245,255,0.05)', ctx.fillRect(i * cell, 0, 1, canvas.height);
    for (let j = 0; j <= H; j++) ctx.fillRect(0, j * cell, canvas.width, 1);

    ctx.fillStyle = '#00ff88';
    snake.forEach((s, i) => {
      ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
    });
    ctx.fillStyle = '#ff00aa';
    ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
  }

  function tick() {
    if (!running) return;
    tickCount++;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    var canCheckGameOver = tickCount > 2;
    if (canCheckGameOver && (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H || snake.some(s => s.x === head.x && s.y === head.y))) {
      running = false;
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = null;
      window.snakeScore = score;
      finalScoreEl.textContent = score;
      overlay.style.display = 'flex';
      if (typeof showSubmitScore === 'function') showSubmitScore('Snake', score, overlay);
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
    } else {
      snake.pop();
    }
    if (scoreEl) scoreEl.textContent = score;
    draw();
  }

  function start() {
    if (startTimeout) clearTimeout(startTimeout);
    startTimeout = null;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = null;
    var cw = parseInt(canvas.getAttribute('width'), 10) || 400;
    var ch = parseInt(canvas.getAttribute('height'), 10) || 400;
    if (!cw || !ch || cw < 100 || ch < 100) { cw = 400; ch = 400; }
    canvas.setAttribute('width', cw);
    canvas.setAttribute('height', ch);
    canvas.width = cw;
    canvas.height = ch;
    W = Math.floor(cw / cell);
    H = Math.floor(ch / cell);
    if (W < 5) W = 20;
    if (H < 5) H = 20;
    var midX = Math.floor(W / 2);
    var midY = Math.floor(H / 2);
    if (midX < 1) midX = 1;
    if (midY < 1) midY = 1;
    snake = [{ x: midX, y: midY }];
    dir = { x: 1, y: 0 };
    score = 0;
    tickCount = 0;
    placeFood();
    overlay.style.display = 'none';
    scoreEl.textContent = '0';
    draw();
    running = true;
    try { canvas.focus(); } catch (err) {}
    startTimeout = setTimeout(function () {
      startTimeout = null;
      if (!running) return;
      gameInterval = setInterval(tick, MOVE_DELAY_MS);
    }, 80);
  }

  function handleKey(e) {
    var key = e.key || e.code || '';
    if (key === 'ArrowLeft' || key === 'Left') {
      e.preventDefault();
      if (dir.x !== 1) dir = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' || key === 'Right') {
      e.preventDefault();
      if (dir.x !== -1) dir = { x: 1, y: 0 };
    } else if (key === 'ArrowUp' || key === 'Up') {
      e.preventDefault();
      if (dir.y !== 1) dir = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' || key === 'Down') {
      e.preventDefault();
      if (dir.y !== -1) dir = { x: 0, y: 1 };
    }
  }

  document.addEventListener('keydown', function (e) {
    if (!running) return;
    handleKey(e);
  });

  canvas.setAttribute('tabindex', '0');
  canvas.addEventListener('keydown', function (e) {
    if (!running) return;
    handleKey(e);
  });

  document.getElementById('snake-start').addEventListener('click', start);
  document.getElementById('snake-restart').addEventListener('click', start);
  document.getElementById('snake-overlay-restart').addEventListener('click', () => { overlay.style.display = 'none'; start(); });

  ['snake-up', 'snake-down', 'snake-left', 'snake-right'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function () {
      if (!running) return;
      if (id === 'snake-up' && dir.y !== 1) dir = { x: 0, y: -1 };
      if (id === 'snake-down' && dir.y !== -1) dir = { x: 0, y: 1 };
      if (id === 'snake-left' && dir.x !== 1) dir = { x: -1, y: 0 };
      if (id === 'snake-right' && dir.x !== -1) dir = { x: 1, y: 0 };
    });
    el.addEventListener('touchend', function (e) { e.preventDefault(); });
  });
})();
