// profile.js - save profile data properly
document.addEventListener('DOMContentLoaded', function(){
  // load current user if present
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){ user = {}; }

  // populate fields if user exists
  const fullnameEl = document.getElementById('fullname');
  const usernameEl = document.getElementById('username');
  const addressEl = document.getElementById('address');
  const phoneEl = document.getElementById('phone');
  const avatarImg = document.getElementById('avatar-img');

  if(fullnameEl) fullnameEl.value = user.fullname || user.name || '';
  if(usernameEl) usernameEl.value = user.username || user.email && user.email.split('@')[0] || '';
  if(addressEl) addressEl.value = user.address || '';
  if(phoneEl) phoneEl.value = user.phone || '';

  const saveBtn = document.getElementById('save-profile');
  if(saveBtn){
    saveBtn.addEventListener('click', function(e){
      e.preventDefault();
      // read values (use trimmed)
      const newFull = fullnameEl ? fullnameEl.value.trim() : '';
      const newUser = usernameEl ? usernameEl.value.trim() : (user.username || '');
      const newAddr = addressEl ? addressEl.value.trim() : '';
      const newPhone = phoneEl ? phoneEl.value.trim() : '';

      // update user object and persist
      const updated = Object.assign({}, user, {
        fullname: newFull,
        username: newUser,
        address: newAddr,
        phone: newPhone
      });
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('username', updated.username || '');

      // feedback and stay on the profile page (do not redirect)
      alert('Profil berhasil diperbarui!');
      // re-render header actions if available
      if (typeof renderHeaderActions === 'function') renderHeaderActions();
    });
  }
});