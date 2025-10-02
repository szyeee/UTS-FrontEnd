// header.js - ensure badges update from events
function renderHeaderActions(){
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || '';
  const usernameSpan = document.getElementById('nav-username');
  const logoutBtn = document.getElementById('nav-logout');
  const avatarLink = document.getElementById('nav-avatar');
  if (usernameSpan) usernameSpan.textContent = username;
  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  if (avatarLink) avatarLink.style.display = isLoggedIn ? 'inline-block' : 'none';
}
function renderFavoritesCount(){ try{ const fav = JSON.parse(localStorage.getItem('favorites')||'[]'); const el = document.getElementById('fav-count'); if(el) el.textContent = (Array.isArray(fav)?fav.length:0); }catch(e){} }
function tryUpdateCartBadge(){ try { if (typeof updateCartBadge === 'function') updateCartBadge(); else setTimeout(tryUpdateCartBadge, 150); } catch(e){ setTimeout(tryUpdateCartBadge, 150); } }
function attachPromoOpen(){ const btn = document.getElementById('promoOpen'); if(!btn) return; btn.addEventListener('click', ()=>{ const modal = document.querySelector('.promo-modal'); if(modal) modal.style.display='flex'; else window.location.href='promo.html'; }); }
function attachLogout(){ const logoutBtn = document.getElementById('nav-logout'); if(!logoutBtn) return; logoutBtn.addEventListener('click', function(e){ e.preventDefault(); localStorage.removeItem('isLoggedIn'); localStorage.removeItem('username'); renderHeaderActions(); alert('Anda sudah logout.'); }); }

fetch('header.html').then(r=>r.text()).then(t=>{ const ph=document.getElementById('header-placeholder'); if(ph) ph.innerHTML = t; renderHeaderActions(); attachLogout(); attachPromoOpen(); renderFavoritesCount(); tryUpdateCartBadge(); document.addEventListener('cart-updated', tryUpdateCartBadge); document.addEventListener('favorites-updated', renderFavoritesCount); }).catch(e=>console.error('Failed to load header', e));