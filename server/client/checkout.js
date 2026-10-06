const API = 'http://localhost:5000/api';
const cart = JSON.parse(localStorage.getItem('cart') || '[]');

if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}
if (cart.length === 0) {
  window.location.href = 'cart.html';
}

function showMessage(text, isError) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.style.color = isError ? '#c0392b' : 'green';
}

let total = 0;
document.getElementById('summary').innerHTML = cart.map(item => {
  const line = item.price * item.quantity;
  total += line;
  const name = document.createElement('div');
  name.textContent = item.name;
  return `<p>${name.innerHTML} x ${item.quantity} - ₹${line.toFixed(2)}</p>`;
}).join('') + `<h3>Total: ₹${total.toFixed(2)}</h3>`;

async function placeOrder() {
  const address = document.getElementById('address').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if (!address || !phone) return showMessage('Please enter address and phone', true);

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ address, phone, items: cart })
    });
    const data = await res.json();

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    if (!res.ok) return showMessage(data.error, true);

    localStorage.removeItem('cart');
    window.location.href = 'order-success.html?id=' + data.orderId;
  } catch (err) {
    showMessage('Could not reach the server. Is it running?', true);
  }
}