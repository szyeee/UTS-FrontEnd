// help.js - placeholder
console.log('Loaded help.js');
// scripts/help.js - FAQ search, accordion, contact form (demo storage)
(function(){
  'use strict';

  // sample FAQ data (kecepatan, bisa diambil dari server nanti)
  const FAQS = [
    {q:'Bagaimana cara melakukan pemesanan?', a:'Tambahkan produk ke keranjang, lalu ikuti proses checkout. Lengkapi alamat dan metode pembayaran.'},
    {q:'Berapa lama waktu pengiriman?', a:'Estimasi 2–5 hari kerja tergantung lokasi. Untuk kota besar biasanya 1–2 hari.'},
    {q:'Bagaimana cara mengembalikan barang?', a:'Ajukan retur melalui menu Akun > Pesanan atau hubungi support beserta foto bukti.'},
    {q:'Metode pembayaran apa saja yang tersedia?', a:'Transfer bank, e-wallet (OVO/Gopay/Dana), dan COD pada area tertentu.'},
    {q:'Bagaimana cara menggunakan voucher atau promo?', a:'Masukkan kode promo pada halaman checkout sebelum menyelesaikan pembayaran.'},
    {q:'Apakah bisa mengubah atau membatalkan pesanan setelah checkout?', a:'Jika pesanan belum dikirim, hubungi support segera dengan nomor order.'},
    {q:'Apa yang harus dilakukan jika menerima barang rusak atau salah?', a:'Foto kondisi paket & produk lalu hubungi support maksimal 3×24 jam setelah terima.'}
  ];

  // helper
  function $ (sel){ return document.querySelector(sel); }
  function renderFAQ(list){
    const container = $('#faq-list');
    if(!container) return;
    container.innerHTML = '';
    list.forEach((it, idx) => {
      const item = document.createElement('div');
      item.className = 'faq-item';
      item.innerHTML = `
        <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-a-${idx}">
          <span>${it.q}</span>
          <span class="faq-caret">+</span>
        </button>
        <div id="faq-a-${idx}" class="faq-answer">${it.a}</div>
      `;
      container.appendChild(item);
    });

    // attach accordion behavior
    container.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function(){
        const expanded = this.getAttribute('aria-expanded') === 'true';
        // close all
        container.querySelectorAll('.faq-question').forEach(b => {
          b.setAttribute('aria-expanded','false');
          const a = b.nextElementSibling;
          if (a) a.style.display = 'none';
        });
        if (!expanded) {
          this.setAttribute('aria-expanded','true');
          const ans = this.nextElementSibling;
          if (ans) ans.style.display = 'block';
        }
      });
    });
  }

  // search handler
  function attachSearch(){
    const input = $('#faq-search');
    const clearBtn = $('#faq-clear');
    if (!input) return;
    function doFilter(){
      const q = (input.value || '').toLowerCase().trim();
      const filtered = FAQS.filter(f => (f.q + ' ' + f.a).toLowerCase().includes(q));
      renderFAQ(filtered.length ? filtered : FAQS);
    }
    input.addEventListener('input', doFilter);
    if (clearBtn) clearBtn.addEventListener('click', function(){
      input.value = ''; renderFAQ(FAQS);
    });
  }

  // contact form behavior (demo): validation + store to localStorage
  function attachContactForm(){
    const form = $('#help-contact-form');
    const notify = $('#help-notify');
    if (!form) return;

    function show(msg, kind){
      if(!notify) { alert(msg); return; }
      notify.textContent = msg;
      notify.style.display = 'block';
      notify.className = 'notify ' + (kind === 'error' ? 'error' : 'success');
      setTimeout(()=> { notify.style.display = 'none'; }, 5000);
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = (form.querySelector('[name=name]')||{value:''}).value.trim();
      const email = (form.querySelector('[name=email]')||{value:''}).value.trim();
      const message = (form.querySelector('[name=message]')||{value:''}).value.trim();

      if (!name || name.length < 2) { show('Nama minimal 2 karakter.', 'error'); return; }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { show('Masukkan email yang valid.', 'error'); return; }
      if (!message || message.length < 6) { show('Tulis pesan minimal 6 karakter.', 'error'); return; }

      // simulate save
      try {
        const arr = JSON.parse(localStorage.getItem('helpMessages')||'[]');
        arr.unshift({ name, email, message, date:new Date().toISOString() });
        localStorage.setItem('helpMessages', JSON.stringify(arr));
      } catch(err){
        console.warn('help.js: storage error', err);
      }

      show('Pesan terkirim. Tim support akan menghubungi Anda.', 'success');
      form.reset();
    });

    // clear button
    const clearBtn = $('#help-clear');
    if (clearBtn) clearBtn.addEventListener('click', function(){ form.reset(); $('#help-notify') && ($('#help-notify').style.display='none'); });
  }

  // initialize
  document.addEventListener('DOMContentLoaded', function(){
    renderFAQ(FAQS);
    attachSearch();
    attachContactForm();
  });

})();
