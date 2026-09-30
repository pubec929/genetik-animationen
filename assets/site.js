(() => {
  'use strict';
  const button=document.querySelector('[data-menu-toggle]');
  const nav=document.getElementById('site-navigation');
  if(!button||!nav)return;
  function setOpen(open){
    button.setAttribute('aria-expanded',String(open));
    nav.classList.toggle('is-open',open);
    button.querySelector('[data-menu-label]').textContent=open?'Schließen':'Menü';
  }
  button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false);});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}
  });
  document.addEventListener('click',event=>{
    if(!nav.contains(event.target)&&!button.contains(event.target))setOpen(false);
  });
})();
