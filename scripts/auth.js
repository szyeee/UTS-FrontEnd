
// auth.js - simple login/signup handlers (client-side demo)
document.addEventListener('DOMContentLoaded', function(){
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const username = (document.getElementById('username')||{}).value || '';
      const password = (document.getElementById('password')||{}).value || '';
      // simple validation (demo)
      if (!username || !password) {
        showAuthMessage('Masukkan username dan password.', 'error');
        return;
      }
      // fake auth: accept any non-empty credentials
      localStorage.setItem('isLoggedIn','true');
      localStorage.setItem('username', username);
      showAuthMessage('Login berhasil. Selamat datang, ' + username + '!', 'success');
      // update header immediately
      if (typeof renderHeaderActions === 'function') renderHeaderActions();
      if (typeof renderFavoritesCount === 'function') renderFavoritesCount();
      if (typeof updateCartBadge === 'function') updateCartBadge();
      // optionally redirect to home after short delay
      setTimeout(function(){ window.location.href = 'index.html'; }, 900);
    });
  }
});

function showAuthMessage(msg, type){
  const box = document.getElementById('authMessage');
  if (!box) {
    alert(msg);
    return;
  }
  box.textContent = msg;
  box.className = 'auth-msg ' + (type || '');
  box.style.display = 'block';
}
