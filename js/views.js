/* views: shell (sidebar, top bar), login, dashboard, plants, inventory, reports, users */
const own=()=>U.role=="Owner";
const av=u=>u.foto?`<img src="${u.foto}" alt="">`:esc(u.nama.split(" ").map(w=>w[0]).join("").slice(0,2));
const qm=a=>!Q||a.join(" ").toLowerCase().includes(Q.toLowerCase());
const fname=u=>{const n=u.nama.split(" ");return/^(bu|pak|ibu|bapak)$/i.test(n[0])&&n[1]?n[0]+" "+n[1]:n[0]};
let LUSER="";
const logo=()=>`<span class="logo">${ic("trees")}</span>`;
const btn=(a,i,t,c="")=>`<button class="btn sm ${c}" data-a="${a}" data-i="${i}">${ic(BI[t])}${t}</button>`;
const pill=s=>{const c=/Validated|Verified|Active|Mature|^Paid/.test(s)?"ok":/Rejected|Dead|Inactive/.test(s)?"no":/Pending|Draft|Unpaid/.test(s)?"wait":/Seedling/.test(s)?"inf":"";return`<span class="pill ${c}">${s}</span>`};
const blocks=()=>[...new Set([...S.geo.b.map(b=>b.n),...S.tan.map(t=>t.blok)])].sort((a,b)=>a-b);
const srch=ph=>`<span class="search">${ic("search")}<input data-q placeholder="${ph||"Search"}" value="${esc(Q)}" aria-label="Search"></span>`;
const sel=(v,k,opts)=>`<select data-s="${k}" aria-label="${k}">${opts.map(o=>{o=Array.isArray(o)?o:[o,o];return`<option value="${esc(o[0])}"${String(o[0])==String(v)?" selected":""}>${esc(o[1])}</option>`}).join("")}</select>`;
const head=(i,t,s,a="")=>`<div class="ph"><div><h1>${ic(i)}${t}</h1>${s?`<p>${s}</p>`:""}</div><div class="row">${a}</div></div>`;
const exportBtn=id=>`<button class="btn ghost" data-a="csv" data-i="${id}">${ic("download")}Export CSV</button>`;
const STG={Seedling:"var(--blue)",Growing:"var(--acc)",Mature:"#6d5d3f",Dead:"var(--taupe)"};

/* pending work, used by sidebar badges, notifications and the dashboard */
const pend=()=>({f:S.fin.filter(f=>f.status=="Pending validation").length,l:S.lap.filter(l=>l.status=="Draft"&&!l.arsip).length,m:S.dead.filter(d=>d.status=="Draft"&&!d.arsip).length});
function notifs(){const p=pend(),L=[],s=n=>n>1?"s":"";
 if(p.f)L.push({i:"receipt",t:own()?`${p.f} transaction${s(p.f)} to validate`:`${p.f} transaction${s(p.f)} awaiting approval`,s:"Inventory",a:"pinv"});
 if(p.l)L.push({i:"file-text",t:own()?`${p.l} financial report${s(p.l)} to verify`:`${p.l} financial report draft${s(p.l)}`,s:"Reports",a:"plap"});
 if(p.m)L.push({i:"triangle-alert",t:own()?`${p.m} mortality report${s(p.m)} to verify`:`${p.m} mortality report draft${s(p.m)}`,s:"Reports",a:"pmor"});
 const w=wxOk();if(CFG.wxAlerts&&w){const[t,lv]=wxAdvice(w);if(lv)L.push({i:lv>1?"cloud-lightning":"cloud-rain",c:lv>1?"bad":"warn",t:"Weather alert",s:t,a:"go",d:"home"})}
 return L}
/* art for banners: soft yellow / blue-grey / taupe circles, like Kaggle's hero artwork */
const art=()=>`<svg class="art" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="blr" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter></defs><rect width="600" height="400" fill="var(--artbg)"/><g filter="url(#blr)"><circle cx="140" cy="270" r="150" fill="var(--acc)"/><circle cx="340" cy="140" r="170" fill="var(--acc)" opacity=".92"/><circle cx="470" cy="310" r="140" fill="var(--blue)"/><circle cx="580" cy="110" r="110" fill="var(--acc)"/><circle cx="290" cy="380" r="110" fill="var(--taupe)"/></g><g fill="none" stroke="#fffaf0" stroke-width="2" opacity=".95"><circle cx="340" cy="210" r="150"/><circle cx="165" cy="310" r="115" stroke-dasharray="5 7"/><path d="M30 370C170 130 330 80 470 70"/></g><g fill="#fffaf0"><circle cx="470" cy="70" r="6"/><circle cx="30" cy="370" r="6"/></g></svg>`;

/* ---------- dashboard ---------- */
function home(){const all=monthly(),ms=all.slice(-P),lb=ms.map(m=>m.m),live=S.tan.filter(t=>t.st!="Dead"),pop=live.length,net=ms.reduce((a,m)=>a+m.inc-m.exp,0),dth=ms.reduce((a,m)=>a+m.deaths,0),pr=predict(),B=blocks();
 const cs={};S.dead.forEach(d=>cs[d.penyebab]=(cs[d.penyebab]||0)+d.jumlah);const top=Object.entries(cs).sort((a,b)=>b[1]-a[1])[0];
 const maxb=Math.max(1,...B.map(b=>S.tan.filter(x=>x.blok==b).length)),h=new Date().getHours(),g=h<11?"Good morning":h<15?"Good afternoon":h<19?"Good evening":"Good night",p=pend(),np=p.f+p.l+p.m;
 const stage=STAT.map(s=>[s,S.tan.filter(t=>t.st==s).length]),tot=Math.max(1,S.tan.length);
 const mine=own()?S.log:S.log.filter(l=>l.u==U.nama);
 return`<section class="hero"><div class="hc"><p class="eye">${esc(CFG.plantName)} is for forest keepers</p><h1>${g}, ${esc(fname(U))}</h1><p class="sub">Every sengon tree, every rupiah and every risk, from seedling to harvest, in one place.</p><div class="row"><button class="btn" data-a="pa">${ic("plus")}Add plant</button><button class="btn ghost" data-a="go" data-i="map">${ic("map")}Open the map</button></div></div><div class="hart">${art()}</div></section>
 <div class="gs"><div class="stat"><span class="l">Living trees</span><b>${pop}</b><span class="s">${Math.round(pop/tot*100)}% of ${S.tan.length} planted survive</span><i class="tic">${ic("sprout")}</i></div>
 <div class="stat"><span class="l">Net cash flow · ${P} mo</span><b class="${net<0?"neg":"pos"}" title="${fmt(net)}">${fmtc(net)}</b><span class="s">Validated transactions only</span><i class="tic">${ic("trend")}</i></div>
 <div class="stat"><span class="l">Trees lost · ${P} mo</span><b>${dth}</b><span class="s">${top?"Most common cause: "+top[0]:"No losses recorded"}</span><i class="tic">${ic("alert")}</i></div>
 <div class="stat"><span class="l">Predicted loss · next mo</span><b title="${pr==null?"":fmt(pr)}">${pr==null?"Not enough data":fmtc(pr)}</b><span class="s">${pr==null?"Needs 7+ months of validated data.":`Random Forest · last month ${fmtc(loss(all[all.length-1]))}`}</span><i class="tic">${ic("spark")}</i></div></div>
 <div class="g2"><div class="col"><section class="card"><div class="ch-h"><h2>Data trends</h2><div class="seg" role="group" aria-label="Period">${[3,6,12].map(n=>`<button data-a="per" data-i="${n}" aria-pressed="${n==P}">${n} mo</button>`).join("")}</div></div>
 <p class="sub-t">Net cash flow</p>${bars(ms.map(m=>m.inc-m.exp),lb,fmt)}<p class="sub-t" style="margin-top:22px">Tree deaths</p>${bars(ms.map(m=>m.deaths),lb,x=>x+" trees")}</section>
 <section class="card"><div class="ch-h"><h2>Plantation by block<small>Living trees out of total planted</small></h2></div>
 <div class="stk" role="img" aria-label="Growth stage mix">${stage.map(([s,n])=>n?`<i style="flex:${n};background:${STG[s]}" title="${s}: ${n}"></i>`:"").join("")}</div><div class="lgd" style="margin:10px 0 18px">${stage.map(([s,n])=>`<span><i style="background:${STG[s]}"></i>${s} ${n}</span>`).join("")}</div>
 ${B.map(b=>{const t=S.tan.filter(x=>x.blok==b),l=t.filter(x=>x.st!="Dead"),hh=l.length?(l.reduce((a,x)=>a+x.tinggi,0)/l.length).toFixed(1):"0";return`<div class="hz"><span>Block ${b} · ${hh} m</span><div class="t"><i style="width:${l.length/maxb*100}%"></i></div><span>${l.length}/${t.length}</span></div>`}).join("")}<small class="mut">Average height shown is for living trees.</small></section></div>
 <div class="col"><section class="card wx" data-wx>${wxInner()}</section>
 <section class="card"><div class="ch-h"><h2>${own()?"Needs your review":"Waiting for the owner"}</h2></div>${np?[["pinv","receipt",p.f,"transaction"],["plap","file-text",p.l,"financial report"],["pmor","triangle-alert",p.m,"mortality report"]].filter(x=>x[2]).map(x=>`<button class="li" data-a="${x[0]}"><span class="dot">${ic(x[1])}</span><div><b>${x[2]} ${x[3]}${x[2]>1?"s":""}</b><small>${own()?"Ready to validate":"Pending approval"}</small></div><span class="go">${ic("chevron-right")}</span></button>`).join(""):`<div class="ok-note">${ic("circle-check")}All caught up. Nothing is waiting.</div>`}</section>
 <section class="card"><div class="ch-h"><h2>Recent activity</h2></div>${mine.slice(0,5).map(l=>`<div class="li"><span class="dot">${ic("history")}</span><div>${esc(l.x)}<small>${own()?esc(l.u)+" · ":""}${ago(l.t)}</small></div></div>`).join("")||`<p class="mut" style="margin:0">Nothing yet. Changes you make will appear here.</p>`}</section></div></div>`}

/* ---------- plants ---------- */
function plants(){const rows=S.tan.filter(t=>(FB=="all"||t.blok==FB)&&(PS=="all"||t.st==PS)&&qm([t.id,t.tgl,t.st,"block "+t.blok]));
 const cols=[{k:"id",l:"ID",v:t=>t.id,h:t=>`<b>#${t.id}</b>`},{k:"tgl",l:"Planted",h:t=>dt(t.tgl)},{k:"age",l:"Age",v:t=>monthsOld(t.tgl),h:t=>age(monthsOld(t.tgl))},{k:"tinggi",l:"Height (m)",v:t=>+t.tinggi,r:1},{k:"dia",l:"Diameter (cm)",v:t=>+t.dia,r:1},{k:"blok",l:"Block",v:t=>t.blok,h:t=>"Block "+t.blok},{k:"st",l:"Growth status",h:t=>pill(t.st)}];
 return head("sprout","Plants",`${S.tan.filter(t=>t.st!="Dead").length} living of ${S.tan.length} recorded trees.`,`<button class="btn" data-a="pa">${ic("plus")}Add plant</button>`)+
 `<div class="tools"><div class="row">${srch("Search plants")}${sel(FB,"FB",[["all","All blocks"],...blocks().map(b=>[b,"Block "+b])])}${sel(PS,"PS",[["all","All statuses"],...STAT])}</div><div class="row">${exportBtn("plants")}</div></div>`+
 table("plants",cols,rows,{name:"plants",icon:"sprout",empty:"No plants match.",act:t=>`${t.lng!=null?btn("loc",t.id,"Locate","ghost"):""}${btn("pe",t.id,"Edit","ghost")}${btn("pd",t.id,"Delete","ghost")}`})}

/* ---------- inventory (transactions) ---------- */
function inventory(){const v=S.fin.filter(f=>f.status=="Validated"),inc=v.filter(f=>f.jenis=="Sale").reduce((a,f)=>a+f.nominal,0),exp=v.reduce((a,f)=>a+(f.jenis=="Sale"?0:f.nominal),0),pend$=S.fin.filter(f=>f.status=="Pending validation").reduce((a,f)=>a+f.nominal,0),unpaid=S.fin.filter(f=>f.jenis=="Sale"&&f.bayar=="Unpaid"&&f.status!="Rejected").reduce((a,f)=>a+f.nominal,0);
 const rows=S.fin.filter(f=>(IT=="all"||f.jenis==IT)&&(IS=="all"||f.status==IS)&&qm([f.tgl,f.jenis,f.bayar,f.status,f.nominal]));
 const cols=[{k:"tgl",l:"Date",h:f=>dt(f.tgl)},{k:"jenis",l:"Type"},{k:"nominal",l:"Amount",v:f=>f.nominal,h:f=>fmt(f.nominal),r:1},{k:"bayar",l:"Payment",h:f=>pill(f.bayar)},{k:"status",l:"Status",h:f=>pill(f.status)}];
 const ci=[["all","All transactions","list"],["Seedling purchase","Seedling purchases","sprout"],["Operations","Operations","wrench"],["Sale","Sales","banknote"]];
 return head("box","Inventory","Seedling purchases, operating costs and sales. Field officers enter drafts; the owner validates them.",own()?"":`<button class="btn" data-a="fa">${ic("plus")}Add transaction</button>`)+
 `<div class="gs"><div class="stat"><span class="l">Validated income</span><b class="pos">${fmtc(inc)}</b><i class="tic">${ic("banknote")}</i></div><div class="stat"><span class="l">Validated expenses</span><b>${fmtc(exp)}</b><i class="tic">${ic("wallet")}</i></div><div class="stat"><span class="l">Pending validation</span><b>${fmtc(pend$)}</b><i class="tic">${ic("clock")}</i></div><div class="stat"><span class="l">Unpaid sales</span><b>${fmtc(unpaid)}</b><i class="tic">${ic("hourglass")}</i></div></div>
 <div class="cats">${ci.map(c=>{const n=S.fin.filter(f=>c[0]=="all"||f.jenis==c[0]);return`<button class="cat" data-a="ift" data-i="${c[0]}" aria-pressed="${IT==c[0]}"><span><b>${c[1]}</b><small>${n.length} entries</small></span>${ic(c[2])}</button>`}).join("")}</div>
 <div class="tools"><div class="row">${srch("Search transactions")}${sel(IS,"IS",[["all","All statuses"],"Pending validation","Validated","Rejected"])}</div><div class="row">${exportBtn("inventory")}</div></div>`+
 table("inventory",cols,rows,{name:"transactions",icon:"receipt",empty:"No transactions match.",act:f=>{const p=f.status=="Pending validation";return`${own()&&p?btn("fv",f.id,"Validate")+btn("fr",f.id,"Reject","ghost"):""}${!own()&&p?btn("fe",f.id,"Edit","ghost"):""}`}})}

/* ---------- reports ---------- */
function reports(){const tabs=[["fin","Financial reports","wallet"],["dead","Mortality reports","triangle-alert"],...(own()?[["log","Audit trail","history"]]:[])];
 const ar=`<label class="row" style="gap:8px;font-size:.9rem;cursor:pointer"><span class="sw"><input type="checkbox" data-s="ARCH"${ARCH?" checked":""}><span></span></span>Show archived</label>`;let body,prt=`<button class="btn ghost" data-a="print">${ic("printer")}Print</button>`;
 if(TAB=="log"&&own()){body=`<div class="tools"><p class="mut" style="margin:0">Who changed what, newest first (last 300 actions).</p><div class="row">${exportBtn("log")}</div></div>`+table("log",[{k:"t",l:"Time",h:l=>new Date(l.t).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})},{k:"u",l:"User"},{k:"x",l:"Action"}],S.log,{name:"audit-trail",icon:"history",empty:"No activity recorded yet."})}
 else if(TAB=="fin"){const rows=S.lap.filter(l=>!!l.arsip==ARCH&&(!RF||l.periode>=RF)&&(!RT||l.periode<=RT));
  body=`<div class="tools"><div class="row">${ar}<label class="fld" style="grid-auto-flow:column;align-items:center;gap:8px">From<input type="month" data-s="RF" value="${RF}"></label><label class="fld" style="grid-auto-flow:column;align-items:center;gap:8px">To<input type="month" data-s="RT" value="${RT}"></label></div><div class="row">${prt}${exportBtn("fin")}${own()?"":`<button class="btn" data-a="la">${ic("plus")}New report</button>`}</div></div>`+
  table("fin",[{k:"periode",l:"Period",v:l=>l.periode,h:l=>mon(l.periode)},{k:"masuk",l:"Income",v:l=>l.masuk,h:l=>fmt(l.masuk),r:1},{k:"keluar",l:"Expenses",v:l=>l.keluar,h:l=>fmt(l.keluar),r:1},{k:"net",l:"Net",v:l=>l.masuk-l.keluar,h:l=>`<span class="${l.masuk<l.keluar?"neg":"pos"}">${fmt(l.masuk-l.keluar)}</span>`,r:1},{k:"status",l:"Status",h:l=>pill(l.status)}],rows,{name:"financial-reports",icon:"file-text",empty:"No financial reports in this range.",act:l=>`${l.status=="Draft"?btn("le",l.id,"Edit","ghost")+(own()?btn("lv",l.id,"Verify"):""):""}${own()&&l.status=="Verified"&&!l.arsip?btn("lz",l.id,"Archive","ghost"):""}`})}
 else{const cs={};S.dead.forEach(d=>cs[d.penyebab]=(cs[d.penyebab]||0)+d.jumlah);const mx=Math.max(1,...Object.values(cs)),rows=S.dead.filter(d=>!!d.arsip==ARCH);
  body=`<section class="card"><div class="ch-h"><h2>Causes of death<small>Trees lost, all reports</small></h2></div>${Object.entries(cs).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="hz"><span>${k}</span><div class="t"><i style="width:${v/mx*100}%"></i></div><span>${v}</span></div>`).join("")||`<p class="mut" style="margin:0">No deaths recorded.</p>`}</section><div class="tools"><div class="row">${ar}</div><div class="row">${prt}${exportBtn("dead")}${own()?"":`<button class="btn" data-a="da">${ic("plus")}New report</button>`}</div></div>`+
  table("dead",[{k:"tgl",l:"Date",h:d=>dt(d.tgl)},{k:"tid",l:"Plant",v:d=>d.tid,h:d=>"Plant "+d.tid},{k:"jumlah",l:"Trees dead",v:d=>d.jumlah,r:1},{k:"penyebab",l:"Cause"},{k:"status",l:"Status",h:d=>pill(d.status)}],rows,{name:"mortality-reports",icon:"triangle-alert",empty:"No mortality reports.",act:d=>`${d.status=="Draft"?btn("de",d.id,"Edit","ghost")+(own()?btn("dv",d.id,"Verify"):""):""}${own()&&d.status=="Verified"&&!d.arsip?btn("dz",d.id,"Archive","ghost"):""}`})}
 return head("report","Reports","Monthly financial and mortality reports, verified by the owner.")+`<div class="row noprint">${tabs.map(t=>`<button class="chip" data-a="tab" data-i="${t[0]}" aria-pressed="${TAB==t[0]}">${ic(t[2])}${t[1]}</button>`).join("")}</div>`+body}

/* ---------- users ---------- */
function users(){return head("users","Users","Owners approve; field officers record. Deactivated accounts cannot sign in.",`<button class="btn" data-a="ua">${ic("user-plus")}Add field officer</button>`)+
 `<div class="tools"><div class="row">${srch("Search users")}</div><div class="row">${exportBtn("users")}</div></div>`+
 table("users",[{k:"nama",l:"Name",h:u=>`<span class="mini">${av(u)}</span>${esc(u.nama)}${u.id==U.id?' <span class="mut">(you)</span>':""}`},{k:"username",l:"Username"},{k:"role",l:"Role"},{k:"telp",l:"Phone"},{k:"aktif",l:"Status",v:u=>u.aktif?"Active":"Inactive",h:u=>pill(u.aktif?"Active":"Inactive")}],S.users.filter(u=>qm([u.nama,u.username,u.role,u.telp])),{name:"users",icon:"users",act:u=>`${btn("ue",u.id,"Edit","ghost")}${u.role!="Owner"&&u.aktif?btn("ud",u.id,"Deactivate","ghost"):""}${u.role!="Owner"&&!u.aktif?btn("ur",u.id,"Reactivate","ghost"):""}`})}

/* ---------- shell ---------- */
const NAVS=()=>[["home","Home","home"],["plants","Plants","sprout"],["map","Map","map"],["inventory","Inventory","box"],["reports","Reports","report"],...(own()?[["users","Users","users"]]:[]),["settings","Settings","settings"]];
const CRE=()=>[["pa","sprout","Add plant","Record a new tree"],...(own()?[["ua","user-plus","Add field officer","Create an account"],["cblk","square-dashed","Add block on map","Draw a boundary"]]:[["fa","receipt","Add transaction","Purchase, cost or sale"],["la","file-text","New financial report","Monthly summary"],["da","triangle-alert","New mortality report","Record lost trees"]])];
function sidebar(){const p=pend(),cnt={inventory:own()?p.f:0,reports:own()?p.l+p.m:0};
 return`<aside class="sb" aria-label="Main navigation"><div class="sbtop"><button class="ibtn plain" data-a="nav" aria-label="Toggle sidebar">${ic("menu")}</button><button class="brand" data-a="go" data-i="home" aria-label="Sengonis home">${logo()}<span class="wm">sengonis</span></button></div>
 <div class="create pw"><button class="btn" data-a="pop" data-i="p-c" aria-label="Create">${ic("plus")}<span class="lbl">Create</span></button><div class="pop createmenu" id="p-c" hidden>${CRE().map(c=>`<button class="pi" data-a="${c[0]}"><span class="dot">${ic(c[1])}</span><span><b style="font-weight:500">${c[2]}</b><small>${c[3]}</small></span></button>`).join("")}</div></div>
 <nav class="nav">${NAVS().map(t=>`${t[0]=="settings"?"<hr>":""}<button data-a="go" data-i="${t[0]}" title="${t[1]}"${V==t[0]?' aria-current="page"':""}>${ic(t[2])}<span class="lbl">${t[1]}</span>${cnt[t[0]]?`<span class="cnt">${cnt[t[0]]}</span>`:""}</button>`).join("")}</nav>
 <div class="sbfoot"><b>${esc(CFG.plantName)}</b><span>${S.tan.filter(t=>t.st!="Dead").length} living trees · ${S.geo.b.length} blocks</span></div></aside>`}
function bellInner(){const L=notifs();return`<button class="ibtn" data-a="pop" data-i="p-n" aria-label="Notifications">${ic("bell")}${L.length?`<span class="badge">${L.length}</span>`:""}</button><div class="pop" id="p-n" hidden><h4>NOTIFICATIONS</h4>${L.map(n=>`<button class="pi" data-a="${n.a}"${n.d?` data-i="${n.d}"`:""}><span class="dot ${n.c||""}">${ic(n.i)}</span><span><b style="font-weight:500">${n.t}</b><small>${n.s}</small></span></button>`).join("")||`<div class="empty">You're all caught up.</div>`}</div>`}
const paintBell=()=>{const e=$("#bell");if(e)e.innerHTML=bellInner()};
function topbar(){return`<header class="topbar"><button class="ibtn plain menubtn" data-a="nav" aria-label="Open menu">${ic("menu")}</button><button class="spill" data-a="pal" aria-label="Search">${ic("search")}<span>Search plants, transactions and pages</span><kbd>Ctrl K</kbd></button><div class="sp"></div>
 <button class="ibtn tm" data-a="theme2" aria-label="Toggle dark mode">${ic(document.documentElement.dataset.theme=="dark"||CFG.theme=="dark"?"sun":"moon")}</button><div class="pw" id="bell">${bellInner()}</div>
 <div class="pw"><button class="avbtn" data-a="pop" data-i="p-u" aria-label="Account">${av(U)}</button><div class="pop" id="p-u" hidden><div class="who"><span class="av">${av(U)}</span><div><b>${esc(U.nama)}</b><small>${U.role}</small></div></div><hr><button class="pi" data-a="go" data-i="settings">${ic("settings")}<span>Settings</span></button><button class="pi" data-a="pal">${ic("search")}<span>Search<small>Ctrl K</small></span></button><button class="pi" data-a="out">${ic("log-out")}<span>Sign out</span></button></div></div></header>`}

/* ---------- login ---------- */
function loginView(){const n=S.tan.filter(t=>t.st!="Dead").length;
 return`<div class="lg"><header class="lgh"><div class="brand" style="cursor:default">${logo()}<span class="wm">sengonis</span></div><button class="ibtn" data-a="theme2" aria-label="Toggle dark mode">${ic("moon")}</button></header>
 <div class="lgb"><div class="lgt"><p class="eye">Sengonis is for Forest Keepers</p><h1>Growing what lasts, one sengon at a time</h1><p class="sub">Track every tree, every rupiah and every risk across your plantation, with a live 3D map and forecasts that help you act early.</p></div>
 <div class="lgart"><form id="lf" class="card lform" novalidate><h2>Sign in</h2><label class="fld">Username<input name="u" autocomplete="username" autocapitalize="none" value="${esc(LUSER)}" autofocus></label><label class="fld">Password<span class="pwf"><input name="p" type="password" autocomplete="current-password"><button type="button" data-a="eye" aria-label="Show password">${ic("eye")}</button></span></label><p class="err" role="alert">${esc(ERR)}</p><button class="btn" style="width:100%;padding-block:13px">Sign in</button>
 <div class="demo"><span class="mut" style="font-size:.82rem;align-self:center">Demo:</span><button type="button" class="chip" data-a="demo" data-i="owner">${ic("shield-check")}Owner</button><button type="button" class="chip" data-a="demo" data-i="officer">${ic("hard-hat")}Field officer</button></div>
 <button type="button" class="btn ghost sm" data-a="rst" style="justify-self:start">Forgot login? Reset demo data</button></form>
 <div class="lfloat"><div class="top"><span class="pill ok">Live</span><span>${esc(CFG.plantName)}</span></div><b>${n} living trees tracked</b><small class="mut">${S.geo.b.length} blocks · 3D map · weather</small></div></div></div></div>`}
function bindLogin(){$("#lf").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);LUSER=String(f.get("u")).trim();const u=S.users.find(x=>x.username==String(f.get("u")).trim()&&x.password==f.get("p"));
 if(!u)ERR="Username or password is incorrect.";else if(!u.aktif)ERR="This account is deactivated. Ask the owner to reactivate it.";else{U=u;ERR="";LUSER="";V=(CFG.landing=="users"&&!own())?"home":CFG.landing;sessSet(U);ANIM=true;ACT=Date.now();toast("Welcome back, "+fname(u))}render()}}

function render(){const app=$("#app");app.className=ANIM?"enter":"";ANIM=false;
 if(!U){app.innerHTML=loginView();bindLogin();return}
 if(V=="users"&&!own())V="home";
 const view={home,plants,inventory,reports,users,map:mapv,settings:settingsView}[V]();
 app.innerHTML=`<div class="shell${CFG.sidebar=="mini"?" sbm":""}">${sidebar()}<div class="scrim" data-a="nav"></div><div class="body">${topbar()}<main class="main" id="main"><div class="wrap">${view}</div></main></div></div>`;
 document.title=(NAVS().find(t=>t[0]==V)||[0,"Sengonis"])[1]+" · Sengonis";
 if(V=="map")mapMount();wxLoad()}
