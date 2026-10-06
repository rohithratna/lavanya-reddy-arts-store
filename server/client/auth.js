const API = 'http://localhost:5000/api';

function showMessage(text, isError) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.style.color = isError ? '#c0392b' : 'green';
}

async function registerUser() {
  const body = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    password: document.getElementById('password').value
  };

  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showMessage(data.error, true);

    showMessage('Registered! Redirecting to login...', false);
    setTimeout(() => window.location.href = 'login.html', 1200);
  } catch (err) {
    showMessage('Could not reach the server. Is it running?', true);
  }
}

async function loginUser() {
  const body = {
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value
  };

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showMessage(data.error, true);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showMessage('Login successful!', false);
    setTimeout(() => window.location.href = 'index.html', 800);
  } catch (err) {
    showMessage('Could not reach the server. Is it running?', true);
  }
}