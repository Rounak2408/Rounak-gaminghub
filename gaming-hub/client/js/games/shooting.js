(function () {
  const canvas = document.getElementById('shooting-canvas');
  const ctx = canvas.getContext('2d');
  let targets = [];
  let score = 0;
  let running = false;
  let loop = null;
  let timeLeft = 30;

  const scoreEl = document.getElementById('shooting-score');
  const overlay = document.getElementById('shooting-overlay');
  const finalScoreEl = document.getElementById('shooting-final-score');

  function spawnTarget() {
    if (!running) return;
    targets.push({
      x: 30 + Math.random() * (canvas.width - 60),
      y: 30 + Math.random() * (canvas.height - 60),
      r: 20
    });
  }

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
    ctx.strokeStyle = '#00f5ff';
    targets.forEach(t => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = '#e8e8f0';
    ctx.font = '14px Rajdhani';
    ctx.fillText('Time: ' + timeLeft + 's', 10, 20);
  }

  function tick() {
    if (!running) return;
    timeLeft -= 1/60;
    if (timeLeft <= 0) {
      running = false;
      if (loop) cancelAnimationFrame(loop);
      window.shootingScore = score;
      finalScoreEl.textContent = score;
      overlay.style.display = 'flex';
      if (typeof showSubmitScore === 'function') showSubmitScore('Shooting Game', score, overlay);
      return;
    }
    if (Math.random() < 0.03) spawnTarget();
    draw();
    loop = requestAnimationFrame(tick);
  }

  canvas.addEventListener('click', (e) => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      const dx = x - t.x, dy = y - t.y;
      if (dx * dx + dy * dy <= t.r * t.r) {
        targets.splice(i, 1);
        score += 10;
        if (scoreEl) scoreEl.textContent = score;
        break;
      }
    }
  });

  function start() {
    if (loop) cancelAnimationFrame(loop);
    targets = [];
    score = 0;
    timeLeft = 30;
    running = true;
    overlay.style.display = 'none';
    scoreEl.textContent = '0';
    spawnTarget();
    draw();
    loop = requestAnimationFrame(tick);
  }

  document.getElementById('shooting-start').addEventListener('click', start);
  document.getElementById('shooting-restart').addEventListener('click', start);
  document.getElementById('shooting-overlay-restart').addEventListener('click', () => { overlay.style.display = 'none'; start(); });
})();
