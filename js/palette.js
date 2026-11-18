/* Command palette (Ctrl/Cmd+K or "/"): jump to pages, plants and transactions, or run common actions */
let PAL=null;
function palItems(q){q=q.toLowerCase().trim();const L=[];
 NAVS().forEach(t=>L.push({t:"Go to "+t[1],s:"Page",i:t[2],a:"go",d:t[0],k:t[1]}));
 CRE().forEach(c=>L.push({t:c[2],s:"Create",i:c[1],a:c[0],k:c[3]}));
 L.push({t:"Toggle dark mode",s:"Action",i:"moon",a:"theme2"},{t:"Download backup",s:"Action",i:"download",a:"bkp"},{t:"Sign out",s:"Action",i:"log-out",a:"out"});
 if(q.length>=1){S.tan.forEach(t=>L.push({t:"Plant #"+t.id,s:`Block ${t.blok} · ${t.st}`,i:"sprout",a:"loc",d:t.id,k:"tree plant "+t.id+" "+t.st}));
  S.fin.forEach(f=>L.push({t:`${f.jenis} · ${fmt(f.nominal)}`,s:`${dt(f.tgl)} · ${f.status}`,i:"receipt",a:"srch",d:"inventory|"+f.tgl,k:"transaction "+f.bayar}));
  S.lap.forEach(l=>L.push({t:"Financial report "+mon(l.periode),s:l.status,i:"file-text",a:"srch",d:"reports|",k:"report"}))}
 return(q?L.filter(x=>(x.t+" "+x.s+" "+(x.k||"")).toLowerCase().includes(q)):L.slice(0,9)).slice(0,10)}
function palOpen(){if(!U)return;$("#m").innerHTML="";$$(".pop").forEach(p=>p.hidden=true);PAL={q:"",i:0,items:palItems("")};
 $("#pal").innerHTML=`<div class="mb top"><div class="pal" role="dialog" aria-modal="true" aria-label="Search"><div class="pin">${ic("search")}<input id="pq" placeholder="Search plants, transactions, pages or actions" autocomplete="off" aria-label="Search"><kbd>Esc</kbd></div><div class="pl" id="pl"></div><div class="pf"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span></div></div></div>`;palPaint();$("#pq").focus();
 $("#pq").oninput=e=>{PAL.q=e.target.value;PAL.i=0;PAL.items=palItems(PAL.q);palPaint()};
 $("#pq").onkeydown=e=>{const n=PAL.items.length;if(e.key=="ArrowDown"){e.preventDefault();PAL.i=(PAL.i+1)%Math.max(1,n);palPaint()}else if(e.key=="ArrowUp"){e.preventDefault();PAL.i=(PAL.i-1+n)%Math.max(1,n);palPaint()}else if(e.key=="Enter"){e.preventDefault();palGo(PAL.i)}else if(e.key=="Escape"){e.stopPropagation();palClose()}}}
const palClose=()=>{$("#pal").innerHTML="";PAL=null};
function palPaint(){$("#pl").innerHTML=PAL.items.map((x,i)=>`<button class="pi${i==PAL.i?" on":""}" data-a="palgo" data-i="${i}"><span class="dot">${ic(x.i)}</span><span class="t"><b style="font-weight:500">${esc(x.t)}</b><small>${esc(x.s)}</small></span>${i==PAL.i?"<em>Enter</em>":""}</button>`).join("")||`<div class="empty">${ic("search-x")}<b>No results</b><span>Try a plant number, an amount or a page name.</span></div>`;
 const on=$("#pl .on");if(on)on.scrollIntoView({block:"nearest"})}
function palGo(i){const x=PAL&&PAL.items[i];if(!x)return;palClose();LAST={a:x.a,i:x.d};A[x.a](x.d)}
