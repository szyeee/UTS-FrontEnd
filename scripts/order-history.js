// scripts/order-history.js

document.addEventListener('DOMContentLoaded', function () {
  const listEl = document.getElementById('order-list');
  if (!listEl) return console.warn('order-list element not found');

  const currentUser = (localStorage.getItem('username') || '').trim() || null;

  // Load raw orders safely
  let raw = [];
  try {
    raw = JSON.parse(localStorage.getItem('orders') || '[]');
    if (!Array.isArray(raw)) raw = [];
  } catch (err) {
    console.error('Failed to parse orders from localStorage', err);
    raw = [];
  }

  console.groupCollapsed('[order-history] raw orders loaded:', raw.length);
  console.log(raw);
  console.groupEnd();

  // Step A: filter invalid entries (no id or no items)
  const invalidEntries = [];
  const maybeValid = [];
  raw.forEach(o => {
    if (!o || (!o.id && o.id !== 0)) {
      invalidEntries.push(o);
      return;
    }
    if (!Array.isArray(o.items) || o.items.length === 0) {
      invalidEntries.push(o);
      return;
    }
    // optionally filter by owner
    if (currentUser && (o.username || o.user)) {
      const owner = (o.username || o.user || '').toString().trim();
      if (owner && owner !== currentUser) {
        // order belongs to other user -> treat as invalid for this current session
        invalidEntries.push(o);
        return;
      }
    }
    maybeValid.push(o);
  });

  console.log(`[order-history] removed invalid entries: ${invalidEntries.length}`);

  // Step B: remove exact duplicate objects (identical content)
  // Normalize each order for stable JSON: sort items by id before stringify
  function normalizeOrderForHash(o) {
    try {
      const copy = JSON.parse(JSON.stringify(o)); // clone
      if (Array.isArray(copy.items)) {
        copy.items = copy.items.slice().sort((a,b)=> (a.id||0)-(b.id||0));
      }
      // do not rely on object property order; stringify sorted keys
      const sorted = {};
      Object.keys(copy).sort().forEach(k => sorted[k] = copy[k]);
      return JSON.stringify(sorted);
    } catch (e) {
      return JSON.stringify(o);
    }
  }

  const seenExact = new Set();
  const uniqueByContent = [];
  const exactDupes = [];
  maybeValid.forEach(o => {
    const h = normalizeOrderForHash(o);
    if (seenExact.has(h)) exactDupes.push(o);
    else {
      seenExact.add(h);
      uniqueByContent.push(o);
    }
  });

  console.log(`[order-history] exact duplicate orders removed: ${exactDupes.length}`);

  // Step C: dedupe by order.id keeping newest (based on date timestamp)
  const byId = new Map();
  const duplicatesById = [];
  uniqueByContent.forEach(o => {
    const id = String(o.id);
    if (!byId.has(id)) byId.set(id, o);
    else {
      const existing = byId.get(id);
      const tExisting = existing.date ? new Date(existing.date).getTime() : 0;
      const tNew = o.date ? new Date(o.date).getTime() : 0;
      // keep the newest - if equal prefer existing (stable)
      if (tNew > tExisting) {
        duplicatesById.push(existing);
        byId.set(id, o);
      } else {
        duplicatesById.push(o);
      }
    }
  });

  console.log(`[order-history] duplicate-by-id removed: ${duplicatesById.length}`);

  // Step D: final cleaned orders array (sorted newest -> oldest)
  let cleaned = Array.from(byId.values());
  cleaned.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  // Persist cleaned result back to localStorage (overwrites previous)
  localStorage.setItem('orders', JSON.stringify(cleaned));
  console.log(`[order-history] cleaned orders saved: ${cleaned.length}`);

  // Diagnostic summary visible in console
  console.group('[order-history] cleanup summary');
  console.log('raw:', raw.length);
  console.log('invalid removed:', invalidEntries.length);
  console.log('exact dupes removed:', exactDupes.length);
  console.log('id dupes removed:', duplicatesById.length);
  console.log('final saved:', cleaned.length);
  console.groupEnd();

  // Render UI - if none show message
  if (!cleaned.length) {
    listEl.innerHTML = `<div class="order-card"><div class="order-info"><div class="order-id">Belum ada pesanan</div><div class="order-meta">Anda belum membuat pesanan apapun.</div></div></div>`;
    return;
  }

  // helper format rupiah
  function formatRupiah(v){
    return 'Rp ' + Number(v || 0).toLocaleString('id-ID');
  }

  // render only ID summary rows (one per order) per your request
  cleaned.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';

    const info = document.createElement('div');
    info.className = 'order-info';

    const idDiv = document.createElement('div');
    idDiv.className = 'order-id';
    idDiv.textContent = `Pesanan #${order.id}`;

    const meta = document.createElement('div');
    meta.className = 'order-meta';
    const tanggal = order.date ? new Date(order.date).toLocaleString() : '-';
    const totalVal = order.total || formatRupiah((order.items||[]).reduce((s,it)=> s + (it.price||0)*(it.qty||1),0));
    meta.textContent = `Tanggal: ${tanggal} • Total: ${totalVal}`;

    info.appendChild(idDiv);
    info.appendChild(meta);

    // status badge
    const statusSpan = document.createElement('span');
    const st = (order.status || 'Diproses').toString().toLowerCase();
    const statusLabel = st.includes('selesai') ? 'Lunas' : (st.includes('kirim') ? 'Dikirim' : 'Diproses');
    statusSpan.className = 'order-status ' + (statusLabel==='Lunas' ? 'status-complete' : (statusLabel==='Dikirim' ? 'status-shipped' : 'status-processed'));
    statusSpan.textContent = statusLabel;

    // detail button (opens modal with images + items)
    const btnDetail = document.createElement('button');
    btnDetail.className = 'btn';
    btnDetail.textContent = 'Detail Pesanan';
    btnDetail.addEventListener('click', () => openDetailModal(order));

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '12px';
    right.append(statusSpan, btnDetail);

    card.append(info, right);
    listEl.appendChild(card);
  });

  // Modal creation (if not exist create one)
  let modal = document.getElementById('order-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'order-detail-modal';
    modal.className = 'order-modal hidden';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `
      <div class="order-modal-inner">
        <button class="order-modal-close" aria-label="Close">×</button>
        <div id="order-detail-content"></div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          <button id="order-shipping-btn" class="btn">Lihat Pengiriman</button>
          <button id="order-close-btn" class="btn secondary">Tutup</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // basic modal styles (scoped to avoid editing project css)
    const style = document.createElement('style');
    style.textContent = `
      .order-modal { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); z-index:1100; }
      .order-modal.hidden { display:none; }
      .order-modal-inner { background: #fff; border-radius:12px; padding:18px; max-width:900px; width:90%; max-height:80vh; overflow:auto; box-shadow:0 10px 30px rgba(0,0,0,0.2); }
      .order-modal-close { position:absolute; right:18px; top:18px; background:transparent; border:0; font-size:22px; cursor:pointer; color:#777; }
      .order-detail-item { display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #f1f1f1; }
      .order-detail-item img { width:72px; height:72px; object-fit:cover; border-radius:8px; border:1px solid #eee; }
      .order-detail-footer { margin-top:12px; font-weight:800; color:#ef4444; text-align:right; }
    `;
    document.head.appendChild(style);
  }

  const modalContent = document.getElementById('order-detail-content');
  const modalClose = document.querySelector('#order-detail-modal .order-modal-close');
  const modalCloseBtn = document.getElementById('order-close-btn');
  const modalShippingBtn = document.getElementById('order-shipping-btn');

  function openDetailModal(order) {
    if (!order) return;
    // build content: list of items with images
    const items = Array.isArray(order.items) ? order.items : [];
    modalContent.innerHTML = `<h3>Pesanan #${escapeHtml(order.id)}</h3>
      <div class="meta">Tanggal: ${order.date ? new Date(order.date).toLocaleString() : '-'}</div>
      <div style="margin-top:12px">Produk:</div>
      <div style="margin-top:6px">
        ${items.map(it => `
          <div class="order-detail-item">
            <img src="${escapeHtml(it.img || 'assets/img/placeholder.png')}" alt="${escapeHtml(it.title||'Produk')}">
            <div>
              <div style="font-weight:700">${escapeHtml(it.title||'Produk')}</div>
              <div style="color:#6b7280">${it.qty || 1} x ${formatRupiah(it.price)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="order-detail-footer">Total: ${order.total || formatRupiah(items.reduce((s,it)=>s+(it.price||0)*(it.qty||1),0))}</div>
    `;
    // attach shipping button
    modalShippingBtn.onclick = () => {
      localStorage.setItem('lastViewedOrder', order.id);
      window.location.href = `shipping.html?id=${encodeURIComponent(order.id)}`;
    };
    // open
    document.getElementById('order-detail-modal').classList.remove('hidden');
    document.getElementById('order-detail-modal').setAttribute('aria-hidden','false');
  }

  function hideModal() {
    const m = document.getElementById('order-detail-modal');
    if (!m) return;
    m.classList.add('hidden');
    m.setAttribute('aria-hidden','true');
  }

  modalClose && modalClose.addEventListener('click', hideModal);
  modalCloseBtn && modalCloseBtn.addEventListener('click', hideModal);
  window.addEventListener('keydown', (e)=> { if (e.key==='Escape') hideModal(); });

  // utility
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }
});
