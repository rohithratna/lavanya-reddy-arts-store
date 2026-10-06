const API = 'http://localhost:5000/api';

async function loadProducts(category) {
  const url = category
    ? `${API}/products?category=${encodeURIComponent(category)}`
    : `${API}/products`;

  const container = document.getElementById('products');
  container.innerHTML = 'Loading...';

  try {
    const res = await fetch(url);
    const products = await res.json();

    if (products.length === 0) {
      container.innerHTML = '<p>No products found.</p>';
      return;
    }

    container.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.image_url}" alt="${p.name}"
             onerror="this.src='https://placehold.co/300x200?text=Art'">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p class="price">From ₹${p.price}</p>
        <a class="btn" href="product.html?id=${p.id}">Customize &amp; Order</a>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p>Could not load products. Is the server running?</p>';
  }
}

loadProducts();