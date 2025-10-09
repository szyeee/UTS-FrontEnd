// auth.js - patched login & signup logic (client-side demo)
// Defensive and simple: works without assumptions about exact DOM structure.

(function(){
  'use strict';

  function $(sel){ return document.querySelector(sel); }
  function $id(id){ return document.getElementById(id); }

  function showMessage(el, msg, isError){
    if (!el) { alert(msg); return; }
    el.textContent = msg;
    el.style.display = 'block';
    if (isError) {
      el.style.color = 'crimson';
    } else {
      el.style.color = '';
    }
  }

function findUser(username){
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (!username) return null;
  return users.find(u => {
    if (!u || typeof u.username !== 'string') return false;
    return u.username.toLowerCase() === username.toLowerCase();
  });
}


  function loginHandler(e){
    if (e) e.preventDefault && e.preventDefault();
    const form = e && e.target ? e.target : document.forms['loginForm'] || null;
    if (!form) return;
    const username = (form.querySelector('[name=username]') || form.querySelector('#username') || {}).value || '';
    const password = (form.querySelector('[name=password]') || form.querySelector('#password') || {}).value || '';
    const authMessage = document.getElementById('authMessage');

    if (!username || !password) {
      showMessage(authMessage, 'Harap isi username dan password.', true);
      return;
    }

    const user = findUser(username);
    if (!user) {
      showMessage(authMessage, 'Akun tidak ditemukan. Silakan daftar dulu.', true);
      return;
    }
    if (user.password !== password) {
      showMessage(authMessage, 'Password salah.', true);
      return;
    }

    // success
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', user.username);
    localStorage.setItem('user', JSON.stringify(user));
    showMessage(authMessage, 'Login berhasil! Mengalihkan...', false);

    // small delay so user sees message, then redirect
    setTimeout(()=> {
      window.location.href = 'index.html';
    }, 300);
  }

  function signupHandler(e){
    if (e) e.preventDefault && e.preventDefault();
    const form = e && e.target ? e.target : document.forms['signupForm'] || null;
    if (!form) return;
    const username = (form.querySelector('[name=username]') || {}).value || '';
    const phone = (form.querySelector('[name=phone]') || {}).value || '';
    const password = (form.querySelector('[name=password]') || {}).value || '';
    const confirm = (form.querySelector('[name=confirmPassword]') || form.querySelector('[name=confirm]') || {}).value || '';
    const validationMsgBox = document.getElementById('validation-msg');

    if (!username || !phone || !password) {
      showMessage(validationMsgBox, 'Lengkapi semua field.', true);
      return;
    }
    if (password.length < 6) {
      showMessage(validationMsgBox, 'Password minimal 6 karakter.', true);
      return;
    }
    if (password !== confirm) {
      showMessage(validationMsgBox, 'Password dan konfirmasi tidak cocok.', true);
      return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '[]');
if (users.some(u => String(u && u.username || '').toLowerCase() === username.toLowerCase())) {
  showMessage(validationMsgBox, 'Username sudah digunakan.', true);
  return;
}

    const newUser = { username, phone, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showMessage(validationMsgBox, 'Daftar berhasil. Mengalihkan ke login...', false);

    setTimeout(()=> {
      window.location.href = 'login.html';
    }, 500);
  }

  function attachFormHandlers(){
    // login form
    const loginForm = document.getElementById('loginForm') || document.forms['loginForm'];
    if (loginForm && !loginForm.__authBound) {
      loginForm.addEventListener('submit', loginHandler);
      // ensure submit button is type submit
      const submitBtn = loginForm.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) submitBtn.type = 'submit';
      loginForm.__authBound = true;
    }

    // signup form
    const signupForm = document.getElementById('signupForm') || document.forms['signupForm'];
    if (signupForm && !signupForm.__authBound) {
      // if page uses button instead of form, attach click
      signupForm.addEventListener('submit', signupHandler);
      const btn = signupForm.querySelector('button[type="button"].signup-btn') || signupForm.querySelector('#signup-btn');
      if (btn) {
        // If it's a standalone button, attach click to call handler manually
        if (!btn.__signupBound) {
          btn.addEventListener('click', function(e){
            // Create a synthetic event object with target=form for handler
            signupHandler({ target: signupForm, preventDefault: ()=>{} });
          });
          btn.__signupBound = true;
        }
      }
      signupForm.__authBound = true;
    }
  }

  // attach password toggle if controls exist
  function attachPasswordToggles(){
    function toggle(buttonSelector, inputSelector){
      const btn = document.querySelector(buttonSelector);
      const input = document.querySelector(inputSelector);
      if (!btn || !input) return;
      btn.addEventListener('click', function(e){
        e.preventDefault();
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? 'Show' : 'Hide';
      });
    }
    toggle('#toggle-password', '#password');
    toggle('#toggle-confirm', '#confirmPassword');
  }

  // Initialize when DOM ready
  function init(){
    attachFormHandlers();
    attachPasswordToggles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
