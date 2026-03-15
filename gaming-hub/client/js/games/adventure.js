(function () {
  const canvas = document.getElementById('adventure-canvas');
  const ctx = canvas.getContext('2d');
  const gravity = 0.5;
  const jump = -12;
  const platformH = 15;
  let player = { x: 50, y: 300, w: 30, h: 40, vy: 0 };
  let platforms = [
    { x: 0, y: 360, w: 400 },
    { x: 100, y: 280, w: 80 },
    { x: 220, y: 220, w: 80 },
    { x: 320, y: 280, w: 80 },
    { x: 150, y: 160, w: 100 }
  ];
  let coins = [
    { x: 120, y: 250, r: 12, taken: false },
    { x: 240, y: 190, r: 12, taken: false },
    { x: 360, y: 250, r: 12, taken: false },
    { x: 200, y: 130, r: 12, taken: false }
  ];
  let score = 0;
  let running = false;
  let loop = null;
  let keys = { left: false, right: false };

  const scoreEl = document.getElementById('adventure-score');
  const overlay = document.getElementById('adventure-overlay');
  const finalScoreEl = document.getElementById('adventure-final-score');

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, platformH));
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    coins.forEach(c => {
      if (c.taken) return;
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(c.x + c.r, c.y + c.r, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function tick() {
    if (!running) return;
    player.vy += gravity;
    player.x += (keys.right ? 5 : 0) - (keys.left ? 5 : 0);
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    player.y += player.vy;

    platforms.forEach(p => {
      if (player.vy > 0 && player.y + player.h >= p.y && player.y + player.h <= p.y + platformH &&
          player.x + player.w > p.x && player.x < p.x + p.w) {
        player.y = p.y - player.h;
        player.vy = 0;
        if (keys.left || keys.right) { /* allow jump on next key */ }
      }
    });
    if (player.y + player.h >= canvas.height) {
      player.y = canvas.height - player.h;
      player.vy = 0;
    }
    if (player.y < 0) player.y = 0;

    coins.forEach(c => {
      if (c.taken) return;
      const dx = (player.x + player.w/2) - (c.x + c.r);
      const dy = (player.y + player.h/2) - (c.y + c.r);
      if (dx*dx + dy*dy < (c.r + 20) * (c.r + 20)) {
        c.taken = true;
        score += 25;
      }
    });
    const allCollected = coins.every(c => c.taken);
    if (allCollected) {
      running = false;
      if (loop) cancelAnimationFrame(loop);
      window.adventureScore = score;
      finalScoreEl.textContent = score;
      overlay.querySelector('h2').textContent = 'You Win!';
      overlay.style.display = 'flex';
      if (typeof showSubmitScore === 'function') showSubmitScore('Character Adventure', score, overlay);
      return;
    }

    scoreEl.textContent = score;
    draw();
    loop = requestAnimationFrame(tick);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (running && player.vy === 0) player.vy = jump;
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  });

  function start() {
    if (loop) cancelAnimationFrame(loop);
    player = { x: 50, y: 300, w: 30, h: 40, vy: 0 };
    coins.forEach(c => c.taken = false);
    score = 0;
    running = true;
    overlay.style.display = 'none';
    scoreEl.textContent = '0';
    draw();
    loop = requestAnimationFrame(tick);
  }

  function bindBtnTouch(el, fn) {
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('touchend', function (e) { e.preventDefault(); fn(); }, { passive: false });
  }
  bindBtnTouch(document.getElementById('adventure-start'), start);
  bindBtnTouch(document.getElementById('adventure-restart'), start);
  bindBtnTouch(document.getElementById('adventure-overlay-restart'), function () { overlay.style.display = 'none'; start(); });

  function doJump() {
    if (running && player.vy === 0) player.vy = jump;
  }
  var advLeft = document.getElementById('adventure-left');
  var advRight = document.getElementById('adventure-right');
  var advJump = document.getElementById('adventure-jump');
  if (advLeft) {
    advLeft.addEventListener('mousedown', () => keys.left = true);
    advLeft.addEventListener('mouseup', () => keys.left = false);
    advLeft.addEventListener('mouseleave', () => keys.left = false);
    advLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys.left = true; }, { passive: false });
    advLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; }, { passive: false });
  }
  if (advRight) {
    advRight.addEventListener('mousedown', () => keys.right = true);
    advRight.addEventListener('mouseup', () => keys.right = false);
    advRight.addEventListener('mouseleave', () => keys.right = false);
    advRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; }, { passive: false });
    advRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.right = false; }, { passive: false });
  }
  if (advJump) {
    advJump.addEventListener('click', doJump);
    advJump.addEventListener('touchend', function (e) { e.preventDefault(); doJump(); }, { passive: false });
  }

  function getCanvasTouch(e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) - rect.left;
    var y = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: x / rect.width, y: y / rect.height };
  }
  function onCanvasTouch(e) {
    var p = getCanvasTouch(e);
    if (p.x < 0.33) keys.left = true;
    else if (p.x > 0.66) keys.right = true;
    else doJump();
  }
  function onCanvasTouchEnd(e) {
    keys.left = false;
    keys.right = false;
  }
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    onCanvasTouch(e);
  }, { passive: false });
  canvas.addEventListener('touchend', function (e) {
    e.preventDefault();
    onCanvasTouchEnd(e);
  }, { passive: false });
  canvas.addEventListener('click', function (e) {
    if (e.target === canvas) onCanvasTouch(e);
  });
})();
