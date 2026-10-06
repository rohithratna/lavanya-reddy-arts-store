const API = 'http://localhost:5000/api';
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const SIZES = {
  'Portraits': ['A4', 'A3'],
  'Devotional Art': ['5x7 inch', '8x10 inch'],
  'Magnets & Keychains': ['Small (standard)'],
  'Phone Cases': ['Standard'],
  'Wedding Art': ['Standard']
};

let product = null;

async function loadProduct() {
  const box = document.getElementById('product-detail');
  try {
    const res = await fetch(`${API}/products/${productId}`);
    if (!res.ok) { box.innerHTML = '<p>Product not found.</p>'; return; }
    product = await res.json();

    const sizes = SIZES[product.category] || ['Standard'];
    const sizeOptions = sizes.map(s => `<option value="${s}">${s}</option>`).join('');

    box.innerHTML = `
      <div class="detail">
        <img src="${product.image_url}" alt="${product.name}"
             onerror="this.src='https://placehold.co/400x300?text=Art'">
        <div>
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p class="price">From ₹${product.price}</p>

          <label>Size</label>
          <select id="size">${sizeOptions}</select>

          <label>Frame</label>
          <select id="frame">
            <option value="No frame">No frame</option>
            <option value="With frame">With frame</option>
          </select>

          <label>Name / text to include</label>
          <input type="text" id="custom_text" placeholder="e.g. Rohith, or your quote">

          <label>Reference photo link (optional)</label>
          <input type="text" id="reference_image" placeholder="Google Drive / Instagram link of your photo">

          <label>Needed by</label>
          <input type="date" id="needed_by">

          <label>Notes for the artist</label>
          <textarea id="notes" rows="3" placeholder="Colours, style, phone model, anything else"></textarea>

          <label>Quantity</label>
          <input type="number" id="quantity" value="1" min="1">

          <button class="btn" onclick="addToCart()">Add to Cart</button>
        </div>
      </div>
    `;
  } catch (err) {
    box.innerHTML = '<p>Could not load product. Is the server running?</p>';
  }
}

function addToCart() {
  const item = {
    product_id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity: Number(document.getElementById('quantity').value) || 1,
    size: document.getElementById('size').value,
    frame: document.getElementById('frame').value,
    custom_text: document.getElementById('custom_text').value,
    reference_image: document.getElementById('reference_image').value,
    needed_by: document.getElementById('needed_by').value,
    notes: document.getElementById('notes').value
  };

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
  window.location.href = 'cart.html';
}

loadProduct();