// scripts/shipping.js
document.addEventListener('DOMContentLoaded', function(){
  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  const orderId = getParam('id') || localStorage.getItem('lastViewedOrder');
  const container = document.getElementById('shipping-content');

  if (!orderId) {
    container.innerHTML = '<p>Tidak ada order yang dipilih untuk tracking.</p>';
    return;
  }

  // Ambil data order dari orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => String(o.id) === String(orderId));

  if (!order) {
    container.innerHTML = '<p>Data order tidak ditemukan untuk ID ini.</p>';
    return;
  }

  // Siapkan tracking object
  const tracking = {
    courier: order.shipping || 'Kurir tidak diketahui',
    events: order.trackingHistory || [
      { status: order.status || 'Diproses', location: '', time: new Date().toISOString() }
    ]
  };

  // Render header
  const headerHtml = `
    <div class="ship-header">
      <div>
        <h3>Pesanan #${orderId}</h3>
        <div class="ship-meta">Kurir: <strong>${tracking.courier}</strong></div>
      </div>
      <div class="tracking-badge">Status: ${tracking.events[tracking.events.length-1].status}</div>
    </div>
  `;

  // Timeline (urut dari terbaru ke terlama)
  let timelineHtml = '<div class="timeline">';
  const events = (tracking.events || []).slice().sort((a,b)=> new Date(b.time) - new Date(a.time));
  events.forEach(ev => {
    timelineHtml += `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="time">${new Date(ev.time).toLocaleString()}</div>
          <div class="status">${ev.status}</div>
          <div class="loc" style="color:var(--muted)">${ev.location || '-'}</div>
        </div>
      </div>
    `;
  });
  timelineHtml += '</div>';

  // Actions
  const actionHtml = `
    <div class="ship-actions" style="margin-top:12px; display:flex; gap:10px;">
      <button id="refresh-track" class="btn secondary">Refresh</button>
      <button id="back-orders" class="btn">Kembali ke Pesanan</button>
    </div>
  `;

  container.innerHTML = headerHtml + timelineHtml + actionHtml;

  // Tombol kembali ke order-history
  document.getElementById('back-orders').addEventListener('click', function(){
    window.location.href = 'order-history.html';
  });

  // Tombol refresh untuk simulasi update tracking
  document.getElementById('refresh-track').addEventListener('click', function(){
    // Simulate new tracking event
    const newEv = {
      status: ['Diproses','Dikirim','Dalam Pengantaran','Lunas'][Math.floor(Math.random()*4)],
      location: ['Jakarta','Depok','Bogor','Tangerang'][Math.floor(Math.random()*4)],
      time: new Date().toISOString()
    };

    // Tambahkan ke order.trackingHistory
    if (!order.trackingHistory) order.trackingHistory = [];
    order.trackingHistory.unshift(newEv);

    // Update orders di localStorage
    const idx = orders.findIndex(o => String(o.id) === String(orderId));
    if (idx !== -1) orders[idx] = order;
    localStorage.setItem('orders', JSON.stringify(orders));

    location.reload();
  });
});
