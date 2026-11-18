let S,U=null,V="home",P=6,TAB="fin",ARCH=false,FB="all",ERR="",ANIM=true,Q="",RF="",RT="",LAST=null,SET="profile",IT="all",IS="all",PS="all";

/* ---------- settings ---------- */
const CK="sengonis_settings",SK="sengonis_session";
let CFG={...DEF};
try{const j=JSON.parse(localStorage.getItem(CK));if(j)Object.assign(CFG,j);else{const o=localStorage.getItem("sengonis_theme");if(o)CFG.theme=o}}catch(e){}
P=CFG.period;
function saveCfg(){try{localStorage.setItem(CK,JSON.stringify(CFG))}catch(e){}}
function applyCfg(){const h=document.documentElement;CFG.theme=="system"?h.removeAttribute("data-theme"):h.dataset.theme=CFG.theme;h.dataset.accent=CFG.accent;h.dataset.density=CFG.density;h.dataset.fs=CFG.fs;h.dataset.motion=CFG.motion?"on":"off";
 const m=document.querySelector('meta[name=theme-color]');if(m)m.content=(CFG.theme=="dark"||CFG.theme=="system"&&matchMedia("(prefers-color-scheme:dark)").matches)?"#131312":"#ffffff"}

/* ---------- sign-in session (stay signed in = localStorage, otherwise this tab only) ---------- */
function sessGet(){try{return JSON.parse(localStorage.getItem(SK)||sessionStorage.getItem(SK))}catch(e){return null}}
function sessSet(u){try{localStorage.removeItem(SK);sessionStorage.removeItem(SK);if(u)(CFG.keep?localStorage:sessionStorage).setItem(SK,JSON.stringify({id:u.id}))}catch(e){}}

/* ---------- data ---------- */
function seed(){const r=rng(11),pk=a=>a[Math.floor(r()*a.length)];
 const users=[{id:1,role:"Owner",nama:"Bu Siti",username:"owner",password:"owner123",telp:"081234567890",aktif:true},{id:2,role:"Field Officer",nama:"Andi Pratama",username:"officer",password:"officer123",telp:"081298765432",aktif:true}];
 const tan=[];for(let i=1;i<=36;i++){const st=pk(["Seedling","Growing","Growing","Mature","Dead"]),age={Seedling:2,Growing:8,Mature:14,Dead:6}[st];tan.push({id:i,tgl:mo(age),tinggi:+(age*.5+r()).toFixed(1),dia:+(age*.9+r()*2).toFixed(1),blok:1+i%4,st})}
 const fin=[],dead=[],lap=[];let n=0;
 for(let k=11;k>=0;k--){const ok=k>0?"Validated":"Pending validation";
  fin.push({id:++n,tgl:mo(k,5),jenis:"Seedling purchase",nominal:Math.round((k%3?1.2:6)*1e6+r()*1e6),bayar:"Paid",status:"Validated"});
  fin.push({id:++n,tgl:mo(k,12),jenis:"Operations",nominal:Math.round(1.5e6+r()*2e6),bayar:"Paid",status:ok});
  if(k%2==0||k==1)fin.push({id:++n,tgl:mo(k,20),jenis:"Sale",nominal:Math.round(3e6+r()*5e6),bayar:pk(["Paid","Paid","Unpaid"]),status:k>0?"Validated":"Pending validation"});
  dead.push({id:12-k,tgl:mo(k,18),tid:1+Math.floor(r()*36),jumlah:1+Math.floor(r()*7),penyebab:pk(CAUSES),status:k>0?"Verified":"Draft",arsip:k>9})}
 return{users,tan,fin,dead,lap}}
function sums(ym){let a=0,b=0;S.fin.filter(f=>f.status=="Validated"&&f.tgl.startsWith(ym)).forEach(f=>f.jenis=="Sale"?a+=f.nominal:b+=f.nominal);return[a,b]}
function load(){try{const j=localStorage.getItem(K);if(j){S=JSON.parse(j);S.log=S.log||[];geoInit();return}}catch(e){}S=seed();S.log=[];for(let k=11;k>=0;k--){const ym=mo(k).slice(0,7),[a,b]=sums(ym);S.lap.push({id:12-k,periode:ym,masuk:a,keluar:b,status:k>0?"Verified":"Draft",arsip:k>9})}geoInit()}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function logx(x){if(U){S.log.unshift({t:new Date().toISOString(),u:U.nama,x});S.log.length=Math.min(S.log.length,300)}}
