// header.js - dynamic header injection and initialization
function renderHeaderActions() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || '';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const usernameSpan = document.getElementById('nav-username');
  const logoutBtn = document.getElementById('nav-logout');
  const avatarLink = document.getElementById('nav-avatar');
  const avatarImg = document.getElementById('avatar-img');

  if (usernameSpan) usernameSpan.textContent = username;
  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  if (avatarLink) avatarLink.style.display = isLoggedIn ? 'inline-block' : 'none';

  // update foto avatar jika ada
  if (avatarImg) {
    if (user.avatar) {
      avatarImg.src = user.avatar;
    } else {
      avatarImg.src = "assets/default-avatar.svg"; // fallback default
    }
  }
}

function renderFavoritesCount() { 
  try{ 
    const fav = JSON.parse(localStorage.getItem('favorites')||'[]'); 
    const el = document.getElementById('fav-count'); 
    if(el) el.textContent = (Array.isArray(fav)?fav.length:0); 
  } catch(e){} 
}

function tryUpdateCartBadge() { 
  try { 
    if (typeof updateCartBadge === 'function') updateCartBadge(); 
    else setTimeout(tryUpdateCartBadge, 150); 
  } catch(e){ setTimeout(tryUpdateCartBadge, 150); } 
}

function attachPromoOpen() { 
  const btn = document.getElementById('promoOpen'); 
  if(!btn) return; 
  btn.addEventListener('click', ()=>{ 
    const modal = document.querySelector('.promo-modal'); 
    if(modal) modal.style.display='flex'; 
    else window.location.href='promo.html'; 
  }); 
}

function attachLogout() { 
  const logoutBtn = document.getElementById('nav-logout'); 
  if(!logoutBtn) return; 
  logoutBtn.addEventListener('click', function(e){ 
    e.preventDefault(); 
    localStorage.removeItem('isLoggedIn'); 
    localStorage.removeItem('username'); 
    localStorage.removeItem('user'); 
    renderHeaderActions(); 
    alert('Anda sudah logout.'); 
    window.location.href = 'landing.html'; 
  }); 
}

function disableFullScreenOverlays(containerEl) {
  try {
    const all = containerEl.querySelectorAll('*');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    all.forEach(el => {
      const cs = window.getComputedStyle(el);
      if (cs.position === 'fixed') {
        const r = el.getBoundingClientRect();
        // if element covers (or almost covers) the viewport, treat as overlay/backdrop
        const coversWidth = Math.abs(r.width - vw) < 2 || (r.left <= 0 && r.right >= vw);
        const coversHeight = Math.abs(r.height - vh) < 2 || (r.top <= 0 && r.bottom >= vh);
        if (coversWidth && coversHeight) {
          // mark for debugging and disable pointer events so clicks pass through
          el.dataset._disabledOverlay = 'true';
          el.style.pointerEvents = 'none';
          // optional: reduce zIndex so it's less likely to overlap (safe fallback)
          try {
            el.style.zIndex = Math.min( (parseInt(cs.zIndex) || 10000), 1000 );
          } catch(e) {}
        }
      }
    });
  } catch(e){
    // don't block header if something fails
    console.warn('[header] disableFullScreenOverlays failed', e);
  }
}

function ensureAuthClickable() {
  try {
    const auth = document.querySelector('.auth-wrap');
    if (!auth) return;
    // make sure auth-wrap above overlays and accepts pointer events
    auth.style.position = 'relative';
    auth.style.zIndex = '99999';
    auth.style.pointerEvents = 'auto';
    // also ensure container has auto pointer events
    const cont = auth.closest('.container') || document.querySelector('.container');
    if (cont) cont.style.pointerEvents = 'auto';
  } catch(e){
    console.warn('[header] ensureAuthClickable failed', e);
  }
}

// load header HTML and initialize
fetch('header.html').then(r=>r.text()).then(t=>{
  const ph=document.getElementById('header-placeholder'); 
  if(ph) ph.innerHTML = t;

  // small delay next tick to allow browser to compute styles and layout
  requestAnimationFrame(()=>{
    try {
      // disable full-screen overlays injected by header (if any)
      if (ph) disableFullScreenOverlays(ph);

      // make sure login/signup forms are clickable
      ensureAuthClickable();

      // existing initialization
      renderHeaderActions(); 
      attachLogout(); 
      attachPromoOpen(); 
      renderFavoritesCount(); 
      tryUpdateCartBadge(); 
      document.addEventListener('cart-updated', tryUpdateCartBadge); 
      document.addEventListener('favorites-updated', renderFavoritesCount);
    } catch(e) {
      console.error('header init error', e);
    }
  });

}).catch(e=>console.error('Failed to load header', e));
