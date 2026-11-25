/* Interaksi shell Laravel mengikuti perilaku prototipe Sengonis. */
(() => {
  const root = document.documentElement;
  const defaults = {theme:'system',accent:'yellow',density:'comfortable',fs:'md',sidebar:'full',motion:true};
  let appearance;
  try {appearance={...defaults,...JSON.parse(localStorage.getItem('sengonis_appearance')||'{}')};}
  catch(e){appearance={...defaults};}
  try{if(!localStorage.getItem('sengonis_appearance') && ['dark','light'].includes(localStorage.getItem('sengonis_theme')))appearance.theme=localStorage.getItem('sengonis_theme');}catch(e){}
  const mobile = () => matchMedia('(max-width:900px)').matches;
  const shell = document.getElementById('app-shell');
  const apply = () => {
    for(const key of ['theme','accent','density','fs']) {
      if(appearance[key] === 'system' || (key==='accent'&&appearance[key]==='yellow') || (key==='density'&&appearance[key]==='comfortable') || (key==='fs'&&appearance[key]==='md')) delete root.dataset[key];
      else root.dataset[key]=appearance[key];
    }
    if(shell && !mobile()) shell.classList.toggle('sbm', appearance.sidebar==='mini');
    if(shell && mobile()) shell.classList.remove('sbm');
    root.dataset.motion = appearance.motion ? 'on' : 'off';
    document.querySelectorAll('[data-cfg]').forEach(el=>{
      const [key,value]=el.dataset.cfg.split(':');
      el.setAttribute('aria-pressed', String(String(appearance[key]) === value));
    });
    document.querySelectorAll('[data-setting-value]').forEach(el=>{
      const key=el.dataset.settingValue;
      if(el instanceof HTMLInputElement && el.type==='checkbox') el.checked=Boolean(appearance[key]);
      else el.value=String(appearance[key]);
    });
    document.querySelectorAll('[data-menu-toggle]').forEach(btn=>btn.setAttribute('aria-expanded',String(mobile()?!!shell?.classList.contains('open'):appearance.sidebar!=='mini')));
  };
  const save = () => {localStorage.setItem('sengonis_appearance',JSON.stringify(appearance));localStorage.setItem('sengonis_theme',appearance.theme);apply();};
  apply();
  addEventListener('resize', apply);
  document.querySelectorAll('[data-menu-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!shell)return;
    if(mobile()) shell.classList.toggle('open');
    else {appearance.sidebar=appearance.sidebar==='mini'?'full':'mini';save();}
    apply();
  }));
  const hidePop = (except=null) => {
    document.querySelectorAll('.pop:not([hidden])').forEach(el=>{if(el!==except)el.hidden=true;});
    document.querySelectorAll('[data-pop-toggle]').forEach(btn=>btn.setAttribute('aria-expanded',String(!document.getElementById(btn.dataset.popToggle)?.hidden)));
  };
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-pop-toggle]');
    if(toggle) {
      const pop=document.getElementById(toggle.dataset.popToggle);
      if(pop){const toOpen=pop.hidden;hidePop(pop);pop.hidden=!toOpen;toggle.setAttribute('aria-expanded',String(toOpen));}
      return;
    }
    if(!e.target.closest('.pop'))hidePop();
  });
  document.getElementById('theme-toggle')?.addEventListener('click',()=>{
    const dark=root.dataset.theme==='dark'||(!root.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);
    appearance.theme=dark?'light':'dark';save();
  });
  document.querySelectorAll('[data-cfg]').forEach(btn=>btn.addEventListener('click',()=>{
    const [key,val]=btn.dataset.cfg.split(':');
    appearance[key]=val;save();
  }));
  document.querySelectorAll('[data-setting-value]').forEach(control=>control.addEventListener('change',()=>{
    const key=control.dataset.settingValue;
    appearance[key]=control instanceof HTMLInputElement && control.type==='checkbox'?control.checked:control.value;
    save();
  }));
  document.querySelectorAll('[data-settings-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.settingsTab;
    document.querySelectorAll('[data-settings-pane]').forEach(p=>p.hidden=p.dataset.settingsPane!==id);
    document.querySelectorAll('[data-settings-tab]').forEach(t=>t.setAttribute('aria-current',String(t.dataset.settingsTab===id)));
    const u=new URL(location.href);u.searchParams.set('tab',id);history.replaceState(null,'',u);
  }));
  document.querySelectorAll('[data-confirm]').forEach(form=>form.addEventListener('submit',e=>{
    if(!confirm(form.dataset.confirm||'Lanjutkan?'))e.preventDefault();
  }));
  document.querySelectorAll('[data-auto-submit]').forEach(input=>input.addEventListener('change',()=>{if(input.files?.length)document.getElementById(input.dataset.autoSubmit)?.requestSubmit();}));
  document.querySelectorAll('[data-password-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const input=document.getElementById(btn.dataset.passwordToggle);
    if(input)input.type=input.type==='password'?'text':'password';
  }));
  document.querySelectorAll('[data-demo-user]').forEach(btn=>btn.addEventListener('click',()=>{
    const username=document.querySelector('input[name=username]');
    const password=document.querySelector('input[name=password]');
    if(username&&password){username.value=btn.dataset.demoUser;password.value=btn.dataset.demoUser==='owner'?'owner123':'officer123';password.focus();}
  }));
  const modal=document.getElementById('sengonis-modal');
  const closeModal = () => {if(modal){modal.innerHTML='';document.body.style.removeProperty('overflow');}};
  const setModalErrors = (errors) => {
    const box=modal.querySelector('.modal-errors');if(!box)return;
    const fields=Object.entries(errors||{});
    box.textContent=fields.length?fields.flatMap(([,messages])=>messages).join(' · '):'Periksa data yang diisi.';
    box.hidden=false;
  };
  const openModal = async (url) => {
    if(!modal){location.assign(url);return;}
    try {
      const response=await fetch(url,{headers:{'X-Requested-With':'XMLHttpRequest'}});
      if(!response.ok)throw new Error('Gagal membuka formulir');
      const documentHTML=new DOMParser().parseFromString(await response.text(),'text/html');
      const sourceForm=documentHTML.querySelector('.form-card form');
      if(!sourceForm)throw new Error('Formulir tidak ditemukan');
      const title=documentHTML.querySelector('.ph h1')?.textContent.trim()||'Tanaman';
      const wrapper=document.createElement('div');wrapper.className='mb';
      const form=document.createElement('form');form.className='mo plant-modal';
      form.setAttribute('role','dialog');form.setAttribute('aria-modal','true');form.setAttribute('aria-label',title);
      form.method='POST';form.action=sourceForm.action;
      form.innerHTML=`<div class="mh"><h2></h2><button type="button" class="ibtn plain" data-modal-close aria-label="Tutup">×</button></div><p class="err modal-errors" role="alert" hidden></p>`;
      form.querySelector('h2').textContent=title;
      for(const child of [...sourceForm.children])form.appendChild(child.cloneNode(true));
      const field=form.querySelector('input:not([type=hidden]), select');
      wrapper.appendChild(form);modal.replaceChildren(wrapper);document.body.style.overflow='hidden';
      wrapper.addEventListener('click',e=>{if(e.target===wrapper)closeModal();});
      form.querySelector('[data-modal-close]')?.addEventListener('click',closeModal);
      form.querySelectorAll('a[href]').forEach(anchor=>{
        if(anchor.textContent.trim().toLowerCase()==='batal')anchor.addEventListener('click',e=>{e.preventDefault();closeModal();});
      });
      form.addEventListener('submit',async e=>{
        e.preventDefault();const submit=form.querySelector('button[type=submit],button:not([type])');
        if(submit)submit.disabled=true;
        try {
          const result=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json','X-Requested-With':'XMLHttpRequest'}});
          if(result.status===422){const responseData=await result.json();setModalErrors(responseData.errors);return;}
          if(!result.ok)throw new Error('Gagal menyimpan. Periksa koneksi dan hak akses.');
          window.location.assign(window.location.pathname + window.location.search);
        }catch(err){setModalErrors({umum:[err.message]});}
        finally{if(submit)submit.disabled=false;}
      });
      field?.focus();
      if(window.lucide)lucide.createIcons({attrs:{class:'ic'}});
    }catch(err){window.location.assign(url);}
  };
  window.SengonisModal={open:openModal,close:closeModal};
  document.addEventListener('click',e=>{
    const trigger=e.target.closest('[data-modal-url]');
    if(!trigger || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button!==0)return;
    e.preventDefault();hidePop();openModal(trigger.dataset.modalUrl);
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeModal();hidePop();if(shell?.classList.contains('open'))shell.classList.remove('open');}
  });
  if(window.lucide)lucide.createIcons({attrs:{class:'ic'}});
})();
