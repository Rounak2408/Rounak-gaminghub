(function () {
  const choices = ['rock', 'paper', 'scissors'];
  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  let wins = 0;
  let round = 0;
  let gameActive = false;

  const messageEl = document.getElementById('rps-message');
  const choicesEl = document.getElementById('rps-choices');
  const scoreEl = document.getElementById('rps-score');
  const overlay = document.getElementById('rps-overlay');
  const resultEl = document.getElementById('rps-result');

  function play(user) {
    if (!gameActive) return;
    const comp = choices[Math.floor(Math.random() * 3)];
    const win = beats[user] === comp;
    const lose = beats[comp] === user;
    if (win) wins++;
    round++;
    messageEl.textContent = `You: ${user} | Computer: ${comp}. ${win ? 'You win!' : lose ? 'You lose!' : 'Draw!'}`;
    scoreEl.textContent = wins;
    if (wins >= 3 || round >= 5) {
      gameActive = false;
      choicesEl.style.display = 'none';
      window.rpsScore = wins;
      resultEl.textContent = wins >= 3 ? `You won ${wins}-${round - wins}!` : `Game over. Wins: ${wins}`;
      overlay.style.display = 'flex';
      if (typeof showSubmitScore === 'function') showSubmitScore('Rock Paper Scissors', wins, overlay);
    }
  }

  function start() {
    wins = 0;
    round = 0;
    gameActive = true;
    messageEl.textContent = 'Choose Rock, Paper, or Scissors. First to 3 wins!';
    choicesEl.style.display = 'flex';
    scoreEl.textContent = '0';
    overlay.style.display = 'none';
  }

  function restart() {
    window.rpsScore = 0;
    start();
  }

  choicesEl.querySelectorAll('.rps-btn').forEach(btn => {
    btn.addEventListener('click', () => play(btn.dataset.choice));
  });

  document.getElementById('rps-start').addEventListener('click', start);
  document.getElementById('rps-restart').addEventListener('click', restart);
  document.getElementById('rps-overlay-restart').addEventListener('click', () => { overlay.style.display = 'none'; start(); });
})();
