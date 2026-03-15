function getGameScore(gameName) {
  const map = {
    'Tic Tac Toe': () => window.tttScore != null ? window.tttScore : 0,
    'Snake': () => window.snakeScore != null ? window.snakeScore : 0,
    'Rock Paper Scissors': () => window.rpsScore != null ? window.rpsScore : 0,
    'Car Racing': () => window.racingScore != null ? window.racingScore : 0,
    'Shooting Game': () => window.shootingScore != null ? window.shootingScore : 0,
    'Character Adventure': () => window.adventureScore != null ? window.adventureScore : 0,
    'Tetris': () => window.tetrisScore != null ? window.tetrisScore : 0,
    'Count Masters': () => window.countmastersScore != null ? window.countmastersScore : 0
  };
  const getter = map[gameName];
  return getter ? getter() : 0;
}

function showSubmitScore(gameName, score, overlayElement) {
  if (typeof apiSubmitScore !== 'function' || !isLoggedIn()) return;
  const content = overlayElement && overlayElement.querySelector('.game-overlay-content');
  if (!content || content.querySelector('.submit-score-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-green submit-score-btn';
  btn.style.marginTop = '1rem';
  btn.textContent = 'Submit score to leaderboard';
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    try {
      await apiSubmitScore(gameName, score);
      btn.textContent = 'Submitted!';
    } catch (e) {
      btn.textContent = 'Error - try again';
      btn.disabled = false;
    }
  });
  if (content) content.appendChild(btn);
}
