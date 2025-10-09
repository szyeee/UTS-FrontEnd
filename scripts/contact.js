// scripts/contact.js - client-side handling for contact page (demo)
(function(){
  'use strict';

  function $(sel){ return document.querySelector(sel); }
  const form = $('#contactForm');
  const notify = $('#contact-notify');
  const ferr = $('#contact-error');
  const clearBtn = $('#contact-clear');

  function showSuccess(msg){
    if (!notify) { alert(msg); return; }
    notify.textContent = msg;
    notify.classList.add('notify-success');
    notify.style.display = 'block';
    if (ferr) ferr.style.display = 'none';
    // auto hide after 5s
    setTimeout(()=> { if (notify) notify.style.display = 'none'; }, 5000);
  }

  function showError(msg){
    if (!ferr) { alert(msg); return; }
    ferr.textContent = msg;
    ferr.classList.add('notify-error');
    ferr.style.display = 'block';
    if (notify) notify.style.display = 'none';
  }

  function validate(data){
    if (!data.name || data.name.trim().length < 2) return 'Nama harus diisi minimal 2 karakter.';
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) return 'Masukkan email yang valid.';
    if (!data.message || data.message.trim().length < 6) return 'Isi pesan minimal 6 karakter.';
    return '';
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function(){
      if (form) form.reset();
      if (ferr) ferr.style.display = 'none';
      if (notify) notify.style.display = 'none';
    });
  }

  if (!form) return;

  form.addEventListener('submit', function(evt){
    evt.preventDefault();
    const data = {
      name: (form.querySelector('[name=name]') || {value:''}).value.trim(),
      email: (form.querySelector('[name=email]') || {value:''}).value.trim(),
      phone: (form.querySelector('[name=phone]') || {value:''}).value.trim(),
      subject: (form.querySelector('[name=subject]') || {value:''}).value,
      message: (form.querySelector('[name=message]') || {value:''}).value.trim(),
      createdAt: new Date().toISOString()
    };

    const v = validate(data);
    if (v) { showError(v); return; }

    // demo: simpan ke localStorage
    try {
      const arr = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      arr.unshift(data);
      localStorage.setItem('contactMessages', JSON.stringify(arr));
    } catch(e) {
      console.warn('contact.js: localStorage error', e);
    }

    showSuccess('Pesan terkirim. Terima kasih — tim kami akan menghubungi Anda.');
    form.reset();
  });

  // keyboard shortcut: Ctrl/Cmd + Enter from textarea to submit
  const ta = $('#cmessage') || $('#cmessage') || $('#cmessage'); // try not to break if id changed
  (function attachShort(){
    const area = document.getElementById('cmessage') || document.getElementById('cmessage') || document.getElementById('message');
    if (!area) return;
    area.addEventListener('keydown', function(e){
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('contact-send') && document.getElementById('contact-send').click();
      }
    });
  })();

})();
