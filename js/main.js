/* boot: apply saved settings, load data, restore the session, start the idle timer */
let ACT=Date.now();
applyCfg();load();
{const s=sessGet(),u=s&&S.users.find(x=>x.id==s.id&&x.aktif);if(u){U=u;V=(CFG.landing=="users"&&u.role!="Owner")?"home":CFG.landing}}
["click","keydown","pointerdown","scroll","touchstart"].forEach(ev=>addEventListener(ev,()=>ACT=Date.now(),{passive:true,capture:true}));
setInterval(()=>{if(U&&CFG.autoLogout&&Date.now()-ACT>CFG.autoLogout*6e4){ERR=`You were signed out after ${CFG.autoLogout} minutes of inactivity.`;closeAll();A.out()}},15000);
matchMedia("(prefers-color-scheme:dark)").addEventListener?.("change",()=>{applyCfg();if(U&&CFG.theme=="system")render()});
render();
