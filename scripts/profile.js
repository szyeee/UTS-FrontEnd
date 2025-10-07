// profile.js - save profile data properly (final)
document.addEventListener('DOMContentLoaded', function(){

  // --- safety: hapus duplikat elemen jika ada (keamanan terhadap injected copies) ---
  // hapus duplicate input atau duplicate image yang memakai id sama
  document.querySelectorAll('#avatar-input').forEach((el, idx) => { if (idx > 0) el.remove(); });
  document.querySelectorAll('#profile-avatar').forEach((el, idx) => { if (idx > 0) el.remove(); });
  document.querySelectorAll('#reset-avatar').forEach((el, idx) => { if (idx > 0) el.remove(); });

  // --- ambil data user dari localStorage ---
  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){ user = {}; }

  const fullnameEl = document.getElementById('fullname');
  const usernameEl = document.getElementById('username');
  const addressEl = document.getElementById('address');
  const phoneEl = document.getElementById('phone');
  const avatarImg = document.getElementById('profile-avatar');
  const avatarInput = document.getElementById('avatar-input');
  const resetBtn = document.getElementById('reset-avatar');

  // isi field jika ada data user
  if(fullnameEl) fullnameEl.value = user.fullname || '';
  if(usernameEl) usernameEl.value = user.username || '';
  if(addressEl) addressEl.value = user.address || '';
  if(phoneEl) phoneEl.value = user.phone || '';
  if(avatarImg && user.avatar) avatarImg.src = user.avatar;

  // handle upload foto -> simpan data URL sementara pada objek user
  if(avatarInput){
    avatarInput.addEventListener('change', function(){
      const file = this.files && this.files[0];
      if(!file) return;
      // optional: validate size/type
      if(!file.type.startsWith('image/')) { alert('Silakan pilih file gambar.'); return; }
      if(file.size > 2_000_000) { // 2MB limit contoh
        if(!confirm('Ukuran file lebih dari 2MB, tetap upload?')) return;
      }
      const reader = new FileReader();
      reader.onload = function(e){
        if(avatarImg) avatarImg.src = e.target.result;
        user.avatar = e.target.result; // simpan sementara ke object user
      };
      reader.readAsDataURL(file);
    });
  }

  // Reset avatar -> set default dan hapus dari user object
  if(resetBtn){
    resetBtn.addEventListener('click', function(e){
      e.preventDefault();
      if(avatarImg) avatarImg.src = "assets/default-avatar.svg";
      if(user) delete user.avatar;
    });
  }

  // Save profile -> validasi minimal, simpan ke localStorage, update header, redirect
  const saveBtn = document.getElementById('save-profile');
  if(saveBtn){
    saveBtn.addEventListener('click', function(e){
      e.preventDefault();

      // simple validation (lebih lengkap bisa ditambah)
      const newFull = fullnameEl ? fullnameEl.value.trim() : '';
      const newUser = usernameEl ? usernameEl.value.trim() : '';
      if(!newFull) { alert('Nama lengkap wajib diisi.'); fullnameEl && fullnameEl.focus(); return; }
      if(!newUser) { alert('Username wajib diisi.'); usernameEl && usernameEl.focus(); return; }

      const newAddr = addressEl ? addressEl.value.trim() : '';
      const newPhone = phoneEl ? phoneEl.value.trim() : '';

      // gabungkan dan simpan
      const updated = Object.assign({}, user, {
        fullname: newFull,
        username: newUser,
        address: newAddr,
        phone: newPhone
      });

      // pastikan avatar di updated object (jika user.avatar telah diset saat upload)
      if(avatarImg && avatarImg.src && avatarImg.src.includes('data:')) {
        updated.avatar = avatarImg.src;
      } else if (user && user.avatar) {
        // keep existing avatar if any
        updated.avatar = user.avatar;
      }

      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('username', updated.username || '');
      localStorage.setItem('isLoggedIn', 'true');

      // update header (header.js harus expose renderHeaderActions)
      if (typeof renderHeaderActions === 'function') {
        renderHeaderActions();
      }

      // feedback dan redirect ke home
      // optional: gunakan toast, sekarang simple alert
      alert('Profil berhasil diperbarui!');
      window.location.href = 'index.html';
    });
  }
});
