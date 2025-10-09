// product-details.js
// Menangani detail produk + ulasan

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function formatRupiah(v) {
  return 'Rp ' + Number(v).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Ambil nama reviewer dari profil localStorage
function getReviewerName() {
  // cek username langsung
  const uname = localStorage.getItem('username');
  if (uname && uname.trim()) return uname.trim();

  // cek object user
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u && (u.name || u.fullname || u.username)) {
      return (u.name || u.fullname || u.username).toString();
    }
  } catch (e) {}

  // fallback
  return 'Pengguna';
}

document.addEventListener('DOMContentLoaded', function() {
  const id = parseInt(getQueryParam('id') || '0');
  const product = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(p => p.id === id) : null;
  if (!product) { console.warn('Product not found'); return; }

  // isi detail produk
  document.getElementById('product-title').textContent = product.title;
  document.getElementById('product-price').textContent = formatRupiah(product.price);
  document.getElementById('product-desc').textContent = product.desc || '';

  const mainImage = document.getElementById('main-image');
  mainImage.src = product.img;
  mainImage.alt = product.title;

  // thumbnails
  const thumbs = document.getElementById('thumbnails');
  thumbs.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const t = document.createElement('img');
    t.src = product.img;
    t.style.width = '72px';
    t.style.height = '72px';
    t.style.objectFit = 'cover';
    t.style.borderRadius = '8px';
    t.style.cursor = 'pointer';
    t.onclick = () => mainImage.src = t.src;
    thumbs.appendChild(t);
  }

  // favorit
  const favBtn = document.getElementById('save-wishlist');
  function updateFavUI() {
    const fav = JSON.parse(localStorage.getItem('favorites') || '[]');
    favBtn.textContent = fav.indexOf(product.id) !== -1 ? '♥ Saved' : '♡ Save';
  }
  updateFavUI();
  favBtn.addEventListener('click', function() {
    let fav = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (fav.indexOf(product.id) === -1) { fav.push(product.id); }
    else { fav = fav.filter(x => x !== product.id); }
    localStorage.setItem('favorites', JSON.stringify(fav));
    document.dispatchEvent(new Event('favorites-updated'));
    updateFavUI();
  });

  // share
  document.getElementById('share-btn').addEventListener('click', function() {
    const url = window.location.origin + '/product-details.html?id=' + product.id;
    if (navigator.share) {
      navigator.share({ title: product.title, text: product.desc, url: url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert('Link produk disalin: ' + url));
    } else prompt('Salin link produk:', url);
  });

  // cart & buy
  const qtyInput = document.getElementById('qty-input');
  document.getElementById('add-to-cart').addEventListener('click', function() {
    const qty = Math.max(1, parseInt(qtyInput.value || '1'));
    addToCart({ id: product.id, title: product.title, price: product.price, img: product.img }, qty);
  });
  document.getElementById('buy-now').addEventListener('click', function() {
    const qty = Math.max(1, parseInt(qtyInput.value || '1'));
    addToCart({ id: product.id, title: product.title, price: product.price, img: product.img }, qty);
    window.location.href = 'checkout.html';
  });

  // === Ulasan ===
  const reviewsKey = 'reviews-' + product.id;
  let reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
  const reviewsList = document.getElementById('reviews-list');
  const reviewBtn = document.getElementById('submit-review');
  const reviewText = document.getElementById('review-text');

  function renderReviews() {
    if (!reviews || reviews.length === 0) {
      reviewsList.innerHTML = 'Belum ada ulasan.';
      return;
    }
    reviewsList.innerHTML = '';
    reviews.forEach(r => {
      const div = document.createElement('div');
      div.style.marginBottom = '12px';
      div.innerHTML = `<strong>${r.name}</strong> <small style="color:gray">(${r.date})</small><br>${r.text}`;
      reviewsList.appendChild(div);
    });
  }
  renderReviews();

  reviewBtn.addEventListener('click', function() {
    const txt = reviewText.value.trim();
    if (!txt) { alert('Ulasan tidak boleh kosong!'); return; }
    const newReview = {
      name: getReviewerName(),
      text: txt,
      date: (new Date()).toLocaleString()
    };
    reviews.push(newReview);
    localStorage.setItem(reviewsKey, JSON.stringify(reviews));
    reviewText.value = '';
    renderReviews();
  });
});
