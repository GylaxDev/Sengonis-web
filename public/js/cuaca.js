/* Sengonis: prakiraan cuaca aktual dari endpoint Laravel, bukan data contoh. */
(() => {
  const targets = [...document.querySelectorAll('[data-cuaca]')];
  if (!targets.length) return;
  const mappings = {
    0: ['Cerah', 'sun'], 1: ['Cerah berawan', 'sun'], 2: ['Berawan sebagian', 'cloud-sun'],
    3: ['Mendung', 'cloud'], 45: ['Kabut', 'cloud-fog'], 48: ['Kabut', 'cloud-fog'],
    51: ['Gerimis', 'cloud-drizzle'], 53: ['Gerimis', 'cloud-drizzle'], 55: ['Gerimis', 'cloud-drizzle'],
    61: ['Hujan', 'cloud-rain'], 63: ['Hujan', 'cloud-rain'], 65: ['Hujan deras', 'cloud-rain'],
    80: ['Hujan sesaat', 'cloud-rain'], 81: ['Hujan sesaat', 'cloud-rain'], 82: ['Hujan deras', 'cloud-rain'],
    95: ['Badai petir', 'cloud-lightning'], 96: ['Badai petir', 'cloud-lightning'], 99: ['Badai petir', 'cloud-lightning']
  };
  const info = n => mappings[+n] || ['Berawan', 'cloud'];
  const num = (value, decimals=0) => value !== null && value !== undefined && value !== '' && Number.isFinite(+value) ? Number(value).toFixed(decimals) : '—';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const dir = degrees => ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'][Math.round((+degrees || 0) / 45) % 8];
  const show = (card, data) => {
    const c = data.current, d = data.daily, days = d.time || [];
    const [description, symbol] = info(c.weather_code);
    const advice = data.peringatan || {tingkat:0,pesan:'Pantau kondisi cuaca setempat.'};
    const forecast = days.map((date, i) => {
      const dow = new Date(date + 'T12:00:00').toLocaleDateString('id-ID', {weekday:'short'});
      return `<div class="weather-day"><span>${safe(dow)}</span>${icon(info(d.weather_code?.[i])[1])}<b>${num(d.temperature_2m_min?.[i])}–${num(d.temperature_2m_max?.[i])}°</b><small>${num(d.precipitation_sum?.[i])} mm</small></div>`;
    }).join('');
    card.querySelector('.weather-info').innerHTML = `
      <div class="weather-now"><div><span class="eye">KONDISI SAAT INI</span><div class="weather-temp">${num(c.temperature_2m)}°C <small>${safe(description)}</small></div></div><span class="weather-main-icon">${icon(symbol)}</span></div>
      <p class="weather-meta">Terasa ${num(c.apparent_temperature)}°C · Kelembapan ${num(c.relative_humidity_2m)}% · Angin ${num(c.wind_speed_10m)} km/j ${dir(c.wind_direction_10m)} · Hujan ${num(c.precipitation,1)} mm</p>
      <div class="weather-forecast">${forecast}</div>
      <div class="weather-alert risk-${+advice.tingkat || 0}">${icon(+advice.tingkat ? 'triangle-alert' : 'circle-check')}<span>${safe(advice.pesan)}</span></div>
      <p class="mini-sub">Diperbarui ${safe(new Date(data.fetched_at).toLocaleString('id-ID', {timeZone:'Asia/Jakarta',dateStyle:'short',timeStyle:'short'}))} WIB · sekitar ${num(data.lokasi?.latitude,4)}, ${num(data.lokasi?.longitude,4)}</p>`;
    if (window.lucide) window.lucide.createIcons();
  };
  let active = false;
  async function reload() {
    if (active) return;
    active = true;
    for (const card of targets) {
      const button = card.querySelector('[data-cuaca-refresh]');
      if (button) button.disabled = true;
    }
    try {
      const response = await fetch(targets[0].dataset.cuacaUrl, {headers: {'Accept':'application/json'}, credentials:'same-origin'});
      if (!response.ok) throw new Error('HTTP '+response.status);
      const payload = await response.json();
      if (!payload.current || !payload.daily) throw new Error('Data cuaca tidak tersedia');
      for (const card of targets) show(card, payload);
    } catch (error) {
      for (const card of targets) {
        card.querySelector('.weather-info').innerHTML = `<p class="weather-error">Cuaca belum tersedia. Pastikan server Laravel tersambung internet dan coba lagi.</p>`;
      }
    } finally {
      active = false;
      targets.forEach(card => {const btn = card.querySelector('[data-cuaca-refresh]'); if (btn) btn.disabled = false;});
    }
  }
  targets.forEach(card => card.querySelector('[data-cuaca-refresh]')?.addEventListener('click', reload));
  reload();
  // Pembaruan berkala selama tab aktif; endpoint di-cache 15 menit.
  setInterval(() => {if (document.visibilityState === 'visible') reload();}, 15 * 60 * 1000);
})();
