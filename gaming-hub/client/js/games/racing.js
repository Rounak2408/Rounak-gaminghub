(function () {
  const canvas = document.getElementById('racing-canvas');
  const ctx = canvas.getContext('2d');
  const roadW = 60;
  const carW = 40;
  const carH = 70;
  let playerX = canvas.width / 2 - carW / 2;
  let playerY = canvas.height - carH - 20;
  let obstacles = [];
  let score = 0;
  let running = false;
  let loop = null;
  let frame = 0;

  const scoreEl = document.getElementById('racing-score');
  const overlay = document.getElementById('racing-overlay');
  const finalScoreEl = document.getElementById('racing-final-score');

  function drawRoad() {
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    const mid = canvas.width / 2;
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.fillRect(mid - 3, (y + frame % 40) % (canvas.height + 40), 6, 20);
    }
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(mid - roadW, 0, roadW * 2, canvas.height);
  }

  function drawCar(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, carW, carH);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x + 5, y + 10, 10, 15);
    ctx.fillRect(x + carW - 15, y + 10, 10, 15);
  }

  function tick() {
    if (!running) return;
    frame++;
    if (frame % 90 === 0) {
      const lane = Math.random() < 0.5 ? canvas.width / 2 - roadW + 10 : canvas.width / 2 + 10;
      obstacles.push({ x: lane - carW / 2, y: -carH, w: carW, h: carH });
    }
    drawRoad();
    drawCar(playerX, playerY, '#00ff88');
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.y += 4;
      drawCar(o.x, o.y, '#ff4466');
      if (o.y > canvas.height) {
        obstacles.splice(i, 1);
        score += 10;
      } else if (o.y + o.h > playerY && o.y < playerY + carH && o.x + o.w > playerX && o.x < playerX + carW) {
        running = false;
        if (loop) cancelAnimationFrame(loop);
        window.racingScore = score;
        finalScoreEl.textContent = score;
        overlay.style.display = 'flex';
        if (typeof showSubmitScore === 'function') showSubmitScore('Car Racing', score, overlay);
        return;
      }
    }
    scoreEl.textContent = score;
    loop = requestAnimationFrame(tick);
  }

  function start() {
    if (loop) cancelAnimationFrame(loop);
    playerX = canvas.width / 2 - carW / 2;
    playerY = canvas.height - carH - 20;
    obstacles = [];
    score = 0;
    frame = 0;
    running = true;
    overlay.style.display = 'none';
    scoreEl.textContent = '0';
    document.addEventListener('keydown', keyHandler);
    loop = requestAnimationFrame(tick);
  }

  function keyHandler(e) {
    if (!running) return;
    if (e.key === 'ArrowLeft') playerX = Math.max(canvas.width / 2 - roadW, playerX - 8);
    if (e.key === 'ArrowRight') playerX = Math.min(canvas.width / 2 + roadW - carW, playerX + 8);
  }

  document.addEventListener('keydown', keyHandler);

  function bindBtnTouch(el, fn) {
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('touchend', function (e) { e.preventDefault(); fn(); }, { passive: false });
  }
  bindBtnTouch(document.getElementById('racing-start'), start);
  bindBtnTouch(document.getElementById('racing-restart'), start);
  bindBtnTouch(document.getElementById('racing-overlay-restart'), function () { overlay.style.display = 'none'; start(); });

  function moveLeft() {
    if (running) playerX = Math.max(canvas.width / 2 - roadW, playerX - 8);
  }
  function moveRight() {
    if (running) playerX = Math.min(canvas.width / 2 + roadW - carW, playerX + 8);
  }
  var racingLeft = document.getElementById('racing-left');
  var racingRight = document.getElementById('racing-right');
  if (racingLeft) {
    racingLeft.addEventListener('click', moveLeft);
    racingLeft.addEventListener('touchend', function (e) { e.preventDefault(); moveLeft(); }, { passive: false });
  }
  if (racingRight) {
    racingRight.addEventListener('click', moveRight);
    racingRight.addEventListener('touchend', function (e) { e.preventDefault(); moveRight(); }, { passive: false });
  }

  function getCanvasTouch(e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) - rect.left;
    return x / rect.width;
  }
  function onCanvasTouch(e) {
    var ratio = getCanvasTouch(e);
    if (ratio < 0.5) moveLeft();
    else moveRight();
  }
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    onCanvasTouch(e);
  }, { passive: false });
  canvas.addEventListener('click', function (e) { if (e.target === canvas) onCanvasTouch(e); });
})();
