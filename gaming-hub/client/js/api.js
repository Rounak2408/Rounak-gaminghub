const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

async function apiRegister(username, email, password) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

async function apiSubmitScore(gameName, score) {
  const res = await fetch(`${API_BASE}/api/score`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ gameName, score })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to save score');
  return data;
}

async function apiLeaderboard(game) {
  const url = game ? `${API_BASE}/api/leaderboard?game=${encodeURIComponent(game)}` : `${API_BASE}/api/leaderboard`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to load leaderboard');
  return data;
}
