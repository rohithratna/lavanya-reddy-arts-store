const API = 'http://localhost:5000/api';

function esc(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

async function loadOrders() {
  const box = document.getElementById('orders');
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return; }

  try {
    const res = await fetch(`${API}/orders/my`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    const orders = await res.json();

    if (orders.length === 0) {
      box.innerHTML = '<p>No orders yet. <a href="index.html">Browse custom art</a></p>';
      return;
    }

    box.innerHTML = orders.map(o => `
      <div class="cart-item" style="flex-direction:column">
        <div style="display:flex;justify-content:space-between">
          <h3>Order #${o.id}</h3>
          <span class="status">${esc(o.status)}</span>
        </div>
        <p>Placed on: ${esc(o.created_at)} | Total: <strong>₹${o.total}</strong></p>
        <p>Deliver to: ${esc(o.address)}</p>
        ${o.items.map(it => `
          <p>• ${esc(it.name)} x ${it.quantity} (${esc(it.size)}, ${esc(it.frame)})
          ${it.custom_text ? ' - Text: ' + esc(it.custom_text) : ''}
          ${it.needed_by ? ' - Needed by: ' + esc(it.needed_by) : ''}</p>
        `).join('')}
      </div>
    `).join('');
  } catch (err) {
    box.innerHTML = '<p>Could not load orders. Is the server running?</p>';
  }
}

loadOrders();
