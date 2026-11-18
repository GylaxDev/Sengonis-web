/* weather: current conditions + 4-day forecast for the plantation (Open-Meteo: free, no API key).
   Raw data is stored in metric units; display units come from Settings → Preferences. */
let WX=null,WXE="",WXB=false,WXF=0;
try{WX=JSON.parse(localStorage.getItem("sengonis_wx"))}catch(e){}
const WM={};[[[0],"Clear sky","sun","moon"],[[1],"Mainly clear","sun","moon"],[[2],"Partly cloudy","cloud-sun","cloud-moon"],[[3],"Overcast","cloud"],[[45,48],"Fog","cloud-fog"],[[51,53,55,56,57],"Drizzle","cloud-drizzle"],[[61,63,65,66,67],"Rain","cloud-rain"],[[80,81,82],"Rain showers","cloud-rain"],[[71,73,75,77,85,86],"Snow","cloud-snow"],[[95,96,99],"Thunderstorm","cloud-lightning"]].forEach(([k,...v])=>k.forEach(c=>WM[c]=v));
const wxInfo=(c,day=1)=>{const m=WM[c]||["Cloudy","cloud"];return[m[0],!day&&m[2]?m[2]:m[1]]};
const wxKey=()=>S.geo.c.map(x=>x.toFixed(3)).join(","),wxOk=()=>WX&&S&&S.geo&&WX.k==wxKey()?WX:null;
const tc=c=>CFG.tempUnit=="F"?Math.round(c*9/5+32):Math.round(c),tu=()=>"°"+CFG.tempUnit;
const wk=k=>CFG.windUnit=="mph"?Math.round(k*.621):Math.round(k),wu=()=>CFG.windUnit=="mph"?"mph":"km/h";
/* returns [text, level] — level 0 fine, 1 caution, 2 danger. Thresholds are in Settings → Plantation. */
function wxAdvice(w){const c=w.cur,d=w.daily,rain=d.precipitation_sum.slice(0,3).reduce((a,x)=>a+(x||0),0),hot=Math.max(...d.temperature_2m_max.slice(0,3));
 if(c.weather_code>=95||c.wind_speed_10m>=40)return["Storm risk: keep crews out of the plantation and check for wind damage afterwards.",2];
 if(d.precipitation_sum[0]>=CFG.rainMm/2||rain>=CFG.rainMm)return["Heavy rain expected: check drainage in low-lying blocks (waterlogging risk).",1];
 if(rain<3&&hot>=CFG.hotC)return["Hot and dry the next few days: check that seedlings get enough water.",1];
 return["Conditions look fine for fieldwork.",0]}
function wxInner(){const w=wxOk();
 if(!w)return`<div class="wxh"><div><span class="eye">Weather at the plantation</span><div class="wxt">${WXE?"Unavailable":"Loading…"}</div></div><i class="tic">${ic("cloud-sun")}</i></div><p class="mut" style="margin-top:8px">${WXE||"Fetching the latest forecast."}</p>${WXE?`<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="wxr">${ic("refresh-cw")}Try again</button></div>`:""}`;
 const c=w.cur,d=w.daily,[lab,icn]=wxInfo(c.weather_code,c.is_day),dn=i=>i?new Date(d.time[i]+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short"}):"Today",dir=["N","NE","E","SE","S","SW","W","NW"][Math.round(c.wind_direction_10m/45)%8],[adv,lv]=wxAdvice(w);
 return`<div class="wxh"><div><span class="eye">Weather at the plantation</span><div class="wxt">${tc(c.temperature_2m)}${tu()}<small>${lab}</small></div></div><i class="tic">${ic(icn)}</i></div>`+
 `<p class="mut" style="margin-top:6px;font-size:.88rem">Feels like ${tc(c.apparent_temperature)}°, humidity ${c.relative_humidity_2m}%, wind ${wk(c.wind_speed_10m)} ${wu()} ${dir}, rain now ${c.precipitation} mm</p>`+
 `<div class="fc">${d.time.map((_,i)=>`<div><span>${dn(i)}</span>${ic(wxInfo(d.weather_code[i])[1])}<b>${tc(d.temperature_2m_min[i])}–${tc(d.temperature_2m_max[i])}°</b><span>${Math.round(d.precipitation_sum[i])} mm</span></div>`).join("")}</div>`+
 `<div class="adv ${["","w","b"][lv]}">${ic(lv?"triangle-alert":"circle-check")}<span>${adv}</span></div><small class="up">Updated ${new Date(w.at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}${WXE?". Could not refresh, showing the last forecast.":""} · Open-Meteo <button class="btn sm ghost" data-a="wxr" style="margin-left:8px" aria-label="Refresh weather">${ic("refresh-cw")}</button></small>`}
const paintWx=()=>document.querySelectorAll("[data-wx]").forEach(e=>e.innerHTML=wxInner());
async function wxLoad(force){if(WXB||!S||!S.geo)return;if(!force&&(Date.now()-WXF<6e4||(wxOk()&&Date.now()-WX.at<9e5)))return;
 WXB=true;if(force){WXE="";paintWx()}
 try{const[lng,lat]=S.geo.c,r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=4`);
  if(!r.ok)throw 0;const j=await r.json();WX={at:Date.now(),k:wxKey(),cur:j.current,daily:j.daily};WXE="";WXF=0;try{localStorage.setItem("sengonis_wx",JSON.stringify(WX))}catch(e){}}
 catch(e){WXE="Could not reach the weather service. Check your internet connection.";WXF=Date.now()}
 WXB=false;paintWx();if(typeof paintBell=="function")paintBell()}
setInterval(()=>{if(U)wxLoad()},9e5);
