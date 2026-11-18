/* every [data-a] button in the UI calls A[name](data-i) */
const A={close,
 /* navigation */
 go:i=>{V=i;Q="";ANIM=true;resetPages();render();scrollTo(0,0)},tab:i=>{TAB=i;Q="";ANIM=true;render()},set:i=>{SET=i;ANIM=false;render()},
 nav:()=>{const s=$(".shell");if(!s)return;if(innerWidth<=900)s.classList.toggle("open");else{s.classList.toggle("sbm");CFG.sidebar=s.classList.contains("sbm")?"mini":"full";saveCfg()}},
 pop:i=>{const e=$("#"+i),was=!e.hidden;$$(".pop").forEach(p=>p.hidden=true);e.hidden=was},
 pal:palOpen,palgo:palGo,
 per:i=>{P=+i;ANIM=false;render()},ift:i=>{IT=i;resetPages();ANIM=false;render()},
 pinv:()=>{IS="Pending validation";IT="all";A.go("inventory")},plap:()=>{TAB="fin";ARCH=false;A.go("reports")},pmor:()=>{TAB="dead";ARCH=false;A.go("reports")},
 srch:i=>{const[v,q]=i.split("|");A.go(v);Q=q;render()},
 cblk:()=>{A.go("map");whenReady(()=>setMode("draw","new"))},
 /* tables */
 sort:i=>{const[id,k]=i.split("|"),s=TS[id]??={k:null,d:1,p:1};if(s.k==k)s.d=-s.d;else{s.k=k;s.d=1}ANIM=false;render()},
 pg:i=>{const[id,p]=i.split("|");TS[id].p=+p;ANIM=false;render()},csv,print:()=>print(),
 /* session + account */
 out:()=>{U=null;sessSet(null);ANIM=true;render()},
 demo:i=>{const f=$("#lf");f.u.value=i;f.p.value=i+"123";f.p.focus()},
 eye:()=>{const p=$("#lf").p,s=p.type=="password";p.type=s?"text":"password";$(".pwf button").innerHTML=ic(s?"eye-off":"eye")},
 photo:()=>$("#pf").click(),photox:()=>{delete U.foto;save();render()},
 profsave:profSave,pwsave:pwSave,
 /* settings */
 cfg:i=>{const[k,v]=i.split("|");CFG[k]=/^\d+$/.test(v)?+v:v;saveCfg();applyCfg();onCfg(k);ANIM=false;render()},
 theme2:()=>{const dark=CFG.theme=="dark"||CFG.theme=="system"&&matchMedia("(prefers-color-scheme:dark)").matches;CFG.theme=dark?"light":"dark";saveCfg();applyCfg();ANIM=false;render()},
 bkp:exportData,bkr:()=>$("#bf").click(),exp:i=>{const[n,h,r]=EXP[i]();download(`sengonis-${n}-${today()}.csv`,toCSV(h,r),"text/csv");toast("Exported "+r.length+" rows")},
 logc:()=>ask("Clear the whole audit trail? This cannot be undone.",()=>{S.log=[]},"Clear",1),
 wxc:()=>{try{localStorage.removeItem("sengonis_wx")}catch(e){}WX=null;wxLoad(true);toast("Weather cache cleared")},
 rst:()=>ask("Reset everything to the demo data? This erases the plants, transactions, reports and users saved in this browser.",()=>{try{localStorage.removeItem(K)}catch(e){}load();ERR="";U=null;sessSet(null);ANIM=true},"Reset",1),
 /* plants */
 pa:()=>form("Add plant",PF,{tgl:today(),tinggi:0,dia:0,blok:blocks()[0]||1,st:"Seedling"},d=>{S.tan.push({id:nid(S.tan),...d,blok:d.blok,...autoSpot(d.blok)});done()}),
 pe:i=>{const t=byId(S.tan,i);form("Edit plant "+i,PF,t,d=>{const ob=t.blok;Object.assign(t,d);if(t.blok!=ob){delete t.lng;delete t.lat;Object.assign(t,autoSpot(t.blok))}done()})},pd:i=>ask("Delete this plant record?",()=>S.tan=S.tan.filter(t=>t.id!=i),"Delete",1),
 /* transactions */
 fa:()=>form("Add transaction",FF,{tgl:today(),jenis:"Operations",nominal:0,bayar:"Paid"},d=>{S.fin.push({id:nid(S.fin),...d,status:"Pending validation"});done()}),
 fe:i=>{const f=byId(S.fin,i);form("Edit transaction",FF,f,d=>{Object.assign(f,d);done()})},fv:i=>ask("Validate this transaction?",()=>byId(S.fin,i).status="Validated","Validate"),fr:i=>ask("Reject this transaction?",()=>byId(S.fin,i).status="Rejected","Reject",1),
 /* reports */
 la:()=>{const ym=today().slice(0,7),[a,b]=sums(ym);form("New financial report",LF,{periode:ym,masuk:a,keluar:b},d=>{S.lap.push({id:nid(S.lap),...d,status:"Draft",arsip:false});done()})},
 le:i=>{const l=byId(S.lap,i);form("Edit financial report",LF,l,d=>{Object.assign(l,d);done()})},lv:i=>ask("Verify this report?",()=>byId(S.lap,i).status="Verified","Verify"),lz:i=>ask("Archive this report?",()=>byId(S.lap,i).arsip=true,"Archive"),
 da:()=>form("New mortality report",dF(),{tgl:today(),tid:S.tan[0]?S.tan[0].id:1,jumlah:1,penyebab:CAUSES[0]},d=>{S.dead.push({id:nid(S.dead),...d,tid:+d.tid,status:"Draft",arsip:false});done()}),
 de:i=>{const x=byId(S.dead,i);form("Edit mortality report",dF(),x,d=>{Object.assign(x,d,{tid:+d.tid});done()})},dv:i=>ask("Verify this report?",()=>byId(S.dead,i).status="Verified","Verify"),dz:i=>ask("Archive this report?",()=>byId(S.dead,i).arsip=true,"Archive"),
 /* users */
 ua:()=>form("Add field officer",UF(0),{},d=>{if(S.users.some(u=>u.username==d.username))return $(".err").textContent="That username is taken.";S.users.push({id:nid(S.users),role:"Field Officer",...d,aktif:true});done()}),
 ue:i=>{const u=byId(S.users,i);form("Edit user",UF(1),{...u,aktif:u.aktif?"1":"0"},d=>{if(S.users.some(x=>x.id!=u.id&&x.username==d.username))return $(".err").textContent="That username is taken.";Object.assign(u,d,{aktif:d.aktif=="1"});done()})},ud:i=>ask("Deactivate this account?",()=>byId(S.users,i).aktif=false,"Deactivate",1),ur:i=>ask("Reactivate this account?",()=>byId(S.users,i).aktif=true,"Reactivate")};
const ST={P:v=>P=+v,FB:v=>FB=v,PS:v=>PS=v,IS:v=>IS=v,ARCH:v=>ARCH=v,RF:v=>RF=v,RT:v=>RT=v};

/* ---- global listeners ---- */
document.addEventListener("click",e=>{
 if(e.target.matches(".mb")){closeAll();return}
 if(!e.target.closest(".pop,[data-a=pop]"))$$(".pop").forEach(p=>p.hidden=true);
 const b=e.target.closest("[data-a]");if(b&&A[b.dataset.a]){LAST={a:b.dataset.a,i:b.dataset.i};A[b.dataset.a](b.dataset.i)}});
document.addEventListener("input",e=>{if(e.target.dataset.q!=null){Q=e.target.value;resetPages();render();const el=$("[data-q]");if(el){el.focus();el.setSelectionRange(Q.length,Q.length)}}});
function setPhoto(f){if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(im.width,im.height),c=document.createElement("canvas");c.width=c.height=256;c.getContext("2d").drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);U.foto=c.toDataURL("image/jpeg",.85);save();render();toast("Photo updated")};im.src=r.result};r.readAsDataURL(f)}
document.addEventListener("change",e=>{const t=e.target;if(t.id=="pf")return setPhoto(t.files[0]);if(t.id=="bf"){importData(t.files[0]);t.value="";return}
 const c=t.dataset.c;if(c){let v=t.type=="checkbox"?t.checked:t.value;if(t.dataset.n){v=Number(v);if(!isFinite(v)||v<0){toast("Enter a number of 0 or more.","bad");return render()}}
  if(c=="plantName"&&!String(v).trim())v=DEF.plantName;CFG[c]=typeof v=="string"?v.trim():v;saveCfg();applyCfg();onCfg(c);ANIM=false;render();toast("Setting saved");return}
 const s=t.dataset.s;if(s){ST[s](t.type=="checkbox"?t.checked:t.value);resetPages();ANIM=false;render()}});
/* shortcuts: Ctrl/Cmd+K or "/" opens search; "g" then h/p/m/i/r/s jumps to a page */
let GK=0;
document.addEventListener("keydown",e=>{if(!U)return;const typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)||$("#m").innerHTML;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=="k"){e.preventDefault();PAL?palClose():palOpen();return}
 if(e.key=="Escape"){if(PAL)palClose();$$(".pop").forEach(p=>p.hidden=true);return}
 if(typing||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key=="/"){e.preventDefault();palOpen();return}
 if(e.key.toLowerCase()=="g"){GK=Date.now();return}
 if(Date.now()-GK<900){const m={h:"home",p:"plants",m:"map",i:"inventory",r:"reports",s:"settings",u:"users"}[e.key.toLowerCase()];if(m&&NAVS().some(t=>t[0]==m)){GK=0;A.go(m)}}});
