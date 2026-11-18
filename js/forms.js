/* modal + toast helpers */
const closeAll=()=>{$("#m").innerHTML="";$("#pal").innerHTML="";PAL=null};
const close=()=>{$("#m").innerHTML=""};
function toast(msg,kind=""){const e=document.createElement("div");e.className="toast "+kind;e.innerHTML=ic(kind=="bad"?"circle-alert":"circle-check")+`<span>${esc(msg)}</span>`;$("#toasts").appendChild(e);setTimeout(()=>{e.style.transition="opacity .3s";e.style.opacity=0;setTimeout(()=>e.remove(),320)},2800)}
/* done(): save, write the audit trail from the last clicked action, close the dialog, redraw */
const done=msg=>{const l=LAST&&LBL[LAST.a];if(l&&U)logx(l+(LAST.i?" #"+LAST.i:""));save();close();render();toast(msg||(l?l:"Saved"))};
function ask(msg,fn,yes="Yes",danger){$("#m").innerHTML=`<div class="mb"><div class="mo" role="dialog" aria-modal="true"><h2>Please confirm</h2><p class="mut" style="margin:0">${msg}</p><div class="row"><button class="btn ghost" data-a="close">Cancel</button><button class="btn${danger?" danger":""}" id="yes">${yes}</button></div></div></div>`;$("#yes").focus();$("#yes").onclick=()=>{fn();done()}}
function form(title,F,v,ok){const m=$("#m");
 m.innerHTML=`<div class="mb"><form class="mo" novalidate role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh"><h2>${title}</h2><button type="button" class="ibtn plain" data-a="close" aria-label="Close">${ic("x")}</button></div>${F.map(f=>`<label class="fld">${f.l}${f.o?`<select name="${f.k}">${f.o.map(o=>{o=Array.isArray(o)?o:[o,o];return`<option value="${esc(o[0])}"${String(o[0])==String(v[f.k])?" selected":""}>${esc(o[1])}</option>`}).join("")}</select>`:`<input name="${f.k}" type="${f.t||"text"}"${f.t=="number"?' min="0" step="any" inputmode="decimal"':""}${f.ph?` placeholder="${esc(f.ph)}"`:""}${f.t=="password"?' autocomplete="new-password"':""} value="${esc(v[f.k])}">`}${f.hint?`<small>${f.hint}</small>`:""}</label>`).join("")}<p class="err"></p><div class="row"><button type="button" class="btn ghost" data-a="close">Cancel</button><button class="btn">Save</button></div></form></div>`;
 const err=t=>{m.querySelector(".err").textContent=t};const first=m.querySelector("input,select");if(first)first.focus();
 m.querySelector("form").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),d={};
  for(const f of F){let x=String(fd.get(f.k)??"").trim();if(!x)return err(f.l+" is required.");
   if(f.t=="number"){x=Number(x);if(!isFinite(x)||x<0||(f.int&&!Number.isInteger(x)))return err(f.l+(f.int?" must be a whole number of 0 or more.":" must be a number of 0 or more."))}
   if((f.t=="date"||f.t=="month")&&isNaN(Date.parse(x)))return err(f.l+" must be a valid date.");
   if(f.min&&String(x).length<f.min)return err(f.l+" must be at least "+f.min+" characters.");d[f.k]=x}
  ok(d)}}
const num=(k,l,int)=>({k,l,t:"number",int}),byId=(a,i)=>a.find(x=>x.id==i);
const PF=[{k:"tgl",l:"Planting date",t:"date"},num("tinggi","Height (m)"),num("dia","Diameter (cm)"),num("blok","Block",1),{k:"st",l:"Growth status",o:STAT}];
const FF=[{k:"tgl",l:"Transaction date",t:"date"},{k:"jenis",l:"Type",o:FT},num("nominal","Amount (Rp)"),{k:"bayar",l:"Payment",o:["Paid","Unpaid"]}];
const LF=[{k:"periode",l:"Period",t:"month"},num("masuk","Total income (Rp)"),num("keluar","Total expenses (Rp)")];
const dF=()=>[{k:"tgl",l:"Date of death",t:"date"},{k:"tid",l:"Plant",o:S.tan.map(t=>[t.id,"Plant "+t.id+", Block "+t.blok])},num("jumlah","Trees dead",1),{k:"penyebab",l:"Cause",o:CAUSES}];
const UF=a=>[{k:"nama",l:"Full name"},{k:"username",l:"Username"},{k:"password",l:"Password",t:"password",min:6,hint:"At least 6 characters."},{k:"telp",l:"Phone number"},...(a?[{k:"aktif",l:"Status",o:[["1","Active"],["0","Inactive"]]}]:[])];
document.addEventListener("keydown",e=>{if(e.key=="Escape"&&$("#m").innerHTML)close()});
