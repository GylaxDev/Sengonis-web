function drawForest(){const r=rng(3);let s='<svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8c8cb"/><stop offset="1" stop-color="#a9bfb0"/></linearGradient><filter id="bl"><feGaussianBlur stdDeviation="3"/></filter></defs><rect width="1200" height="700" fill="url(#sk)"/>';
 for(let i=0;i<46;i++)s+=`<rect x="${r()*1200}" width="${6+r()*18}" height="700" fill="${["#7d8a63","#87946b","#6f7c58"][i%3]}" opacity="${.5+r()*.5}"/>`;
 s+='<g filter="url(#bl)">';for(let i=0;i<150;i++)s+=`<circle cx="${r()*1200}" cy="${r()*r()*700}" r="${14+r()*34}" fill="${["#5f9a3b","#79b24a","#4c8a35","#8dc05a"][i%4]}" opacity="${.35+r()*.4}"/>`;
 $("#forest").innerHTML=s+"</g></svg>"}
// Uses assets/forest.jpg (set in css/style.css). If the file is missing, draws a generated forest instead.
(function(){const im=new Image();im.onerror=()=>{$("#forest").style.backgroundImage="none";drawForest()};im.src="assets/forest.jpg"})();
