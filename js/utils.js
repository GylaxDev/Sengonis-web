/* small helpers shared by every module */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],K="sengonis_v1";
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=n=>"Rp "+Math.round(n).toLocaleString("id-ID");
/* compact money for stat tiles: Rp 12.4M */
const fmtc=n=>{const a=Math.abs(n),s=n<0?"-":"";return a>=1e9?s+"Rp "+(a/1e9).toFixed(1)+"B":a>=1e6?s+"Rp "+(a/1e6).toFixed(1)+"M":fmt(n)};
const nid=a=>Math.max(0,...a.map(x=>x.id))+1;
const rng=s=>()=>(s=(s*1664525+1013904223)%4294967296)/4294967296;
const p2=n=>String(n).padStart(2,"0"),MONS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const iso=d=>d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());
const mo=(n,d=15)=>{const x=new Date();x.setDate(d);x.setMonth(x.getMonth()-n);return iso(x)};
const today=()=>iso(new Date());
/* dates are stored as ISO (2026-11-18) and formatted on screen according to Settings → Date format */
const dt=s=>{if(!s)return"";const[y,m,d]=String(s).slice(0,10).split("-"),f=typeof CFG!="undefined"&&CFG.dateFmt;return f=="id"?`${d}/${m}/${y}`:f=="en"?`${+d} ${MONS[m-1]} ${y}`:String(s).slice(0,10)};
const mon=ym=>{const[y,m]=ym.split("-");return typeof CFG!="undefined"&&CFG.dateFmt=="iso"?ym:MONS[m-1]+" "+y};
const ago=t=>{const s=(Date.now()-new Date(t))/1e3;return s<60?"just now":s<3600?Math.floor(s/60)+" min ago":s<86400?Math.floor(s/3600)+" h ago":s<604800?Math.floor(s/86400)+" d ago":new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short"})};
const monthsOld=s=>Math.max(0,Math.round((Date.now()-new Date(s))/2629800000));
const age=m=>m<12?m+" mo":(m/12).toFixed(1).replace(/\.0$/,"")+" yr";
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const csvq=v=>{v=String(v??"");return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const toCSV=(head,rows)=>"﻿"+[head,...rows].map(r=>r.map(csvq).join(",")).join("\n");
