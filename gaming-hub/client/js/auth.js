function getStoredUser() {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

function isLoggedIn() {
  return !!getToken() && !!getStoredUser();
}

function logout() {
  setToken(null);
  setStoredUser(null);
  window.location.href = '/index.html';
}

function updateNavUser() {
  const user = getStoredUser();
  const loginLink = document.getElementById('nav-login');
  const registerLink = document.getElementById('nav-register');
  const userBadge = document.getElementById('nav-user');
  const logoutBtn = document.getElementById('nav-logout');
  if (user && (userBadge || logoutBtn)) {
    if (userBadge) userBadge.textContent = user.username;
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if (userBadge) userBadge.textContent = '';
    if (loginLink) loginLink.style.display = '';
    if (registerLink) registerLink.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', updateNavUser);
