// cart.js - robust cart rendering and handlers
function formatRupiah(v){ return 'Rp ' + Number(v).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function getCart(){ try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); updateCartBadge(); document.dispatchEvent(new Event('cart-updated')); }

function addToCart(product, qty=1){
  const cart = getCart();
  const existing = cart.find(x=>x.id===product.id);
  if(existing){ existing.qty = (existing.qty||1) + qty; } else { cart.push(Object.assign({}, product, {qty: qty})); }
  saveCart(cart);
  try{ alert(product.title + ' ditambahkan ke keranjang.'); } catch(e){}
}

function updateCartBadge(){
  const badge = document.getElementById('cart-badge');
  if(!badge) return;
  const cart = getCart();
  const total = cart.reduce((s,it)=> s + (it.qty||0), 0);
  badge.textContent = total;
}

function renderCartPage(){
  const listEl = document.getElementById('cart-list');
  const summaryEl = document.getElementById('cart-summary');
  if(!listEl || !summaryEl) return;
  const cart = getCart();
  if(!cart.length){
    listEl.innerHTML = '<div class="text-muted">Keranjang Anda kosong.</div>';
    summaryEl.innerHTML = '<div style="margin-top:12px"><a href="products.html" class="btn">Lanjut Belanja</a></div>';
    return;
  }
  listEl.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'card';
    row.style.display = 'flex';
    row.style.gap = '12px';
    row.style.alignItems = 'center';
    row.style.marginBottom = '12px';
    row.innerHTML = `
      <img src="${item.img||'assets/img/placeholder.png'}" style="width:110px;height:90px;object-fit:cover;border-radius:8px">
      <div style="flex:1">
        <div style="font-weight:700">${item.title}</div>
        <div class="text-muted">${formatRupiah(item.price)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <button class="btn secondary small qty-decr" data-id="${item.id}">-</button>
          <input type="number" class="qty-input" data-id="${item.id}" value="${item.qty||1}" min="1" style="width:64px;padding:6px;border-radius:8px;border:1px solid #e5e7eb;text-align:center">
          <button class="btn secondary small qty-incr" data-id="${item.id}">+</button>
          <button class="btn ghost small remove-item" data-id="${item.id}" style="margin-left:12px">Hapus</button>
        </div>
      </div>
      <div style="text-align:right;min-width:120px">
        <div style="font-weight:800">${formatRupiah((item.price||0)*(item.qty||1))}</div>
      </div>
    `;
    listEl.appendChild(row);
    subtotal += (item.price||0)*(item.qty||1);
  });

  summaryEl.innerHTML = `
    <div class="flex justify-between"><div>Subtotal</div><div style="font-weight:800">${formatRupiah(subtotal)}</div></div>
    <div style="margin-top:12px;display:flex;gap:8px"><a href="checkout.html" class="btn">Checkout</a><button class="btn secondary" id="continue-shopping">Lanjut Belanja</button></div>
  `;
  // attach handlers after render
  document.querySelectorAll('.qty-decr').forEach(b=> b.addEventListener('click', function(){
    const id = parseInt(this.dataset.id); changeQty(id, -1);
  }));
  document.querySelectorAll('.qty-incr').forEach(b=> b.addEventListener('click', function(){
    const id = parseInt(this.dataset.id); changeQty(id, 1);
  }));
  document.querySelectorAll('.qty-input').forEach(inp=> inp.addEventListener('change', function(){
    const id = parseInt(this.dataset.id); const v = Math.max(1, parseInt(this.value||1)); setQty(id, v);
  }));
  document.querySelectorAll('.remove-item').forEach(b=> b.addEventListener('click', function(){
    const id = parseInt(this.dataset.id); removeItem(id);
  }));
  const cont = document.getElementById('continue-shopping'); if(cont) cont.addEventListener('click', ()=> window.location.href='products.html');
}

function changeQty(id, delta){
  const cart = getCart();
  const it = cart.find(x=>x.id===id); if(!it) return;
  it.qty = Math.max(1,(it.qty||1)+delta);
  saveCart(cart); renderCartPage();
}

function setQty(id, qty){
  const cart = getCart();
  const it = cart.find(x=>x.id===id); if(!it) return;
  it.qty = Math.max(1, qty);
  saveCart(cart); renderCartPage();
}

function removeItem(id){
  const cart = getCart().filter(x=>x.id!==id);
  saveCart(cart); renderCartPage();
  alert('Produk dihapus dari keranjang.');
}

document.addEventListener('DOMContentLoaded', function(){ renderCartPage(); updateCartBadge(); });
document.addEventListener('cart-updated', function(){ renderCartPage(); updateCartBadge(); });
