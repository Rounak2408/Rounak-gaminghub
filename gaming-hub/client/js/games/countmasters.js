(function () {
  const canvas = document.getElementById('countmasters-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CW = 400;
  const CH = 320;
  let crowd = 5;
  let crowdX = 80;
  let scrollX = 0;
  let gates = [];
  let running = false;
  let gameLoop = null;
  let score = 0;
  let gateId = 0;

  const scoreEl = document.getElementById('countmasters-score');
  const overlay = document.getElementById('countmasters-overlay');
  const finalScoreEl = document.getElementById('countmasters-final-score');

  const GATE_TYPES = [
    { type: 'mult', value: 2, text: 'x2', color: '#00ff88' },
    { type: 'mult', value: 3, text: 'x3', color: '#00ff88' },
    { type: 'add', value: 10, text: '+10', color: '#00f5ff' },
    { type: 'add', value: 20, text: '+20', color: '#00f5ff' },
    { type: 'add', value: 5, text: '+5', color: '#00f5ff' },
    { type: 'sub', value: 3, text: '-3', color: '#ff4466' },
    { type: 'sub', value: 5, text: '-5', color: '#ff4466' },
    { type: 'finish', value: 0, text: 'END', color: '#ffff00' }
  ];

  function spawnGate() {
    var types = GATE_TYPES;
    if (scrollX < 500) types = GATE_TYPES.filter(function (t) { return t.type !== 'finish'; });
    const idx = Math.floor(Math.random() * types.length);
    const g = types[idx];
    gates.push({
      id: ++gateId,
      x: scrollX + CW + 80 + Math.random() * 60,
      type: g.type,
      value: g.value,
      text: g.text,
      color: g.color
    });
  }

  function drawStickman(x, y, scale) {
    const s = scale || 1;
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 6 * s);
    ctx.lineTo(x, y + 18 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 10 * s);
    ctx.lineTo(x - 8 * s, y + 20 * s);
    ctx.moveTo(x, y + 10 * s);
    ctx.lineTo(x + 8 * s, y + 20 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + 18 * s);
    ctx.lineTo(x - 6 * s, y + 28 * s);
    ctx.moveTo(x, y + 18 * s);
    ctx.lineTo(x + 6 * s, y + 28 * s);
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CW, CH);
    ctx.strokeStyle = 'rgba(0,245,255,0.2)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, CH - 40);
    ctx.lineTo(CW + 500, CH - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    const baseY = CH - 70;
    const numStickmen = Math.min(crowd, 12);
    for (let i = 0; i < numStickmen; i++) {
      const ox = (i % 4) * 18 - 30;
      const oy = Math.floor(i / 4) * -25;
      drawStickman(crowdX + ox - scrollX, baseY + oy, 0.9);
    }

    gates.forEach(function (g) {
      const gx = g.x - scrollX;
      if (gx < -60 || gx > CW + 40) return;
      ctx.fillStyle = 'rgba(10,10,15,0.9)';
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3;
      ctx.fillRect(gx, CH - 120, 56, 70);
      ctx.strokeRect(gx, CH - 120, 56, 70);
      ctx.fillStyle = g.color;
      ctx.font = 'bold 22px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.text, gx + 28, CH - 75);
    });

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CROWD: ' + crowd, 12, 28);
  }

  function tick() {
    if (!running) return;
    scrollX += 2.5;
    if (gates.length < 3 && Math.random() < 0.02) spawnGate();

    for (let i = gates.length - 1; i >= 0; i--) {
      const g = gates[i];
      const gx = g.x - scrollX;
      if (gx < crowdX + 40 && gx > crowdX - 30) {
        if (g.type === 'mult') crowd *= g.value;
        else if (g.type === 'add') crowd += g.value;
        else if (g.type === 'sub') crowd = Math.max(0, crowd - g.value);
        else if (g.type === 'finish') {
          score = crowd;
          running = false;
          if (gameLoop) cancelAnimationFrame(gameLoop);
          window.countmastersScore = score;
          if (finalScoreEl) finalScoreEl.textContent = score;
          if (overlay) overlay.style.display = 'flex';
          if (typeof showSubmitScore === 'function') showSubmitScore('Count Masters', score, overlay);
          return;
        }
        gates.splice(i, 1);
        if (crowd <= 0) {
          running = false;
          if (gameLoop) cancelAnimationFrame(gameLoop);
          score = 0;
          window.countmastersScore = 0;
          if (finalScoreEl) finalScoreEl.textContent = '0';
          if (overlay) overlay.style.display = 'flex';
          if (typeof showSubmitScore === 'function') showSubmitScore('Count Masters', 0, overlay);
          return;
        }
      }
    }

    if (scoreEl) scoreEl.textContent = crowd;
    draw();
    gameLoop = requestAnimationFrame(tick);
  }

  function start() {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    crowd = 5;
    scrollX = 0;
    gates = [];
    running = true;
    if (overlay) overlay.style.display = 'none';
    if (scoreEl) scoreEl.textContent = '5';
    canvas.width = CW;
    canvas.height = CH;
    draw();
    gameLoop = requestAnimationFrame(tick);
  }

  function bindBtnTouch(el, fn) {
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('touchend', function (e) { e.preventDefault(); fn(); }, { passive: false });
  }
  bindBtnTouch(document.getElementById('countmasters-start'), start);
  bindBtnTouch(document.getElementById('countmasters-restart'), start);
  bindBtnTouch(document.getElementById('countmasters-overlay-restart'), function () {
    if (overlay) overlay.style.display = 'none';
    start();
  });
})();
