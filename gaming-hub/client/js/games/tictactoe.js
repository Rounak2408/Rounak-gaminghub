(function () {
  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X';
  let wins = 0;
  let gameActive = false;
  let onlineMode = false;
  let mySymbol = null;
  let socket = null;
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function showHubToast(message) {
    var el = document.getElementById('hub-toast');
    var msgEl = document.getElementById('hub-toast-message');
    if (!el || !msgEl) return;
    msgEl.textContent = message;
    el.style.display = 'flex';
    el.setAttribute('aria-hidden', 'false');
  }

  const boardEl = document.getElementById('ttt-board');
  const scoreEl = document.getElementById('ttt-score');
  const overlay = document.getElementById('ttt-overlay');
  const finalScoreEl = document.getElementById('ttt-final-score');
  const turnMsgEl = document.getElementById('ttt-turn-msg');

  function checkWin() {
    for (const [a, b, c] of winLines) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
    }
    if (board.every(c => c)) return 'T';
    return null;
  }

  function isMyTurn() {
    return !onlineMode || (mySymbol && currentPlayer === mySymbol);
  }

  function render() {
    if (!boardEl) return;
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'ttt-cell' + (board[i] ? ' taken' : '');
      cell.textContent = board[i];
      cell.dataset.index = i;
      cell.addEventListener('click', () => {
        if (!gameActive || board[i]) return;
        if (onlineMode && !isMyTurn()) return;
        board[i] = currentPlayer;
        if (onlineMode && socket) socket.emit('ttt:move', { index: i, symbol: currentPlayer });
        render();
        const result = checkWin();
        if (result === 'X' || result === 'O') {
          if (result === 'X') wins++;
          window.tttScore = wins;
          gameActive = false;
          if (finalScoreEl) finalScoreEl.textContent = wins;
          overlay.style.display = 'flex';
          if (typeof showSubmitScore === 'function') showSubmitScore('Tic Tac Toe', wins, overlay);
        } else if (result === 'T') {
          gameActive = false;
          if (finalScoreEl) finalScoreEl.textContent = wins;
          overlay.style.display = 'flex';
        } else {
          currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
          if (turnMsgEl) turnMsgEl.textContent = onlineMode ? (isMyTurn() ? 'Your turn' : "Opponent's turn") : '';
        }
      });
      boardEl.appendChild(cell);
    }
    if (scoreEl) scoreEl.textContent = wins;
    if (turnMsgEl && gameActive && onlineMode) turnMsgEl.textContent = isMyTurn() ? 'Your turn' : "Opponent's turn";
    if (turnMsgEl && !onlineMode) turnMsgEl.textContent = '';
  }

  function start() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    if (overlay) overlay.style.display = 'none';
    if (turnMsgEl) turnMsgEl.textContent = onlineMode ? (mySymbol === 'X' ? 'Your turn' : "Opponent's turn") : '';
    render();
  }

  function restart() {
    wins = 0;
    window.tttScore = 0;
    start();
  }

  function connectSocket() {
    if (typeof io === 'undefined') return null;
    if (!socket) socket = io(window.location.origin, { path: '/socket.io/', transports: ['websocket', 'polling'] });
    return socket;
  }

  function setupOnline() {
    const modeBar = document.getElementById('ttt-mode-bar');
    const onlinePanel = document.getElementById('ttt-online-panel');
    const createView = document.getElementById('ttt-create-view');
    const joinView = document.getElementById('ttt-join-view');
    const roomCodeEl = document.getElementById('ttt-room-code');
    const codeInput = document.getElementById('ttt-code-input');
    const joinErr = document.getElementById('ttt-join-err');
    const createCodeInput = document.getElementById('ttt-create-code-input');
    const doCreateBtn = document.getElementById('ttt-do-create');
    const createErr = document.getElementById('ttt-create-err');
    const roomCreatedDiv = document.getElementById('ttt-room-created');

    if (!modeBar || !onlinePanel) return;

    document.getElementById('ttt-btn-solo').addEventListener('click', () => {
      onlineMode = false;
      mySymbol = null;
      if (createView) createView.style.display = 'none';
      if (joinView) joinView.style.display = 'none';
      if (joinErr) joinErr.style.display = 'none';
      start();
    });

    document.getElementById('ttt-btn-online').addEventListener('click', () => {
      if (createView) createView.style.display = 'none';
      if (joinView) joinView.style.display = 'none';
      if (joinErr) { joinErr.style.display = 'none'; joinErr.textContent = ''; }
    });

    document.getElementById('ttt-create-room').addEventListener('click', () => {
      createView.style.display = 'block';
      joinView.style.display = 'none';
      joinErr.style.display = 'none';
      if (createErr) createErr.style.display = 'none';
      if (roomCreatedDiv) roomCreatedDiv.style.display = 'none';
      if (createCodeInput) createCodeInput.value = '';
    });

    if (doCreateBtn) doCreateBtn.addEventListener('click', () => {
      const roomId = (createCodeInput && createCodeInput.value) ? createCodeInput.value.trim().replace(/\s+/g, ' ') : '';
      if (roomId.length < 2) {
        if (createErr) { createErr.textContent = 'At least 2 characters daalo (naam ya number)'; createErr.style.display = 'block'; createErr.style.color = '#ff6666'; }
        return;
      }
      if (createErr) { createErr.textContent = 'Creating room...'; createErr.style.display = 'block'; createErr.style.color = 'var(--neon-cyan)'; }
      if (roomCreatedDiv) roomCreatedDiv.style.display = 'none';
      const s = connectSocket();
      if (!s) {
        if (createErr) { createErr.textContent = 'Socket not loaded. Refresh the page.'; createErr.style.color = '#ff6666'; }
        showHubToast('Connection not available. Refresh the page.');
        return;
      }
      function doEmit() {
        s.emit('ttt:create-room', { roomCode: roomId });
      }
      if (s.connected) {
        doEmit();
      } else {
        s.once('connect', doEmit);
        s.once('connect_error', () => {
          if (createErr) { createErr.textContent = 'Server not running. Run: npm start (in gaming-hub folder)'; createErr.style.color = '#ff6666'; }
          showHubToast('Server not running. Start the server (npm start in gaming-hub folder) and try again.');
        });
      }
    });

    document.getElementById('ttt-join-room').addEventListener('click', () => {
      joinView.style.display = 'block';
      createView.style.display = 'none';
      joinErr.style.display = 'none';
      if (codeInput) codeInput.value = '';
    });

    document.getElementById('ttt-do-join').addEventListener('click', () => {
      const code = (codeInput && codeInput.value) ? codeInput.value.trim().replace(/\s+/g, ' ') : '';
      if (!code) { if (joinErr) { joinErr.textContent = 'Friend ka Room ID daalo'; joinErr.style.display = 'block'; } return; }
      const s = connectSocket();
      if (s) s.emit('ttt:join-room', { code: code });
    });

    document.getElementById('ttt-copy-code').addEventListener('click', () => {
      if (roomCodeEl && roomCodeEl.textContent && navigator.clipboard) {
        navigator.clipboard.writeText(roomCodeEl.textContent).then(() => showHubToast('Room ID copied! Share with your friend.'));
      }
    });

    if (socket) return;
    connectSocket();
    if (!socket) return;
    socket.on('ttt:room-created', (data) => {
      if (roomCodeEl) roomCodeEl.textContent = data.code || '';
      if (roomCreatedDiv) roomCreatedDiv.style.display = 'block';
      if (createErr) { createErr.style.display = 'none'; createErr.textContent = ''; }
    });
    socket.on('ttt:create-error', (data) => {
      if (createErr) { createErr.textContent = data.message || 'Could not create room'; createErr.style.display = 'block'; createErr.style.color = '#ff6666'; }
    });
    socket.on('ttt:room-joined', () => {
      if (joinErr) joinErr.style.display = 'none';
      showHubToast('Successfully joined the room! Waiting for game to start...');
    });
    socket.on('ttt:room-ready', (data) => {
      onlineMode = true;
      mySymbol = data.symbol || (data.playerIndex === 0 ? 'X' : 'O');
      document.getElementById('ttt-create-view').style.display = 'none';
      document.getElementById('ttt-join-view').style.display = 'none';
      start();
      showHubToast('Game starting! You are ' + mySymbol + '.');
    });
    socket.on('ttt:join-error', (data) => {
      if (joinErr) { joinErr.textContent = data.message || 'Could not join'; joinErr.style.display = 'block'; }
    });
    socket.on('ttt:opponent-move', (data) => {
      var idx = data && (typeof data.index === 'number' ? data.index : parseInt(data.index, 10));
      var sym = data && (data.symbol === 'X' || data.symbol === 'O' ? data.symbol : null);
      if (idx < 0 || idx > 8 || !sym) return;
      if (board[idx]) return;
      board[idx] = sym;
      if (!gameActive) gameActive = true;
      currentPlayer = sym === 'X' ? 'O' : 'X';
      render();
      var result = checkWin();
      if (result === 'X' || result === 'O') {
        if (result === 'X') wins++;
        window.tttScore = wins;
        gameActive = false;
        if (finalScoreEl) finalScoreEl.textContent = wins;
        if (overlay) overlay.style.display = 'flex';
        if (typeof showSubmitScore === 'function') showSubmitScore('Tic Tac Toe', wins, overlay);
      } else if (result === 'T') {
        gameActive = false;
        if (finalScoreEl) finalScoreEl.textContent = wins;
        if (overlay) overlay.style.display = 'flex';
      } else {
        if (turnMsgEl) turnMsgEl.textContent = isMyTurn() ? 'Your turn' : "Opponent's turn";
      }
    });
    socket.on('ttt:player-left', () => {
      if (turnMsgEl) turnMsgEl.textContent = 'Opponent left';
      gameActive = false;
    });
  }

  document.getElementById('ttt-start').addEventListener('click', start);
  document.getElementById('ttt-restart').addEventListener('click', restart);
  document.getElementById('ttt-overlay-restart').addEventListener('click', () => { overlay.style.display = 'none'; start(); });

  var hubToastOk = document.getElementById('hub-toast-ok');
  if (hubToastOk) hubToastOk.addEventListener('click', function () {
    var el = document.getElementById('hub-toast');
    if (el) { el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); }
  });

  setupOnline();
  render();
})();
