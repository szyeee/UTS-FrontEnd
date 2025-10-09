// products.js - manage product listing, filtering, searching
const PRODUCTS = [
  {id:1, title:'Buket Mawar', price:125000, img:'assets/img/p1.jpg', desc:'Buket mawar cantik untuk hari spesial.', category:'Buket'},
  {id:2, title:'Buket Lily', price:150000, img:'assets/img/p2.jpg', desc:'Lily elegan, pilihan mewah.', category:'Buket'},
  {id:3, title:'Buket Campuran', price:175000, img:'assets/img/p3.jpg', desc:'Campuran bunga lokal dan impor.', category:'Buket'},
  {id:4, title:'Buket Rose Deluxe', price:225000, img:'assets/img/p4.jpg', desc:'Rose deluxe, cocok untuk kejutan.', category:'Buket'},
  {id:5, title:'Tanaman Monstera', price:90000, img:'assets/img/p5.jpg', desc:'Tanaman hias untuk dekor rumah.', category:'Tanaman Hias'},
  {id:6, title:'Aksesoris Pembungkus', price:25000, img:'assets/img/p6.jpg', desc:'Kertas & pita cantik untuk pembungkusan.', category:'Aksesoris'},
  {id:7, title:'Buket Tulip', price:135000, img:'assets/img/p7.jpg', desc:'Tulip segar berkualitas.', category:'Buket'},
  {id:8, title:'Buket Peony', price:195000, img:'assets/img/p8.jpg', desc:'Peony mewah untuk momen spesial.', category:'Buket'},
  {id:9, title:'Tanaman Kaktus', price:45000, img:'assets/img/p9.jpg', desc:'Kaktus kecil, perawatan mudah.', category:'Tanaman Hias'},
  {id:10, title:'Vas Cantik', price:75000, img:'assets/img/p10.jpg', desc:'Vas keramik untuk presentasi bunga.', category:'Aksesoris'},
  {id:11, title:'Parcel Coklat Premium', price:250000, img:'assets/img/parcel-coklat.jpg', desc:'Parcel berisi coklat premium pilihan, cocok untuk hadiah spesial.', category:'Parcel & Kado'},
  {id:12, title:'Kado Romantis Box', price:180000, img:'assets/img/kado-romantis.jpg', desc:'Kado berisi bunga artifisial dan kartu ucapan cinta.', category:'Parcel & Kado'},
  {id:13, title:'Parcel Lebaran Eksklusif', price:320000, img:'assets/img/parcel-lebaran.jpg', desc:'Parcel berisi kue kering dan sirup lebaran dalam kemasan elegan.', category:'Parcel & Kado'},
  {id:14, title:'Kado Ulang Tahun Custom', price:275000, img:'assets/img/kado-ultah.jpg', desc:'Kado unik yang dapat dikustomisasi sesuai nama penerima.', category:'Parcel & Kado'},
  {id:15, title:'Cincin Bunga Artisanal', price:85000, img:'assets/img/cincin-bunga.jpg', desc:'Cincin handmade berbentuk bunga kecil, cocok untuk acara santai.', category:'Aksesoris'},
  {id:16, title:'Kalung Permata Elegan', price:150000, img:'assets/img/kalung-permata.jpg', desc:'Kalung dengan liontin permata sintetis yang berkilau indah.', category:'Aksesoris'},
  {id:17, title:'Anting Berlian Mini', price:95000, img:'assets/img/anting-berlian.jpg', desc:'Anting kecil berlapis silver yang menambah kesan elegan.', category:'Aksesoris'},
  {id:18, title:'Gelang Bunga Mawar', price:78000, img:'assets/img/gelang-mawar.jpg', desc:'Gelang dengan detail bunga mawar, cocok untuk hadiah sahabat.', category:'Aksesoris'}
];

function formatRupiah(v){
  return 'Rp ' + Number(v).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function renderFilters(){
  const container = document.getElementById('product-filters');
  if (!container) return;
  const cats = ['All', ...Array.from(new Set(PRODUCTS.map(p=>p.category)))];
  container.innerHTML = cats.map(c=>`<button class="filter-btn" data-cat="${c}">${c}</button>`).join(' ');
  container.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click', function(){
      container.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat === 'All' ? '' : this.dataset.cat;
      const q = document.getElementById('product-search') ? document.getElementById('product-search').value : '';
      renderProducts(cat, q, {});
    });
  });
  const first = container.querySelector('.filter-btn');
  if(first) first.classList.add('active');
}

function renderProducts(category='', q='', options={}){
  const container = document.getElementById('products-grid');
  if(!container) return;
  const compact = options.compact || container.classList.contains('small') || container.classList.contains('small-grid') || false;
  let list = PRODUCTS.slice();
  if(category) list = list.filter(p => p.category === category);
  if(q) { const qq = q.toLowerCase(); list = list.filter(p => (p.title + ' ' + (p.desc||'')).toLowerCase().includes(qq)); }
  container.innerHTML = '';
  if(compact){
    container.classList.add('small');
  } else {
    container.classList.remove('small');
  }
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card' + (compact ? ' compact' : '');
    if(compact){
      card.innerHTML = `
        <div style="position:relative">
          <button class="fav-btn" data-id="${p.id}" title="Favorite">♡</button>
          <img class="product-image" src="${p.img}" alt="${p.title}">
        </div>
        <div class="title" style="font-weight:700;margin-top:6px">${p.title}</div>
        <div class="meta text-muted" style="margin-bottom:6px">${p.category}</div>
        <div class="price" style="margin-bottom:6px">${formatRupiah(p.price)}</div>
        <div class="actions" style="display:flex;gap:8px">
          <button class="btn add-cart" data-id="${p.id}">Add</button>
          <a class="btn secondary view-link" href="product-details.html?id=${p.id}">Lihat</a>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div style="position:relative">
          <button class="fav-btn" data-id="${p.id}" title="Favorite">♡</button>
          <img src="${p.img}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px">
        </div>
        <div class="title" style="font-weight:700;margin-top:6px;">${p.title}</div>
        <div class="meta text-muted" style="margin-bottom:6px">${p.desc || p.category}</div>
        <div class="price" style="margin-bottom:8px">${formatRupiah(p.price)}</div>
        <div class="actions">
          <button class="btn add-cart" data-id="${p.id}">Add to Cart</button>
          <a class="btn secondary view-link" href="product-details.html?id=${p.id}">Lihat</a>
        </div>
      `;
    }
    container.appendChild(card);
  });

  container.querySelectorAll('.fav-btn').forEach(b=>{
    b.addEventListener('click', function(){
      const id = this.dataset.id;
      this.classList.toggle('active');
    });
  });

  container.querySelectorAll('.add-cart').forEach(b=>{
    b.addEventListener('click', function(){
      const id = parseInt(this.dataset.id, 10);
      if (Number.isNaN(id)) return;
      const product = PRODUCTS.find(p => Number(p.id) === id);
      if (!product) return alert('Produk tidak ditemukan.');
      if (typeof addToCart === 'function') addToCart(product, 1);
      else alert('Keranjang belum siap, silakan muat ulang halaman.');
    });
  });
}

// robust attachSearchInput + safer init (paste menggantikan fungsi lama & DOMContentLoaded init)
function attachSearchInput(){
  const tryAttach = () => {
    // cari dengan id, lalu fallback cari berdasarkan placeholder
    let input = document.getElementById('product-search');
    if (!input) {
      input = document.querySelector('input[placeholder*="Cari"], input[placeholder*="cari"], input[placeholder="Cari produk..."]');
    }
    if (!input) return null;

    try {
      // pastikan input bisa diakses & diklik (fallback untuk overlay)
      input.tabIndex = input.tabIndex || 0;
      input.style.pointerEvents = 'auto';
      // hanya naikkan z-index jika belum ditetapkan tinggi (agar tidak mengganggu layout)
      if (!input.style.zIndex || Number(input.style.zIndex) < 1000) input.style.zIndex = 1000;

      // attach listeners (de-duplicate)
      if (!input.__attachedProductSearch) {
        input.addEventListener('input', function(){
          const q = this.value || '';
          const activeBtn = document.querySelector('.filter-btn.active');
          const cat = activeBtn ? (activeBtn.dataset.cat === 'All' ? '' : activeBtn.dataset.cat) : '';
          renderProducts(cat, q, {compact: !!document.querySelector('.products-grid.small')});
        });
        input.addEventListener('keydown', function(e){
          if (e.key === 'Enter') {
            e.preventDefault();
            const q = this.value || '';
            const activeBtn = document.querySelector('.filter-btn.active');
            const cat = activeBtn ? (activeBtn.dataset.cat === 'All' ? '' : activeBtn.dataset.cat) : '';
            renderProducts(cat, q, {compact: !!document.querySelector('.products-grid.small')});
          }
        });
        input.__attachedProductSearch = true;
        console.log('product-search: listener terpasang');
      }
      return input;
    } catch(err){
      console.warn('product-search: gagal attach', err);
      return null;
    }
  };

  // coba langsung
  if (tryAttach()) return;

  // jika belum tersedia, lakukan retry beberapa kali (max ~3 detik)
  let attempts = 0;
  const maxAttempts = 15;
  const tid = setInterval(() => {
    attempts++;
    if (tryAttach() || attempts >= maxAttempts) {
      clearInterval(tid);
      if (attempts >= maxAttempts) console.warn('product-search: elemen tidak ditemukan setelah beberapa kali percobaan');
    }
  }, 200);
}

// safer init: panggil renderFilters & renderProducts dulu, lalu pasang search input
document.addEventListener('DOMContentLoaded', function(){
  try {
    renderFilters();
  } catch(e){ console.warn('renderFilters error', e); }
  try {
    renderProducts('', '', {});
  } catch(e){ console.warn('renderProducts error', e); }
  attachSearchInput();
});

