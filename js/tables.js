/* Generic data table: sortable headers, pagination (Settings → Rows per page), CSV export of the filtered rows.
   cols: {k, l, v?: row=>raw value (sort + CSV), h?: row=>html, r?: right-align, x?: row=>csv value}
   o: {name, act?: row=>html, empty?: text} */
const TB={},TS={};
function table(id,cols,rows,o={}){const s=TS[id]??={k:null,d:1,p:1};let r=rows.slice();
 if(s.k){const c=cols.find(c=>c.k==s.k);if(c){const g=c.v||(x=>x[c.k]);r.sort((a,b)=>{const x=g(a),y=g(b);return(typeof x=="number"&&typeof y=="number"?x-y:String(x).localeCompare(String(y),undefined,{numeric:true}))*s.d})}}
 TB[id]={cols,rows:r,name:o.name||id};
 const n=r.length,per=CFG.rows||n||1,pages=Math.max(1,Math.ceil(n/per));s.p=Math.min(Math.max(1,s.p),pages);
 const from=(s.p-1)*per,page=r.slice(from,from+per),cs=cols.length+(o.act?1:0);
 const th=c=>{const on=s.k==c.k;return`<th class="${c.r?"r":""}" aria-sort="${on?(s.d>0?"ascending":"descending"):"none"}"><button class="th${on?" on":""}" data-a="sort" data-i="${id}|${c.k}">${c.l}${ic(on?(s.d>0?"chevron-up":"chevron-down"):"chevrons-up-down")}</button></th>`};
 const body=page.map((x,i)=>`<tr style="--r:${Math.min(i,12)}">${cols.map(c=>`<td class="${c.r?"r":""}">${c.h?c.h(x):esc(c.v?c.v(x):x[c.k])}</td>`).join("")}${o.act?`<td class="a">${o.act(x)}</td>`:""}</tr>`).join("");
 const nums=()=>{const a=[];for(let i=1;i<=pages;i++)if(i==1||i==pages||Math.abs(i-s.p)<=1)a.push(i);return a.flatMap((x,i)=>a[i-1]&&x-a[i-1]>1?["…",x]:[x])};
 const pager=CFG.rows&&pages>1?`<div class="pg"><span>Showing ${from+1}–${Math.min(n,from+per)} of ${n}</span><div class="row"><button data-a="pg" data-i="${id}|${s.p-1}" aria-label="Previous page"${s.p<2?" disabled":""}>${ic("chevron-left")}</button>${nums().map(x=>x=="…"?`<span>…</span>`:`<button data-a="pg" data-i="${id}|${x}"${x==s.p?' aria-current="page"':""}>${x}</button>`).join("")}<button data-a="pg" data-i="${id}|${s.p+1}" aria-label="Next page"${s.p>=pages?" disabled":""}>${ic("chevron-right")}</button></div></div>`:n?`<div class="pg"><span>${n} row${n>1?"s":""}</span></div>`:"";
 return`<div class="tw"><div class="sc"><table><thead><tr>${cols.map(th).join("")}${o.act?'<th class="x"></th>':""}</tr></thead><tbody>${body||`<tr><td colspan="${cs}" style="padding:0"><div class="empty">${ic(o.icon||"inbox")}<b>${o.empty||"Nothing here yet."}</b><span>${Q||IS!="all"||IT!="all"||PS!="all"||FB!="all"?"Try clearing the search or filters.":""}</span></div></td></tr>`}</tbody></table></div>${pager}</div>`}
const resetPages=()=>Object.values(TS).forEach(s=>s.p=1);
function csv(id){const t=TB[id];if(!t||!t.rows.length)return toast("Nothing to export.","bad");
 download(`sengonis-${t.name}-${today()}.csv`,toCSV(t.cols.map(c=>c.l),t.rows.map(r=>t.cols.map(c=>(c.x||c.v||(x=>x[c.k]))(r)))),"text/csv");toast(`Exported ${t.rows.length} rows`)}
