// promo. js - small promo modal & carousel
(function(){
  const modal = document.getElementById('promoModal');
  if(!modal) return;
  const track = document.getElementById('promoTrack');
  const items = track ? Array.from(track.children) : [];
  let idx = 0;
  function showModal(){ 
    modal.style.display='block'; 
    modal.setAttribute('aria-hidden','false'); 
  }

  function hideModal(){ 
    modal.style.display='none'; 
    modal.setAttribute('aria-hidden','true'); 
  }

  function showIndex(i){
    if(!track) return;
    if(i<0) i = items.length-1;
    if(i>=items.length) i = 0;
    idx = i;
    const w = items[0].offsetWidth || track.clientWidth;
    track.style.transform = 'translateX(' + (-idx * w) + 'px)';
  }

  // event handlers
  document.getElementById('promoClose').addEventListener('click', hideModal);
  document.getElementById('promoNext').addEventListener('click', function(){ showIndex(idx+1); });
  document.getElementById('promoPrev').addEventListener('click', function(){ showIndex(idx-1); });

  // basic responsive sizing
  window.addEventListener('resize', function(){ showIndex(idx); });

  // show modal after short delay if not dismissed earlier
  if(!localStorage.getItem('promoDismissed')){
    setTimeout(showModal, 1200);
  }
  
  // if user closes, mark dismissed so not show again
  document.getElementById('promoClose').addEventListener('click', function(){ localStorage.setItem('promoDismissed','1'); });
})();