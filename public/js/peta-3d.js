/* Peta 3D Sengonis · MapLibre + OpenFreeMap + Mapzen/MapLibre AWS terrain. */
(() => {
  const source = document.getElementById('map-data');
  if (!source) return;
  const data = JSON.parse(source.textContent);
  const loader = document.getElementById('map-loading');
  if (!window.maplibregl) {
    loader.textContent = 'MapLibre gagal dimuat. Periksa koneksi internet dan muat ulang halaman.';
    return;
  }
  const colors = {Seedling:'#9ed36a', Growing:'#4c9a3a', Mature:'#1f6b2a', Dead:'#8d8d8d'};
  const blocks = data.blocks || [], plants = data.markers || [];
  const center = data.center || [113.718, -8.14];
  const gj = features => ({type:'FeatureCollection', features});
  const ft = (p,g) => ({type:'Feature', properties:p, geometry:g});
  const closed = ring => [...ring, ring[0]];
  const rect = ring => ring.reduce((bounds, p) => {bounds.extend(p);return bounds;}, new maplibregl.LngLatBounds());
  const centerOf = ring => {const box=rect(ring); const sw=box.getSouthWest(),ne=box.getNorthEast();return [(sw.lng+ne.lng)/2,(sw.lat+ne.lat)/2];};
  const inside = (p,ring) => {let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++) {const a=ring[i],b=ring[j]; if((a[1]>p[1])!==(b[1]>p[1]) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) hit=!hit;}return hit;};
  const offset = (p,dx,dy) => [p[0]+dx/(111320*Math.cos(p[1]*Math.PI/180)),p[1]+dy/110574];
  function disk(p,r) {const points=[];for(let i=0;i<12;i++){const a=i*Math.PI*2/12;points.push(offset(p,Math.cos(a)*r,Math.sin(a)*r));}return closed(points);}
  const blockGeo = gj(blocks.map(b => ft({nomor:b.nomor}, {type:'Polygon',coordinates:[closed(b.koordinat)]})));
  const treePoints = gj(plants.map(t => ft({id:t.id,blok:t.blok,status:t.status}, {type:'Point',coordinates:[t.lng,t.lat]})));
  const treeColumns = gj(plants.map(t => ft({id:t.id, color: colors[t.status]||colors.Growing, height:Math.max(0.3, +t.tinggi||0)}, {type:'Polygon',coordinates:[disk([t.lng,t.lat],Math.min(2.2,.5+(+t.tinggi||0)*.15))]})));
  const map = new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center,zoom:17,pitch:60,bearing:-20,maxPitch:80,attributionControl:true});
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}), 'top-right');
  map.addControl(new maplibregl.ScaleControl({unit:'metric'}), 'bottom-left');
  const instruction = document.getElementById('map-instructions');
  const instructionText = document.getElementById('map-instructions-text');
  const undo = document.getElementById('map-undo');
  const finish = document.getElementById('map-finish');
  let mode=null, number=null, draft=[], ready=false, popup=null, terrainReady=false;
  const ids = ['map-3d','map-terrain'];
  function alertMap(message) {instruction.hidden=false;instructionText.textContent=message;}
  function showControls() {
    if (!mode) {instruction.hidden=true;return;}
    instruction.hidden=false;
    instructionText.textContent=mode==='draw'?`Klik setiap sudut batas Blok ${number} (${draft.length} titik), lalu Simpan blok.`:mode==='plant'?'Klik di dalam poligon blok untuk mengisi lokasi tanaman.':'Klik pusat lokasi baru; semua titik dan blok akan dipindahkan.';
    undo.hidden=mode!=='draw'; finish.hidden=mode!=='draw';
  }
  function setMode(value, blockNo) {
    mode=value;number=blockNo;draft=[];
    if (ready) renderDraft();
    map.getCanvas().style.cursor=value?'crosshair':'';
    if (value==='draw') map.doubleClickZoom.disable(); else map.doubleClickZoom.enable();
    showControls();
  }
  function renderDraft() {
    const features=draft.map(p => ft({}, {type:'Point',coordinates:p}));
    if(draft.length>=2) features.push(ft({}, {type:'LineString',coordinates:draft.length>2?closed(draft):draft}));
    map.getSource('draft').setData(gj(features));
  }
  function fitAll() {
    const points = blocks.flatMap(b=>b.koordinat);
    if(!points.length) points.push(...plants.map(p=>[p.lng,p.lat]));
    if(!points.length){map.flyTo({center,zoom:16,pitch:map.getPitch()});return;}
    const bounds=rect(points);
    map.fitBounds(bounds,{padding:75,maxZoom:19,pitch:map.getPitch(),bearing:map.getBearing(),duration:700});
  }
  function pop(id) {
    const p=plants.find(x=>x.id===+id);
    if(!p)return;
    const content=document.createElement('div');
    const heading=document.createElement('strong');heading.textContent='Tanaman #'+p.id;
    const details=document.createElement('p');details.style.margin='5px 0';details.textContent=`Blok ${p.blok} · ${p.status} · ${p.tinggi} m · diameter ${p.diameter} cm · ${p.tanggal}`;
    const anchor=document.createElement('a');anchor.href=p.ubah_url;anchor.textContent='Edit tanaman';
    anchor.addEventListener('click',e=>{if(window.SengonisModal){e.preventDefault();window.SengonisModal.open(anchor.href);}});
    content.append(heading,details,anchor);
    if(popup)popup.remove();
    popup=new maplibregl.Popup({offset:9}).setLngLat([p.lng,p.lat]).setDOMContent(content).addTo(map);
  }
  map.on('load', () => {
    ready=true;loader.hidden=true;
    try {
      map.addSource('terrain-dem',{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],tileSize:256,encoding:'terrarium',maxzoom:15,attribution:'Terrain: Mapzen on AWS'});
      map.setTerrain({source:'terrain-dem',exaggeration:1.3}); terrainReady=true;
    } catch (e) {
      const button=document.getElementById('map-terrain');button.disabled=true;button.title='Terrain tidak didukung pada perangkat ini';
    }
    map.addSource('blocks',{type:'geojson',data:blockGeo});
    map.addSource('plants',{type:'geojson',data:treePoints});
    map.addSource('trees',{type:'geojson',data:treeColumns});
    map.addSource('draft',{type:'geojson',data:gj([])});
    const firstSymbol=map.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
    map.addLayer({id:'blocks-fill',type:'fill',source:'blocks',paint:{'fill-color':'#3f8f45','fill-opacity':0.22}}, firstSymbol);
    map.addLayer({id:'blocks-outline',type:'line',source:'blocks',paint:{'line-color':'#1f5a28','line-width':3}},firstSymbol);
    map.addLayer({id:'tree-columns',type:'fill-extrusion',source:'trees',paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-opacity':0.92}});
    map.addLayer({id:'plant-dots',type:'circle',source:'plants',paint:{'circle-radius':['interpolate',['linear'],['zoom'],15,2,18,4,20,7],'circle-color':['match',['get','status'],'Seedling',colors.Seedling,'Growing',colors.Growing,'Mature',colors.Mature,colors.Dead],'circle-stroke-color':'#fff','circle-stroke-width':1}});
    map.addLayer({id:'draft-line',type:'line',source:'draft',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#e3a21a','line-width':3,'line-dasharray':[2,1]}});
    map.addLayer({id:'draft-points',type:'circle',source:'draft',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':6,'circle-color':'#e3a21a','circle-stroke-color':'#fff','circle-stroke-width':2}});
    blocks.forEach(block=>{
      const element=document.createElement('div');element.className='map-block-label';
      const live=plants.filter(p=>p.blok===block.nomor&&p.status!=='Dead').length;
      const bold=document.createElement('b');bold.textContent='Blok '+block.nomor;
      const small=document.createElement('small');small.textContent=live+' pohon hidup';
      element.append(bold,small);
      new maplibregl.Marker({element,anchor:'center'}).setLngLat(centerOf(block.koordinat)).addTo(map);
    });
    fitAll();
  });
  map.on('error', () => {if(!ready)loader.textContent='Peta gagal dimuat. Periksa akses ke OpenFreeMap dan MapLibre.';});
  map.on('click', (e) => {
    const p=[e.lngLat.lng,e.lngLat.lat];
    if (mode==='draw') {draft.push(p);renderDraft();showControls();return;}
    if (mode==='plant') {
      const block=blocks.find(b=>inside(p,b.koordinat));
      if(!block){alertMap('Titik berada di luar poligon blok. Pilih titik dalam blok.');return;}
      const url=new URL(data.plantUrl,window.location.href);
      url.searchParams.set('lokasi_blok',block.nomor);
      url.searchParams.set('latitude',p[1].toFixed(7));url.searchParams.set('longitude',p[0].toFixed(7));
      if(window.SengonisModal) window.SengonisModal.open(url.toString());
      else window.location.assign(url.toString());
      return;
    }
    if (mode==='move') {
      if(!confirm('Pindahkan seluruh batas blok dan koordinat tanaman ke pusat lokasi yang dipilih?'))return;
      document.getElementById('map-new-lat').value=p[1];
      document.getElementById('map-new-lon').value=p[0];
      document.getElementById('map-move-form').submit();return;
    }
    const f=map.queryRenderedFeatures(e.point,{layers:['plant-dots','tree-columns']})[0];
    if(f?.properties?.id){pop(f.properties.id);return;}
    const b=map.queryRenderedFeatures(e.point,{layers:['blocks-fill']})[0];
    if(b?.properties?.nomor){focusBlock(+b.properties.nomor);}
  });
  map.on('mouseenter','plant-dots',()=>{if(!mode)map.getCanvas().style.cursor='pointer';});
  map.on('mouseleave','plant-dots',()=>{map.getCanvas().style.cursor=mode?'crosshair':'';});
  function focusBlock(n) {
    const b=blocks.find(block=>block.nomor===n);if(!b)return;
    map.fitBounds(rect(b.koordinat),{padding:90,maxZoom:19.5,pitch:map.getPitch(),bearing:map.getBearing(),duration:800});
    document.querySelectorAll('[data-focus-block]').forEach(el=>el.classList.toggle('is-active',+el.dataset.focusBlock===n));
  }
  document.querySelectorAll('[data-focus-block]').forEach(button => button.addEventListener('click',()=>focusBlock(+button.dataset.focusBlock)));
  document.querySelectorAll('[data-draw-block]').forEach(button => button.addEventListener('click',()=>setMode('draw',+button.dataset.drawBlock)));
  document.getElementById('map-plant').addEventListener('click',()=>setMode(mode==='plant'?null:'plant'));
  document.getElementById('map-new-block')?.addEventListener('click',()=>setMode('draw',Math.max(0,...blocks.map(b=>b.nomor))+1));
  document.getElementById('map-move')?.addEventListener('click',()=>{if(blocks.length)setMode('move');else alertMap('Buat blok terlebih dahulu sebelum memindahkan lokasi kebun.');});
  document.getElementById('map-cancel').addEventListener('click',()=>setMode(null));
  undo.addEventListener('click',()=>{draft.pop();renderDraft();showControls();});
  finish.addEventListener('click',()=>{
    if(draft.length<3){alertMap('Tambahkan minimal tiga titik batas blok.');return;}
    if(!confirm(`Simpan batas poligon Blok ${number} ke database?`))return;
    document.getElementById('map-block-number').value=number;
    document.getElementById('map-block-coordinates').value=JSON.stringify(draft);
    document.getElementById('map-block-form').submit();
  });
  document.getElementById('map-3d').addEventListener('click',e=>{const on=map.getPitch()<10;map.easeTo({pitch:on?60:0,duration:650});e.currentTarget.setAttribute('aria-pressed',String(on));});
  document.getElementById('map-terrain').addEventListener('click',e=>{
    if(!terrainReady)return;
    const btn=e.currentTarget,on=btn.getAttribute('aria-pressed')!=='true';
    try{map.setTerrain(on?{source:'terrain-dem',exaggeration:1.3}:null);btn.setAttribute('aria-pressed',String(on));}catch(err){alertMap('Terrain tidak dapat diaktifkan pada perangkat ini.');}
  });
  document.getElementById('map-reset').addEventListener('click',fitAll);
  if(new URLSearchParams(location.search).get('mode')==='add-block' && data.isOwner) setMode('draw',Math.max(0,...blocks.map(b=>b.nomor))+1);
  document.getElementById('map-search').addEventListener('submit',async e=>{
    e.preventDefault();const q=new FormData(e.currentTarget).get('q')?.toString().trim();if(!q)return;
    try {
      const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+encodeURIComponent(q));
      if(!r.ok)throw Error('Geocoding unavailable');
      const result=await r.json();if(!result[0])throw Error('Lokasi tidak ditemukan');
      map.flyTo({center:[+result[0].lon,+result[0].lat],zoom:16.5,pitch:60,duration:1000});
    } catch(err) {alertMap('Pencarian lokasi gagal atau tidak ditemukan.');}
  });
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&mode)setMode(null);});
})();
