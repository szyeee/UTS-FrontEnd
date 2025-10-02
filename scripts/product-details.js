// product-details.js - ensure share and favorite work, buy-now -> checkout
function getQueryParam(name){ const url = new URL(window.location.href); return url.searchParams.get(name); }
function formatRupiah(v){ return 'Rp ' + Number(v).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
document.addEventListener('DOMContentLoaded', function(){
  const id = parseInt(getQueryParam('id')||'0');
  const product = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(p=>p.id===id) : null;
  if (!product) { console.warn('Product not found'); return; }
  document.getElementById('product-title').textContent = product.title;
  document.getElementById('product-price').textContent = formatRupiah(product.price);
  document.getElementById('product-desc').textContent = product.desc || '';
  const mainImage = document.getElementById('main-image'); mainImage.src = product.img; mainImage.alt = product.title;
  // thumbs
  const thumbs = document.getElementById('thumbnails'); thumbs.innerHTML='';
  for(let i=0;i<3;i++){ const t=document.createElement('img'); t.src=product.img; t.style.width='72px'; t.style.height='72px'; t.style.objectFit='cover'; t.style.borderRadius='8px'; t.style.cursor='pointer'; t.onclick=()=>mainImage.src=t.src; thumbs.appendChild(t); }
  // favourite
  const favBtn = document.getElementById('save-wishlist');
  function updateFavUI(){ const fav = JSON.parse(localStorage.getItem('favorites')||'[]'); favBtn.textContent = fav.indexOf(product.id)!==-1 ? '♥ Saved' : '♡ Save'; }
  updateFavUI();
  favBtn.addEventListener('click', function(){ let fav = JSON.parse(localStorage.getItem('favorites')||'[]'); if (fav.indexOf(product.id)===-1) { fav.push(product.id); } else { fav = fav.filter(x=>x!==product.id); } localStorage.setItem('favorites', JSON.stringify(fav)); document.dispatchEvent(new Event('favorites-updated')); updateFavUI(); });
  // share
  document.getElementById('share-btn').addEventListener('click', function(){ const url = window.location.origin + '/product-details.html?id=' + product.id; if (navigator.share) navigator.share({title:product.title,text:product.desc,url:url}).catch(()=>{}); else if (navigator.clipboard) navigator.clipboard.writeText(url).then(()=> alert('Link produk disalin: ' + url)); else prompt('Salin link produk:', url); });
  // Add to cart & Buy Now
  const qtyInput = document.getElementById('qty-input');
  document.getElementById('add-to-cart').addEventListener('click', function(){ const qty=Math.max(1,parseInt(qtyInput.value||'1')); addToCart({id:product.id,title:product.title,price:product.price,img:product.img}, qty); });
  document.getElementById('buy-now').addEventListener('click', function(){ const qty=Math.max(1,parseInt(qtyInput.value||'1')); addToCart({id:product.id,title:product.title,price:product.price,img:product.img}, qty); window.location.href='checkout.html'; });
});