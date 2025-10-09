// checkout.js - hanya produk yang dipilih akan di-checkout
function formatRupiah(v) {
  return 'Rp ' + Number(v).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function getCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) { return []; }
}
function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
}

document.addEventListener('DOMContentLoaded', function () {
  const shippingOptions = [
    { id: 'jne', name: 'JNE Reguler', cost: 15000 },
    { id: 'pos', name: 'Pos Kilat', cost: 12000 },
    { id: 'instant', name: 'Instant (2 jam)', cost: 30000 }
  ];
  const paymentOptions = [
    { id: 'card', name: 'Credit/Debit Card' },
    { id: 'ovo', name: 'OVO' },
    { id: 'spay', name: 'ShopeePay' },
    { id: 'cod', name: 'Cash on Delivery' },
    { id: 'transfer', name: 'Bank Transfer' }
  ];

  // render shipping
  const shipEl = document.getElementById('shipping-options');
  shippingOptions.forEach(s => {
    const d = document.createElement('div');
    d.innerHTML = `<label><input type="radio" name="shipping" value="${s.id}" data-cost="${s.cost}"> ${s.name} - ${formatRupiah(s.cost)}</label>`;
    shipEl.appendChild(d);
  });

  // render payment
  const payEl = document.getElementById('payment-options');
  paymentOptions.forEach(p => {
    const d = document.createElement('div');
    d.innerHTML = `<label><input type="radio" name="payment" value="${p.id}"> ${p.name}</label>`;
    payEl.appendChild(d);
  });

  // render address
  function renderAddress() {
    const a = JSON.parse(localStorage.getItem('address') || 'null');
    if (a) {
      document.getElementById('addr-name').textContent = a.name;
      document.getElementById('addr-line').textContent = a.line;
      document.getElementById('addr-phone').textContent = a.phone;
    }
  }

  // modal address
  document.getElementById('edit-address').addEventListener('click', () => {
    const a = JSON.parse(localStorage.getItem('address') || 'null');
    if (a) {
      document.getElementById('addr-name-input').value = a.name;
      document.getElementById('addr-line-input').value = a.line;
      document.getElementById('addr-phone-input').value = a.phone;
    }
    document.getElementById('addr-modal').style.display = 'flex';
  });
  document.getElementById('addr-cancel').addEventListener('click', () => document.getElementById('addr-modal').style.display = 'none');
  document.getElementById('addr-save').addEventListener('click', () => {
    const addr = {
      name: document.getElementById('addr-name-input').value || '',
      line: document.getElementById('addr-line-input').value || '',
      phone: document.getElementById('addr-phone-input').value || ''
    };
    localStorage.setItem('address', JSON.stringify(addr));
    document.getElementById('addr-modal').style.display = 'none';
    renderAddress();
    alert('Alamat disimpan.');
  });

  // voucher
  document.getElementById('apply-voucher').addEventListener('click', () => {
    const code = document.getElementById('voucher-input').value.trim();
    if (!code) return alert('Masukkan kode voucher.');
    localStorage.setItem('selectedVoucher', code);
    document.getElementById('voucher-msg').textContent = 'Voucher diterapkan: ' + code;
    renderSummary();
  });

  // render produk + ringkasan
  function renderSummary() {
    const cart = getCart();
    const lines = document.getElementById('order-lines');
    lines.innerHTML = '';

    cart.forEach((it, i) => {
      const r = document.createElement('div');
      r.className = 'checkout-item';
      r.innerHTML = `
        <input type="checkbox" class="item-check" data-index="${i}" checked>
        <img src="${it.image || 'https://via.placeholder.com/70'}" alt="${it.title}">
        <div style="flex:1">
          <h3 style="font-size:0.95em">${it.title}</h3>
          <p>${formatRupiah(it.price || 0)} x ${it.qty || 1}</p>
        </div>
        <div>${formatRupiah((it.price || 0) * (it.qty || 1))}</div>
      `;
      lines.appendChild(r);
    });

    updateTotal();
  }

  // fungsi hitung total berdasarkan yang dicentang
  function updateTotal() {
    const cart = getCart();
    const checkedItems = Array.from(document.querySelectorAll('.item-check:checked')).map(cb => cart[cb.dataset.index]);

    let subtotal = 0;
    checkedItems.forEach(it => subtotal += (it.price || 0) * (it.qty || 1));
    document.getElementById('sum-subtotal').textContent = formatRupiah(subtotal);

    const selShip = document.querySelector('input[name="shipping"]:checked');
    const shipCost = selShip ? parseInt(selShip.dataset.cost || 0) : 0;
    document.getElementById('sum-shipping').textContent = formatRupiah(shipCost);

    let discount = 0;
    const v = localStorage.getItem('selectedVoucher') || '';
    if (v === 'MUSIM20') discount = Math.round(subtotal * 0.2);
    else if (v === 'HELLO10') discount = Math.round(subtotal * 0.1);
    else if (v === 'ONGKIRFREE') discount = shipCost;

    document.getElementById('sum-discount').textContent = formatRupiah(discount);
    document.getElementById('sum-total').textContent = formatRupiah(subtotal + shipCost - discount);
  }

  // update total kalau checkbox berubah
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-check') || e.target.name === 'shipping') updateTotal();
  });

  // tombol batal
  document.getElementById('cancel-order').addEventListener('click', () => {
    if (confirm('Batalkan pesanan?')) window.location.href = 'index.html';
  });

  // tombol buat pesanan (anti duplikat & double click)
  const placeBtn = document.getElementById('place-order');
  placeBtn.addEventListener('click', () => {
    if (placeBtn.disabled) return;
    placeBtn.disabled = true;
    placeBtn.style.opacity = '0.6';

    const cart = getCart();
    const checkedItems = Array.from(document.querySelectorAll('.item-check:checked')).map(cb => cart[cb.dataset.index]);
    if (!checkedItems.length) {
      alert('Pilih minimal satu produk untuk checkout.');
      placeBtn.disabled = false;
      placeBtn.style.opacity = '';
      return;
    }

    const addr = JSON.parse(localStorage.getItem('address') || 'null');
    if (!addr) {
      alert('Tambahkan alamat terlebih dahulu.');
      placeBtn.disabled = false;
      placeBtn.style.opacity = '';
      return;
    }
    const ship = document.querySelector('input[name="shipping"]:checked');
    if (!ship) {
      alert('Pilih pengiriman.');
      placeBtn.disabled = false;
      placeBtn.style.opacity = '';
      return;
    }
    const pay = document.querySelector('input[name="payment"]:checked');
    if (!pay) {
      alert('Pilih metode pembayaran.');
      placeBtn.disabled = false;
      placeBtn.style.opacity = '';
      return;
    }

    const subtotal = checkedItems.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    const shipCost = parseInt(ship.dataset.cost || 0);
    const v = localStorage.getItem('selectedVoucher') || '';
    let discount = 0;
    if (v === 'MUSIM20') discount = Math.round(subtotal * 0.2);
    else if (v === 'HELLO10') discount = Math.round(subtotal * 0.1);
    else if (v === 'ONGKIRFREE') discount = shipCost;

    const total = subtotal + shipCost - discount;

    const newOrder = {
      id: Date.now(),
      items: checkedItems,
      address: addr,
      voucher: v,
      shipping: ship.value,
      payment: pay.value,
      totalValue: total,
      total: formatRupiah(total),
      date: new Date().toISOString()
    };

    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('orders') || '[]'); } catch (e) { orders = []; }

    const sameItems = (a, b) => {
      if (a.length !== b.length) return false;
      const sa = a.map(i => i.id + '-' + i.qty).sort().join(',');
      const sb = b.map(i => i.id + '-' + i.qty).sort().join(',');
      return sa === sb;
    };

    const exists = orders.find(o =>
      sameItems(o.items, newOrder.items) &&
      o.totalValue === newOrder.totalValue &&
      o.address.line === newOrder.address.line
    );

    if (exists) {
      alert('Pesanan yang sama sudah pernah dibuat.');
      placeBtn.disabled = false;
      placeBtn.style.opacity = '';
      window.location.href = 'order-history.html';
      return;
    }

    orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    const newCart = cart.filter((_, i) => !document.querySelector(`.item-check[data-index="${i}"]`).checked);
    localStorage.setItem('cart', JSON.stringify(newCart));

    document.dispatchEvent(new Event('cart-updated'));
    alert('Pesanan berhasil dibuat. ID: ' + newOrder.id);
    window.location.href = 'order-history.html';
  });

  // render awal
  renderAddress();
  renderSummary();
});
