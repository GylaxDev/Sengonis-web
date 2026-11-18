/* Random Forest regression: bagged trees, random feature subsets, MSE splits */
function grow(X,y,idx,d,r){const m=idx.reduce((a,i)=>a+y[i],0)/idx.length;if(d==0||idx.length<4)return{v:m};let best=null;
 const sse=a=>{const mu=a.reduce((s,i)=>s+y[i],0)/a.length;return a.reduce((s,i)=>s+(y[i]-mu)**2,0)};
 for(const f of [0,1,2,3].sort(()=>r()-.5).slice(0,2)){const vs=[...new Set(idx.map(i=>X[i][f]))].sort((a,b)=>a-b);
  for(let k=1;k<vs.length;k++){const t=(vs[k-1]+vs[k])/2,L=idx.filter(i=>X[i][f]<=t),R=idx.filter(i=>X[i][f]>t);if(L.length<2||R.length<2)continue;const c=sse(L)+sse(R);if(!best||c<best.c)best={c,f,t,L,R}}}
 return best?{f:best.f,t:best.t,l:grow(X,y,best.L,d-1,r),r:grow(X,y,best.R,d-1,r)}:{v:m}}
const walk=(n,x)=>n.v!==undefined?n.v:walk(x[n.f]<=n.t?n.l:n.r,x);
function monthly(){const ms={},add=(m,k,v)=>{(ms[m]??={m,deaths:0,exp:0,inc:0})[k]+=v};
 S.fin.filter(f=>f.status=="Validated").forEach(f=>add(f.tgl.slice(0,7),f.jenis=="Sale"?"inc":"exp",f.nominal));S.dead.forEach(d=>add(d.tgl.slice(0,7),"deaths",d.jumlah));
 return Object.values(ms).sort((a,b)=>a.m<b.m?-1:1)}
/* loss = cash shortfall + cost per dead tree (Settings → Plantation → Loss per dead tree) */
const loss=m=>Math.max(0,m.exp-m.inc)+m.deaths*CFG.loss;
function predict(){const ms=monthly();if(ms.length<7)return null;const ft=(m,i)=>[m.deaths,m.exp/1e6,m.inc/1e6,ms[i-1]?ms[i-1].deaths:0];
 const X=ms.slice(0,-1).map(ft),y=ms.slice(1).map(loss),r=rng(7);let s=0;
 for(let t=0;t<30;t++){const idx=Array.from({length:X.length},()=>Math.floor(r()*X.length));s+=walk(grow(X,y,idx,3,r),ft(ms[ms.length-1],ms.length-1))}return s/30}
