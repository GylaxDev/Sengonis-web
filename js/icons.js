// Icons are from Lucide (https://lucide.dev), loaded from the CDN in index.html.
// ic() writes a placeholder; lucide.createIcons() swaps it for the real SVG whenever the page changes.
const LN={home:"house",box:"package",report:"file-text",edit:"pencil",trash:"trash-2",shield:"shield-check",logout:"log-out",trend:"trending-up",alert:"triangle-alert",spark:"sparkles"};
const ic=n=>`<i data-lucide="${LN[n]||n}" class="ic"></i>`;
const BI={Edit:"edit",Delete:"trash",Validate:"check",Reject:"x",Verify:"shield",Archive:"archive",Deactivate:"ban",Reactivate:"rotate-ccw",Redraw:"edit",Locate:"map-pin"};
function drawIcons(){if(window.lucide&&document.querySelector("i[data-lucide]"))lucide.createIcons()}
new MutationObserver(drawIcons).observe(document.body,{childList:true,subtree:true});
window.addEventListener("load",drawIcons);
