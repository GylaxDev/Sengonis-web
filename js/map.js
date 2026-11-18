/* 3D map: MapLibre GL JS + OpenFreeMap (OpenStreetMap data, 3D buildings) + AWS terrain tiles.
   Blocks are polygons, plants are points (and 3D columns drawn at their recorded height).
   The map element is kept alive between page renders, so panning/tilting survives UI updates. */
const MSTYLE="https://tiles.openfreemap.org/styles/liberty",DEFC=[113.718,-8.14],MC={Seedling:"#9ed36a",Growing:"#4c9a3a",Mature:"#1f6b2a",Dead:"#8d8d8d"};
let MAP=null,MW=null,MR=false,MK=[],MP=null,MODE=null,DK=null,DRAFT=[],MB=null,MF=null,MQ=[],NT=0;
/* geometry (rings are [[lng,lat],...] without a repeated closing point) */
const kx=lat=>111320*Math.cos(lat*Math.PI/180),ky=110574;
const off=(c,dx,dy)=>[c[0]+dx/kx(c[1]),c[1]+dy/ky];
const rect=(c,x0,y0,x1,y1)=>[off(c,x0,y1),off(c,x1,y1),off(c,x1,y0),off(c,x0,y0)];
function gridBlocks(c){const w=90,h=70,g=8,b=[];for(let i=0;i<4;i++){const x0=i%2?g/2:-g/2-w,y0=i>>1?-g/2-h:g/2;b.push({n:i+1,ring:rect(c,x0,y0,x0+w,y0+h)})}return b}
function pip(p,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!=(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
const bbox=r=>r.reduce((q,p)=>[Math.min(q[0],p[0]),Math.min(q[1],p[1]),Math.max(q[2],p[0]),Math.max(q[3],p[1])],[1e9,1e9,-1e9,-1e9]);
const ctr=r=>{const b=bbox(r);return[(b[0]+b[2])/2,(b[1]+b[3])/2]};
function ha(r){const o=r[0],k=kx(o[1]);let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=(p[0]-o[0])*k*(q[1]-o[1])*ky-(q[0]-o[0])*k*(p[1]-o[1])*ky}return Math.abs(a)/2/1e4}
const blk=n=>S.geo.b.find(b=>b.n==n),blockAt=p=>S.geo.b.find(b=>pip(p,b.ring)),nextN=()=>Math.max(0,...S.geo.b.map(b=>b.n))+1;
function rnd(r){const b=bbox(r);for(let i=0;i<60;i++){const p=[b[0]+Math.random()*(b[2]-b[0]),b[1]+Math.random()*(b[3]-b[1])];if(pip(p,r))return p}return ctr(r)}
function slot(r,k,cnt){const b=bbox(r),cols=Math.ceil(Math.sqrt(cnt)),rows=Math.ceil(cnt/cols),p=[b[0]+(b[2]-b[0])*(.12+.76*((k%cols)+.5)/cols),b[1]+(b[3]-b[1])*(.12+.76*(Math.floor(k/cols)+.5)/rows)];return pip(p,r)?p:rnd(r)}
function autoSpot(n){const B=blk(n);if(!B)return{};const m=S.tan.filter(t=>t.blok==n&&t.lng!=null);let p;for(let i=0;i<40;i++){p=rnd(B.ring);if(m.every(t=>Math.hypot((t.lng-p[0])*kx(p[1]),(t.lat-p[1])*ky)>4))break}return{lng:p[0],lat:p[1]}}
/* called from load(): creates the default 4 blocks and gives every plant a map position */
function geoInit(){if(!S.geo||!S.geo.b)S.geo={c:S.geo&&S.geo.c||DEFC.slice(),b:null};const g=S.geo;if(!g.b)g.b=gridBlocks(g.c);
 [...new Set(S.tan.map(t=>t.blok))].forEach(n=>{const B=blk(n);if(!B)return;const all=S.tan.filter(t=>t.blok==n),miss=all.filter(t=>t.lng==null);if(!miss.length)return;
  if(miss.length==all.length)miss.forEach((t,k)=>{const p=slot(B.ring,k,all.length);t.lng=p[0];t.lat=p[1]});else miss.forEach(t=>Object.assign(t,autoSpot(n)))})}
const reseat=n=>{const B=blk(n);S.tan.filter(t=>t.blok==n&&t.lng!=null&&!pip([t.lng,t.lat],B.ring)).forEach(t=>Object.assign(t,autoSpot(n)))};
/* GeoJSON for the map */
const gj=f=>({type:"FeatureCollection",features:f}),ft=(p,g)=>({type:"Feature",properties:p,geometry:g});
function disk(c,r,n=10){const a=[];for(let i=0;i<n;i++){const t=i/n*2*Math.PI;a.push(off(c,Math.cos(t)*r,Math.sin(t)*r))}a.push(a[0]);return a}
const blocksGJ=()=>gj(S.geo.b.map(b=>ft({n:b.n,sel:MB==b.n?1:0},{type:"Polygon",coordinates:[[...b.ring,b.ring[0]]]})));
function plantsGJ(){const L=S.tan.filter(t=>t.lng!=null);return[gj(L.map(t=>ft({id:t.id,st:t.st},{type:"Point",coordinates:[t.lng,t.lat]}))),
 gj(L.map(t=>ft({id:t.id,st:t.st,h:Math.max(.3,+t.tinggi||0),c:MC[t.st]||MC.Growing},{type:"Polygon",coordinates:[disk([t.lng,t.lat],Math.min(2.2,.5+(+t.tinggi||0)*.15))]})))]}
/* map setup */
function mapLayers(){const sym=MAP.getStyle().layers.find(l=>l.type=="symbol"),b4=sym&&sym.id;
 MAP.addSource("terrain",{type:"raster-dem",tiles:["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],encoding:"terrarium",tileSize:256,maxzoom:15,attribution:"Terrain: Mapzen on AWS"});
 ["blocks","plants","trees","draft"].forEach(id=>MAP.addSource(id,{type:"geojson",data:gj([])}));
 MAP.addLayer({id:"blocks-fill",type:"fill",source:"blocks",paint:{"fill-color":"#3f8f45","fill-opacity":["case",["==",["get","sel"],1],.38,.2]}},b4);
 MAP.addLayer({id:"blocks-line",type:"line",source:"blocks",paint:{"line-color":"#1f5a28","line-width":["case",["==",["get","sel"],1],4,2.5]}},b4);
 MAP.addLayer({id:"trees",type:"fill-extrusion",source:"trees",paint:{"fill-extrusion-color":["get","c"],"fill-extrusion-height":["get","h"],"fill-extrusion-base":0,"fill-extrusion-opacity":.95}});
 MAP.addLayer({id:"dots",type:"circle",source:"plants",paint:{"circle-radius":["interpolate",["linear"],["zoom"],15,2,18,4,20,7],"circle-color":["match",["get","st"],"Seedling",MC.Seedling,"Growing",MC.Growing,"Mature",MC.Mature,MC.Dead],"circle-stroke-color":"#fff","circle-stroke-width":1}});
 MAP.addLayer({id:"draft-line",type:"line",source:"draft",filter:["==",["geometry-type"],"LineString"],paint:{"line-color":"#e3a21a","line-width":3,"line-dasharray":[2,1]}});
 MAP.addLayer({id:"draft-pts",type:"circle",source:"draft",filter:["==",["geometry-type"],"Point"],paint:{"circle-radius":5,"circle-color":"#e3a21a","circle-stroke-color":"#fff","circle-stroke-width":2}});
 MAP.setTerrain({source:"terrain",exaggeration:1.3})}
function mapData(){if(!MR)return;if(MP){MP.remove();MP=null}const[d,t]=plantsGJ();MAP.getSource("blocks").setData(blocksGJ());MAP.getSource("plants").setData(d);MAP.getSource("trees").setData(t);
 MK.forEach(m=>m.remove());MK=S.geo.b.map(b=>{const e=document.createElement("div");e.className="bl";e.innerHTML=`<b>Block ${b.n}</b><small>${S.tan.filter(t=>t.blok==b.n&&t.st!="Dead").length} trees, ${ha(b.ring).toFixed(2)} ha</small>`;return new maplibregl.Marker({element:e}).setLngLat(ctr(b.ring)).addTo(MAP)});paintBlocks()}
function homeView(an){const g=S.geo.b.flatMap(b=>b.ring);if(!g.length)return MAP.jumpTo({center:S.geo.c,zoom:17});const b=bbox(g);MAP.fitBounds([[b[0],b[1]],[b[2],b[3]]],{padding:70,pitch:60,bearing:-20,maxZoom:19,duration:an?1200:0})}
const whenReady=f=>MR?f():MQ.push(f);
function mapInit(){MAP=new maplibregl.Map({container:"map",style:MSTYLE,center:S.geo.c,zoom:17,pitch:60,bearing:-20,maxPitch:80,attributionControl:{compact:true}});
 MAP.addControl(new maplibregl.NavigationControl({visualizePitch:true}),"top-right");MAP.addControl(new maplibregl.ScaleControl({unit:"metric"}),"bottom-left");
 MAP.on("load",()=>{mapLayers();MR=true;const l=MW.querySelector(".mld");if(l)l.remove();mapData();homeView(false);MQ.splice(0).forEach(f=>f())});
 MAP.on("error",()=>{if(!MR){const l=MW.querySelector(".mld");if(l)l.textContent="The map could not be loaded. Check your internet connection."}});
 MAP.on("click",mapClick);
 MAP.on("mouseenter","dots",()=>{if(!MODE)MAP.getCanvas().style.cursor="pointer"});MAP.on("mouseleave","dots",()=>{MAP.getCanvas().style.cursor=MODE?"crosshair":""})}
function mapMount(){const s=$("#mapslot");if(!s)return;
 if(typeof maplibregl=="undefined"){s.innerHTML='<p class="mut">The map library could not be loaded. Check your internet connection and reload the page.</p>';return}
 if(!MW){MW=document.createElement("div");MW.className="mw";
  MW.innerHTML=`<div id="map"></div><div class="mtl"><button class="btn sm" data-a="m3" aria-pressed="true">3D</button><button class="btn sm" data-a="mter" aria-pressed="true">${ic("mountain")}Terrain</button><button class="btn sm" data-a="mhm">${ic("locate-fixed")}Reset view</button></div><div class="mbn" hidden></div><div class="mld">Loading map…</div>`;s.appendChild(MW);mapInit()}
 else{s.appendChild(MW);MAP.resize();mapData()}
 $("#gs").onsubmit=async e=>{e.preventDefault();const q=String(new FormData(e.target).get("q")).trim();if(!q)return;
  try{const j=await(await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q="+encodeURIComponent(q))).json();if(!j[0])throw 0;MAP.flyTo({center:[+j[0].lon,+j[0].lat],zoom:16.5,pitch:60,duration:1500})}catch(x){note("Could not find that place.")}};
 if(MF){const id=MF;MF=null;whenReady(()=>{const t=byId(S.tan,id);if(t&&t.lng!=null){MAP.flyTo({center:[t.lng,t.lat],zoom:19.5,pitch:65,duration:1400});setTimeout(()=>plantPop(id),1500)}})}}
/* modes: plant (click to add trees), draw (block boundary), move (relocate the plantation) */
function setMode(m,k){MODE=m;DK=k;DRAFT=[];drawDraft();banner();MAP.getCanvas().style.cursor=m?"crosshair":"";m=="draw"?MAP.doubleClickZoom.disable():MAP.doubleClickZoom.enable()}
function banner(){const e=MW.querySelector(".mbn");if(!MODE){e.hidden=true;return}
 const t={plant:"Click inside a block to plant a tree.",move:"Click where the middle of the plantation should be.",draw:`Block ${DK=="new"?nextN():DK}: click each corner of the boundary (${DRAFT.length} placed).`}[MODE];
 e.innerHTML=`<span>${t}</span>${MODE=="draw"?`<button class="btn sm" data-a="mu">Undo</button><button class="btn sm" data-a="mf">Finish</button>`:""}<button class="btn sm" data-a="mc">${MODE=="plant"?"Done":"Cancel"}</button>`;e.hidden=false}
function note(m){const e=MW.querySelector(".mbn");e.innerHTML=`<span>${esc(m)}</span>`;e.hidden=false;clearTimeout(NT);NT=setTimeout(banner,2600)}
function drawDraft(){const s=MAP&&MAP.getSource("draft");if(!s)return;const f=DRAFT.map(p=>ft({},{type:"Point",coordinates:p}));if(DRAFT.length>1)f.push(ft({},{type:"LineString",coordinates:DRAFT.length>2?[...DRAFT,DRAFT[0]]:DRAFT}));s.setData(gj(f))}
function finishDraw(){if(DRAFT.length<3)return note("Add at least 3 corners first.");const ring=DRAFT.slice(),nw=DK=="new",n=nw?nextN():DK;LAST={a:nw?"bka":"bke",i:n};
 if(nw)S.geo.b.push({n,ring});else blk(n).ring=ring;reseat(n);geoInit();setMode(null);done()}
function movePlantation(p){const c=S.geo.c,f=q=>off(p,(q[0]-c[0])*kx(c[1]),(q[1]-c[1])*ky);S.geo.b.forEach(b=>b.ring=b.ring.map(f));S.tan.forEach(t=>{if(t.lng!=null){const q=f([t.lng,t.lat]);t.lng=q[0];t.lat=q[1]}});S.geo.c=p;setTimeout(()=>MAP&&homeView(true),80)}
function mapClick(e){const p=[e.lngLat.lng,e.lngLat.lat];
 if(MODE=="draw"){DRAFT.push(p);drawDraft();return banner()}
 if(MODE=="plant"){const B=blockAt(p);if(!B)return note("That spot is outside every block. Click inside a block.");LAST={a:"mp"};
  return form("Plant a tree in Block "+B.n,PF.filter(f=>f.k!="blok"),{tgl:today(),tinggi:0,dia:0,st:"Seedling"},d=>{S.tan.push({id:nid(S.tan),...d,blok:B.n,lng:p[0],lat:p[1]});done()})}
 if(MODE=="move"){LAST={a:"mv"};setMode(null);return ask("Move the whole plantation (all blocks and trees) so its middle is here?",()=>movePlantation(p))}
 const f=MAP.queryRenderedFeatures(e.point,{layers:["dots","trees"]})[0];if(f)return plantPop(f.properties.id);
 const b=MAP.queryRenderedFeatures(e.point,{layers:["blocks-fill"]})[0];if(b)A.bks(b.properties.n)}
function plantPop(id){const t=byId(S.tan,id);if(!t||t.lng==null)return;if(MP)MP.remove();
 MP=new maplibregl.Popup({maxWidth:"260px",offset:8}).setLngLat([t.lng,t.lat]).setHTML(`<b>Plant ${t.id}</b>, Block ${t.blok}<br>Planted ${esc(t.tgl)}<br>Height ${esc(t.tinggi)} m, diameter ${esc(t.dia)} cm<br>Status: ${esc(t.st)}<div style="margin-top:8px"><button class="btn sm" data-a="pe" data-i="${t.id}">Edit</button></div>`).addTo(MAP)}
/* side panel */
function blocksHTML(){const un=S.tan.filter(t=>t.st!="Dead"&&t.lng==null).length;
 return`<div class="ch-h"><h2>Blocks<small>Click a block to zoom to it</small></h2></div>`+(S.geo.b.slice().sort((a,b)=>a.n-b.n).map(b=>{const t=S.tan.filter(x=>x.blok==b.n),l=t.filter(x=>x.st!="Dead");
  return`<div class="bk${MB==b.n?" on":""}" data-a="bks" data-i="${b.n}"><div><b>Block ${b.n}</b><small>${l.length}/${t.length} trees, ${ha(b.ring).toFixed(2)} ha</small></div>${own()?`<span class="row">${btn("bke",b.n,"Redraw","ghost")}${btn("bkd",b.n,"Delete","ghost")}</span>`:""}</div>`}).join("")||`<p class="mut">No blocks yet.${own()?" Use “Add block” to draw one.":""}</p>`)+
 (un?`<small class="mut" style="display:block;margin-top:12px">${un} living tree${un>1?"s have":" has"} no map position because ${un>1?"their blocks are":"its block is"} not drawn.</small>`:"")+
 `<div class="lgd">${["Seedling","Growing","Mature","Dead"].map(s=>`<span><i style="background:${MC[s]}"></i>${s}</span>`).join("")}</div>`}
const paintBlocks=()=>{const e=$("#bkl");if(e)e.innerHTML=blocksHTML()};
function mapv(){return head("map","Plantation map","Drag to pan. Right-drag (or Ctrl-drag) to rotate and tilt. Trees are drawn at their recorded height.",`<form class="search" id="gs">${ic("search")}<input name="q" placeholder="Find a place" aria-label="Find a place"></form><button class="btn" data-a="mp">${ic("sprout")}Plant tree</button>${own()?`<button class="btn ghost" data-a="bka">${ic("plus")}Add block</button><button class="btn ghost" data-a="mv">${ic("map-pin")}Move plantation</button>`:""}`)+`<div class="mapgrid"><section class="card mapcard" style="padding:10px"><div id="mapslot"></div></section><div class="col"><section class="card wx" data-wx>${wxInner()}</section><section class="card" id="bkl">${blocksHTML()}</section></div></div>`}
Object.assign(A,{mp:()=>setMode("plant"),bka:()=>setMode("draw","new"),bke:i=>setMode("draw",+i),mv:()=>setMode("move"),mu:()=>{DRAFT.pop();drawDraft();banner()},mf:finishDraw,mc:()=>setMode(null),
 m3:()=>{const on=MAP.getPitch()<10;MAP.easeTo({pitch:on?60:0,duration:700});MW.querySelector('[data-a="m3"]').setAttribute("aria-pressed",on)},
 mter:()=>{const b=MW.querySelector('[data-a="mter"]'),on=b.getAttribute("aria-pressed")!="true";MAP.setTerrain(on?{source:"terrain",exaggeration:1.3}:null);b.setAttribute("aria-pressed",on)},
 mhm:()=>homeView(true),wxr:()=>wxLoad(true),loc:i=>{MF=+i;A.go("map")},
 bks:i=>{MB=MB==i?null:+i;MAP.getSource("blocks").setData(blocksGJ());paintBlocks();const B=blk(MB);if(B){const b=bbox(B.ring);MAP.fitBounds([[b[0],b[1]],[b[2],b[3]]],{padding:80,maxZoom:19.5,pitch:MAP.getPitch(),bearing:MAP.getBearing(),duration:900})}},
 bkd:i=>ask(`Delete block ${i}? Its trees stay in the records but lose their map position.`,()=>{S.geo.b=S.geo.b.filter(b=>b.n!=i);S.tan.filter(t=>t.blok==i).forEach(t=>{delete t.lng;delete t.lat});if(MB==i)MB=null})});
document.addEventListener("keydown",e=>{if(e.key=="Escape"&&MODE&&MW)setMode(null)});
