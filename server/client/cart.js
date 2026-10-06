function esc(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function renderCart() {
  const cart = getCart();
  const box = document.getElementById('cart');

  if (cart.length === 0) {
    box.innerHTML = '<p>Your cart is empty. <a href="index.html">Browse custom art</a></p>';
    return;
  }

  let total = 0;
  const rows = cart.map((item, i) => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    return `
      <div class="cart-item">
        <div>
          <h3>${esc(item.name)}</h3>
          <p>Size: ${esc(item.size)} | Frame: ${esc(item.frame)}</p>
          ${item.custom_text ? `<p>Text: ${esc(item.custom_text)}</p>` : ''}
          ${item.needed_by ? `<p>Needed by: ${esc(item.needed_by)}</p>` : ''}
          ${item.notes ? `<p>Notes: ${esc(item.notes)}</p>` : ''}
        </div>
        <div class="cart-right">
          <p>Qty: ${item.quantity}</p>
          <p class="price">₹${lineTotal.toFixed(2)}</p>
          <button class="remove" onclick="removeItem(${i})">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  box.innerHTML = rows + `
    <div class="cart-total">
      <h3>Total: ₹${total.toFixed(2)}</h3>
      <button class="btn checkout-btn" onclick="goCheckout()">Proceed to Checkout</button>
    </div>
  `;
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function goCheckout() {
  if (!localStorage.getItem('token')) {
    alert('Please login to place your order.');
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'checkout.html';
}

renderCart();