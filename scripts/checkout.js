// checkout.js - refined and clear flow per requirements
function formatRupiah(v){ return 'Rp ' + Number(v).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function getCart(){ try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch(e){ return []; } }
function saveOrder(order){ const orders = JSON.parse(localStorage.getItem('orders')||'[]'); orders.unshift(order); localStorage.setItem('orders', JSON.stringify(orders)); }

document.addEventListener('DOMContentLoaded', function(){
  const shippingOptions = [{id:'jne',name:'JNE Reguler',cost:15000},{id:'pos',name:'Pos Kilat',cost:12000},{id:'instant',name:'Instant (2 jam)',cost:30000}];
  const paymentOptions = [{id:'card',name:'Credit/Debit Card'},{id:'ovo',name:'OVO'},{id:'spay',name:'ShopeePay'},{id:'cod',name:'Cash on Delivery'},{id:'transfer',name:'Bank Transfer'}];
  const shipEl = document.getElementById('shipping-options');
  shippingOptions.forEach(s=>{ const d=document.createElement('div'); d.innerHTML=`<label><input type="radio" name="shipping" value="${s.id}" data-cost="${s.cost}"> ${s.name} - ${formatRupiah(s.cost)}</label>`; shipEl.appendChild(d); });
  const payEl = document.getElementById('payment-options');
  paymentOptions.forEach(p=>{ const d=document.createElement('div'); d.innerHTML=`<label><input type="radio" name="payment" value="${p.id}"> ${p.name}</label>`; payEl.appendChild(d); });

  // address modal
  function loadAddress(){ const a = JSON.parse(localStorage.getItem('address')||'null'); if(a) document.getElementById('addr-name').value=a.name, document.getElementById('addr-line').value=a.line, document.getElementById('addr-phone').value=a.phone; }
  document.getElementById('edit-address').addEventListener('click', ()=>{ document.getElementById('addr-modal').style.display='flex'; loadAddress(); });
  document.getElementById('addr-cancel').addEventListener('click', ()=> document.getElementById('addr-modal').style.display='none');
  document.getElementById('addr-save').addEventListener('click', ()=>{ const addr={name:document.getElementById('addr-name').value,line:document.getElementById('addr-line').value,phone:document.getElementById('addr-phone').value}; localStorage.setItem('address', JSON.stringify(addr)); document.getElementById('addr-modal').style.display='none'; alert('Alamat disimpan.'); });

  // voucher apply
  document.getElementById('apply-voucher').addEventListener('click', ()=>{
    const code = document.getElementById('voucher-input').value.trim();
    if(!code) return alert('Masukkan kode voucher.');
    localStorage.setItem('selectedVoucher', code);
    alert('Voucher diterapkan: ' + code);
    renderSummary();
  });

  function renderSummary(){
    const cart = getCart();
    const lines = document.getElementById('order-lines'); lines.innerHTML='';
    let subtotal = 0;
    cart.forEach(it=>{ const r=document.createElement('div'); r.style.display='flex'; r.style.justifyContent='space-between'; r.style.marginBottom='8px'; r.innerHTML = `<div>${it.title} x ${it.qty||1}</div><div>${formatRupiah((it.price||0)*(it.qty||1))}</div>`; lines.appendChild(r); subtotal += (it.price||0)*(it.qty||1); });
    document.getElementById('sum-subtotal').textContent = formatRupiah(subtotal);
    const selShip = document.querySelector('input[name="shipping"]:checked'); const shipCost = selShip ? parseInt(selShip.dataset.cost||0) : 0; document.getElementById('sum-shipping').textContent = formatRupiah(shipCost);
    let discount = 0; const v = localStorage.getItem('selectedVoucher') || ''; if (v==='MUSIM20') discount = Math.round(subtotal*0.2); else if (v==='HELLO10') discount = Math.round(subtotal*0.1); else if (v==='ONGKIRFREE') discount = shipCost;
    document.getElementById('sum-discount').textContent = formatRupiah(discount);
    document.getElementById('sum-total').textContent = formatRupiah(subtotal + shipCost - discount);
  }

  document.getElementById('shipping-options').addEventListener('change', renderSummary);
  document.getElementById('payment-options').addEventListener('change', renderSummary);
  document.getElementById('cancel-order').addEventListener('click', ()=>{ if(confirm('Batalkan pesanan?')) window.location.href='index.html'; });

  document.getElementById('place-order').addEventListener('click', ()=>{
    const cart = getCart(); if(!cart.length) return alert('Keranjang kosong.');
    const addr = JSON.parse(localStorage.getItem('address')||'null'); if(!addr) return alert('Tambahkan alamat terlebih dahulu.');
    const ship = document.querySelector('input[name="shipping"]:checked'); if(!ship) return alert('Pilih pengiriman.');
    const pay = document.querySelector('input[name="payment"]:checked'); if(!pay) return alert('Pilih metode pembayaran.');
    const order = {id:Date.now(), items:cart, address:addr, voucher:localStorage.getItem('selectedVoucher')||'', shipping:ship.value, payment:pay.value, total:document.getElementById('sum-total').textContent, date:new Date().toISOString()};
    saveOrder(order);
    localStorage.removeItem('cart');
    document.dispatchEvent(new Event('cart-updated'));
    alert('Pesanan dibuat. ID: ' + order.id);
    window.location.href = 'order-history.html';
  });

  // initial render
  renderSummary();
});