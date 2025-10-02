// search.js - live suggestions and show results using PRODUCTS
document.addEventListener('DOMContentLoaded', function(){
  const input = document.getElementById('search-input');
  const sug = document.getElementById('suggestions');
  const results = document.getElementById('search-results');
  function renderSuggestions(q){
    if(!q){ sug.innerHTML=''; return; }
    const ql = q.toLowerCase();
    const list = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.filter(p=> (p.title + ' ' + p.desc).toLowerCase().indexOf(ql)!==-1).slice(0,6) : [];
    sug.innerHTML = list.map(p=>`<div class="card" style="padding:8px;margin-bottom:6px;cursor:pointer" data-id="${p.id}"><strong>${p.title}</strong><div class="text-muted">${p.category} • ${p.desc}</div></div>`).join('');
    sug.querySelectorAll('.card').forEach(el=> el.addEventListener('click', ()=> { window.location.href = 'product-details.html?id=' + el.dataset.id; }));
  }
  function renderResults(q){ const grid = document.getElementById('search-results'); grid.innerHTML=''; renderProducts('', q); // products.js will populate .products-grid
  }
  input.addEventListener('input', function(){ const q=this.value; renderSuggestions(q); renderResults(q); });
});