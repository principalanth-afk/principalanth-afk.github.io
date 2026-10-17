/* =====================================================================
   SIN LÍMITES 2.0 — Pestaña TICKETS (bitácora de boletos del motor)
   - Lee capturas del historial de la casa (OCR en el mismo teléfono)
   - Gráfico de puntos cuota vs monto, con lo último cargado resaltado
   - Partidos, prob. del motor, cuota mínima, cuota de cierre (CLV)
   - Aviso programado a MATRIX Alertas (ntfy) antes del partido
   Usa las utilidades y el estado S del script principal.
   Los tickets no se borran: solo se completan o se corrigen (queda registro).
   ===================================================================== */

// ---------- estado ----------
function TX(){
  if (!Array.isArray(S.tickets)) S.tickets = [];
  if (!S.txCfg) S.txCfg = { servidor: 'https://ntfy.sh', canal: '', minAntes: 10, eje: 'monto' };
  if (!S.txPrecarga && Array.isArray(window.PRECARGA)){
    const ya = new Set(S.tickets.map(t => t.nro));
    window.PRECARGA.forEach(t => { if (!ya.has(t.nro)) S.tickets.push(JSON.parse(JSON.stringify(t))); });
    S.txPrecarga = true; save();
  }
  return S.tickets;
}
const tipoDe = c => c < 1.25 ? 'Salva' : c < 1.55 ? 'Base' : 'Riesgo';
const netoDe = t => t.estado === 'ganada' ? r2((t.cobro ?? r2(t.monto * t.cuota)) - t.monto) : t.estado === 'perdida' ? -t.monto : 0;
const resueltos = () => TX().filter(t => t.estado === 'ganada' || t.estado === 'perdida');
const fechaHora = iso => { try { return new Date(iso).toLocaleString('es-VE', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}); } catch(e){ return iso; } };
// cuánto se movió la cuota de un partido: + = bajó (a tu favor), − = subió
const clvDe = p => (p.cuota > 1 && p.cierre > 1) ? p.cuota / p.cierre - 1 : null;
function clvTicket(t){
  const ps = (t.partidos || []).filter(p => clvDe(p) !== null);
  if (!ps.length) return null;
  const a = ps.reduce((x, p) => x * p.cuota, 1), c = ps.reduce((x, p) => x * p.cierre, 1);
  return a / c - 1;
}

// ---------- gráfico de puntos ----------
let txSel = null; // ticket tocado en el gráfico
function graficoTX(){
  const ts = TX(), cfg = S.txCfg, eje = cfg.eje || 'monto';
  const W = 360, H = 210, L = 34, Rr = 10, T = 16, B = 26;
  if (!ts.length) return '<div class="muted" style="padding:20px;text-align:center">Aún no hay tickets.</div>';
  const yv = t => eje === 'neto' ? netoDe(t) : t.monto;
  const xs = ts.map(t => t.cuota), ys = ts.map(yv);
  const xmax = Math.max(2.2, Math.ceil((Math.max(...xs) + .1) * 10) / 10), xmin = 1;
  let ymax = Math.max(1, ...ys) * 1.1, ymin = eje === 'neto' ? Math.min(0, ...ys) * 1.15 : 0;
  const sx = v => L + (W - L - Rr) * (v - xmin) / (xmax - xmin);
  const sy = v => T + (H - T - B) * (1 - (v - ymin) / (ymax - ymin));
  // zonas por tipo de ticket
  const zonas = [[1, 1.25, 'Salva', '53,212,154'], [1.25, 1.55, 'Base', '63,208,255'], [1.55, xmax, 'Riesgo', '255,93,108']]
    .map(([a, b, n, c]) => `<rect x="${sx(a)}" y="${T}" width="${sx(b) - sx(a)}" height="${H - T - B}" fill="rgba(${c},.06)"/>
      <text x="${(sx(a) + sx(b)) / 2}" y="${T - 4}" text-anchor="middle" font-size="9.5" font-weight="800" letter-spacing=".08em" fill="rgba(${c},.85)">${n.toUpperCase()}</text>`).join('');
  // rejilla
  const paso = ymax - ymin > 30 ? 10 : ymax - ymin > 12 ? 5 : ymax - ymin > 5 ? 2 : 1;
  let grid = '';
  for (let v = Math.ceil(ymin / paso) * paso; v <= ymax; v += paso)
    grid += `<line x1="${L}" x2="${W - Rr}" y1="${sy(v)}" y2="${sy(v)}" stroke="#22304f" ${v === 0 ? '' : 'stroke-dasharray="3 4"'}/><text x="${L - 5}" y="${sy(v) + 3.5}" text-anchor="end" font-size="9.5" fill="#5e6b88">${v}</text>`;
  for (let v = 1; v <= xmax + 1e-9; v += .5)
    grid += `<text x="${sx(v)}" y="${H - 9}" text-anchor="middle" font-size="9.5" fill="#5e6b88">${fmt(v, v % 1 ? 1 : 0)}</text>`;
  // puntos: primero los viejos, encima los del último lote
  const ult = S.txUltLote;
  const orden = [...ts].sort((a, b) => (a.lote === ult) - (b.lote === ult));
  const col = { ganada: '#35d49a', perdida: '#ff5d6c', abierta: '#8e9bb8' };
  const pts = orden.map(t => {
    const x = sx(t.cuota).toFixed(1), y = sy(yv(t)).toFixed(1), act = t.lote === ult, sel = txSel === t.nro;
    const relleno = t.estado === 'abierta' ? 'none' : col[t.estado];
    const base = `<circle class="pt" data-n="${t.nro}" cx="${x}" cy="${y}" r="${act ? 6.5 : 5}" fill="${act ? '#f5b841' : relleno}" stroke="${act ? '#ffd27a' : col[t.estado]}" stroke-width="${act ? 2 : 1.6}" fill-opacity="${act ? 1 : .85}"/>`;
    const halo = act ? `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="#f5b841" stroke-width="1.5" opacity=".55"/>` : '';
    const anillo = sel ? `<circle cx="${x}" cy="${y}" r="9.5" fill="none" stroke="#e9eef8" stroke-width="1.6"/>` : '';
    return halo + base + anillo;
  }).join('');
  // etiqueta del lote actual
  const actuales = ts.filter(t => t.lote === ult && ult !== 'precarga');
  let etiq = '';
  if (actuales.length === 1){
    const t = actuales[0], x = sx(t.cuota), y = sy(yv(t)), der = x < W - 90;
    etiq = `<text x="${der ? x + 14 : x - 14}" y="${y - 10}" text-anchor="${der ? 'start' : 'end'}" font-size="10.5" font-weight="900" fill="#f5b841">ACTUAL · ${fmt(t.cuota, 2)} · $${fmt(t.monto)}</text>`;
  }
  // globo del punto tocado
  let globo = '';
  const s = txSel && ts.find(t => t.nro === txSel);
  if (s){
    const x = sx(s.cuota), y = sy(yv(s)), w = 150, h = 50;
    const gx = Math.min(Math.max(L, x - w / 2), W - Rr - w), gy = y - h - 14 < T ? y + 14 : y - h - 14;
    const n = netoDe(s);
    globo = `<g pointer-events="none"><rect x="${gx}" y="${gy}" width="${w}" height="${h}" rx="9" fill="#0b1122" stroke="#2d3d62"/>
      <text x="${gx + 10}" y="${gy + 18}" font-size="11.5" font-weight="800" fill="#e9eef8">@ ${fmt(s.cuota, 3)} · $${fmt(s.monto)} · ${tipoDe(s.cuota)}</text>
      <text x="${gx + 10}" y="${gy + 36}" font-size="11" fill="${s.estado === 'ganada' ? '#35d49a' : s.estado === 'perdida' ? '#ff5d6c' : '#8e9bb8'}">${s.estado === 'abierta' ? 'abierta' : (n > 0 ? '+' : '') + fmt(n)} · ${fechaHora(s.fecha)}</text></g>`;
  }
  return `<svg class="tx-svg" viewBox="0 0 ${W} ${H}">${zonas}${grid}
    <text x="${W - Rr}" y="${H - 1}" text-anchor="end" font-size="9" fill="#5e6b88">cuota →</text>
    <text x="4" y="${T + 2}" font-size="9" fill="#5e6b88">${eje === 'neto' ? 'neto $' : 'monto $'}</text>
    ${pts}${etiq}${globo}</svg>`;
}
function resumenTX(){
  const rs = resueltos(), g = rs.filter(t => t.estado === 'ganada').length;
  const ap = rs.reduce((a, t) => a + t.monto, 0), ne = r2(rs.reduce((a, t) => a + netoDe(t), 0));
  return `<div class="tx-res">
    <div><b class="num">${g}/${rs.length}</b><span>ganados</span></div>
    <div><b class="num">${rs.length ? pct(g / rs.length) : '—'}</b><span>acierto</span></div>
    <div><b class="num ${ne >= 0 ? 'win' : 'loss'}">${moneyS(ne)}</b><span>neto</span></div>
    <div><b class="num ${ne >= 0 ? 'win' : 'loss'}">${ap ? pct(ne / ap, 1) : '—'}</b><span>ROI</span></div></div>`;
}
function tarjetaGrafico(conResumen = true){
  const ab = TX().filter(t => t.estado === 'abierta').length;
  return `<div class="tx-graf" id="txGraf">
    <h2><span>Tus tickets${ab ? ` · <span class="gold">${ab} abierto${ab > 1 ? 's' : ''}</span>` : ''}</span>
      <span class="tx-sel" style="margin:0;width:120px"><button data-e="monto" class="${(S.txCfg.eje || 'monto') === 'monto' ? 'on' : ''}">Monto</button><button data-e="neto" class="${S.txCfg.eje === 'neto' ? 'on' : ''}">Neto</button></span></h2>
    <div id="txSvg">${graficoTX()}</div>
    <div class="tx-ley"><span><i style="background:#35d49a"></i>ganado</span><span><i style="background:#ff5d6c"></i>perdido</span><span><i style="border:1.5px solid #8e9bb8"></i>abierto</span><span><i style="background:#f5b841;box-shadow:0 0 0 3px rgba(245,184,65,.3)"></i>último cargado</span></div>
    </div>${conResumen ? resumenTX() : ''}`;
}
function activarGrafico(root){
  const g = $('#txGraf', root); if (!g) return;
  g.addEventListener('click', e => {
    const b = e.target.closest('[data-e]');
    if (b){ S.txCfg.eje = b.dataset.e; save(); repintarGrafico(root); return; }
    const p = e.target.closest('.pt');
    if (p){
      if (txSel === p.dataset.n){ txSel = null; detalleTicket(p.dataset.n); }
      else txSel = p.dataset.n;
    } else txSel = null;
    $('#txSvg', root).innerHTML = graficoTX();
  });
}
function repintarGrafico(root){
  const g = $('#txGraf', root); if (!g) return;
  const tmp = document.createElement('div'); tmp.innerHTML = tarjetaGrafico(false);
  const nuevo = tmp.firstElementChild; nuevo.style.cssText = g.style.cssText;
  g.replaceWith(nuevo); activarGrafico(root);
}

// ---------- vista TICKETS ----------
let txFiltro = 'todos';
function renderTix(){
  const ts = TX(), cfg = S.txCfg, ult = S.txUltLote;
  const lista = [...ts].filter(t => txFiltro === 'todos' || t.estado === txFiltro).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const v = $('#v-tix');
  v.innerHTML = `
  ${tarjetaGrafico(true)}
  <div class="card">
    <label class="tx-subir" for="txArch">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="3.6"/></svg>
      <div><b>Cargar capturas del historial</b><span>Elige una o varias. Los repetidos se descartan solos.</span></div>
    </label>
    <input type="file" id="txArch" accept="image/*" multiple hidden>
    <div id="txProg" style="display:none"><div class="hint" id="txProgT">Preparando el lector…</div><div class="tx-barra"><i id="txProgB"></i></div></div>
    <button class="lnk" style="margin-top:12px" id="txMano">+ Cargar un ticket a mano</button>
  </div>

  <div class="card">
    <div class="row" style="justify-content:space-between"><h2 style="margin:0">Boletos</h2><span class="dim" style="font-size:12px">${ts.length} en total</span></div>
    <div class="tx-sel" style="margin:10px 0 2px">${['todos', 'abierta', 'ganada', 'perdida'].map(f => `<button data-f="${f}" class="${txFiltro === f ? 'on' : ''}">${{todos: 'Todos', abierta: 'Abiertos', ganada: 'Ganados', perdida: 'Perdidos'}[f]}</button>`).join('')}</div>
    <div>${lista.length ? lista.map(t => filaTicket(t, t.lote === ult && ult !== 'precarga')).join('') : '<div class="muted" style="padding:10px 0">Nada por aquí.</div>'}</div>
    <div class="hint">Toca un boleto para ver sus partidos, la cuota de cierre y programar el aviso.</div>
  </div>

  ${patronesHTML()}

  <div class="card"><h2>Aviso de cuota de cierre</h2>
    <div class="muted" style="font-size:13px">Cuando cargas los partidos de un boleto con su hora, la app programa una alarma en MATRIX Alertas para que captures la cuota antes del pitazo.</div>
    <label class="f" style="margin-top:12px">Canal de MATRIX Alertas</label>
    <input class="inp sm" id="txCanal" value="${esc(cfg.canal)}" placeholder="el mismo canal del vigilante" autocomplete="off" autocapitalize="off" spellcheck="false">
    <div class="grid2" style="margin-top:10px">
      <div><label class="f">Minutos antes</label><input class="inp sm num" id="txMin" inputmode="numeric" value="${cfg.minAntes}"></div>
      <div><label class="f">Servidor</label><input class="inp sm" id="txServ" value="${esc(cfg.servidor)}" autocapitalize="off"></div>
    </div>
    <button class="btn sec sm" style="margin-top:12px" id="txProbar">Mandar aviso de prueba</button>
    <div class="hint">El canal se guarda solo en este teléfono y en tus respaldos.</div>
  </div>`;

  activarGrafico(v);
  const hd = $('header.top'), gr = $('#txGraf', v);
  if (hd && gr) gr.style.top = (hd.offsetHeight - 6) + 'px';
  $('#txArch').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) leerCapturas(fs); };
  $('#txMano').onclick = () => ticketAMano();
  $$('#v-tix .tx-sel [data-f]').forEach(b => b.onclick = () => { txFiltro = b.dataset.f; renderTix(); });
  $$('#v-tix .tx-it').forEach(el => el.onclick = () => detalleTicket(el.dataset.n));
  const guardaCfg = () => {
    cfg.canal = $('#txCanal').value.trim(); cfg.servidor = ($('#txServ').value.trim() || 'https://ntfy.sh').replace(/\/+$/, '');
    const m = parseNum($('#txMin').value); cfg.minAntes = m >= 0 && m <= 240 ? m : 10; save();
  };
  ['txCanal', 'txMin', 'txServ'].forEach(id => $('#' + id).addEventListener('change', guardaCfg));
  $('#txProbar').onclick = async () => { guardaCfg(); const ok = await mandarAviso('Prueba Sin Límites', 'Si ves esto, los avisos de cuota de cierre funcionan.', null); toast(ok ? 'Aviso enviado ✓' : '⚠ No salió. Revisa el canal y la señal.'); };
}
function filaTicket(t, actual){
  const n = netoDe(t), tp = tipoDe(t.cuota), cl = clvTicket(t);
  const parts = (t.partidos || []).map(p => p.partido).filter(Boolean);
  return `<div class="tx-it ${actual ? 'actual' : ''}" data-n="${t.nro}">
    <div class="tx-dot ${t.estado}">${t.legs || 1}x</div>
    <div style="min-width:0"><div style="font-weight:800"><span class="num">@ ${fmt(t.cuota, 3)}</span> <span class="tx-tipo ${tp}">${tp.toUpperCase()}</span>${actual ? ' <span class="tx-nuevo">ACTUAL</span>' : ''}</div>
      <div class="dim" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${fechaHora(t.fecha)} · ${money(t.monto)}${parts.length ? ' · ' + esc(parts.join(' / ')) : ''}${cl !== null ? ` · <span class="${cl >= 0 ? 'win' : 'loss'}">cierre ${cl >= 0 ? '▼' : '▲'}${pct(Math.abs(cl), 1)}</span>` : ''}</div></div>
    <div style="text-align:right"><b class="num ${n > 0 ? 'win' : n < 0 ? 'loss' : 'dim'}">${t.estado === 'abierta' ? 'abierta' : moneyS(n)}</b></div></div>`;
}

// ---------- patrones ----------
function filaStats(nombre, arr){
  if (!arr.length) return '';
  const g = arr.filter(t => t.estado === 'ganada').length, ap = arr.reduce((a, t) => a + t.monto, 0), ne = r2(arr.reduce((a, t) => a + netoDe(t), 0));
  return `<tr><td>${nombre}</td><td class="num">${g}/${arr.length}</td><td class="num">${pct(g / arr.length)}</td><td class="num">${money(r2(ap / arr.length))}</td><td class="num ${ne >= 0 ? 'win' : 'loss'}">${moneyS(ne)}</td><td class="num ${ne >= 0 ? 'win' : 'loss'}">${pct(ne / ap)}</td></tr>`;
}
function patronesHTML(){
  const rs = resueltos();
  if (rs.length < 3) return '';
  const cab = '<tr><th></th><th>Gan.</th><th>%</th><th>Monto</th><th>Neto</th><th>ROI</th></tr>';
  const porTipo = ['Salva', 'Base', 'Riesgo'].map(n => filaStats(`<span class="tx-tipo ${n}">${n.toUpperCase()}</span>`, rs.filter(t => tipoDe(t.cuota) === n))).join('');
  const tramos = [[1, 1.25], [1.25, 1.45], [1.45, 1.65], [1.65, 1.85], [1.85, 99]];
  const porCuota = tramos.map(([a, b]) => filaStats(b > 50 ? `${fmt(a)}+` : `${fmt(a)}–${fmt(b)}`, rs.filter(t => t.cuota >= a && t.cuota < b))).join('');
  const porLegs = [1, 2, 3].map(l => filaStats(l === 1 ? 'Simple' : l === 3 ? '3 o más' : 'Doble', rs.filter(t => l === 3 ? (t.legs || 1) >= 3 : (t.legs || 1) === l))).join('');
  const conClv = rs.filter(t => clvTicket(t) !== null);
  const clvHTML = conClv.length
    ? `<table class="tx-tab">${cab}${filaStats('Cuota bajó ▼', conClv.filter(t => clvTicket(t) > 0.005))}${filaStats('Igual', conClv.filter(t => Math.abs(clvTicket(t)) <= 0.005))}${filaStats('Cuota subió ▲', conClv.filter(t => clvTicket(t) < -0.005))}</table>
       <div class="hint">CLV promedio: <b class="${conClv.reduce((a, t) => a + clvTicket(t), 0) >= 0 ? 'win' : 'loss'}">${pct(conClv.reduce((a, t) => a + clvTicket(t), 0) / conClv.length, 1)}</b> en ${conClv.length} boletos. Si tus boletos le ganan a la cuota de cierre de forma constante, la ventaja es real.</div>`
    : '<div class="muted" style="font-size:13px">Aún no hay boletos con cuota de cierre. Abre un boleto, carga sus partidos y la cuota justo antes del pitazo.</div>';
  // racha y unidad típica
  const ord = [...rs].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
  let racha = 0; for (let i = ord.length - 1; i >= 0 && ord[i].estado === 'ganada'; i--) racha++;
  let peor = 0, c = 0; ord.forEach(t => { if (t.estado === 'perdida'){ c++; peor = Math.max(peor, c); } else c = 0; });
  const med = arr => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const uRiesgo = med(rs.filter(t => tipoDe(t.cuota) !== 'Salva').map(t => t.monto));
  const uSalva = med(rs.filter(t => tipoDe(t.cuota) === 'Salva').map(t => t.monto));
  const perdidas = rs.filter(t => t.estado === 'perdida');
  return `<div class="card"><h2>Patrones</h2>
    <table class="tx-tab">${cab}${porTipo}</table>
    <div class="sep"></div><div class="caps" style="margin-bottom:6px">Por cuota</div><table class="tx-tab">${cab}${porCuota}</table>
    <div class="sep"></div><div class="caps" style="margin-bottom:6px">Por partidos</div><table class="tx-tab">${cab}${porLegs}</table>
    <div class="sep"></div><div class="caps" style="margin-bottom:6px">Movimiento de cuota (dinero inteligente)</div>${clvHTML}
    <div class="sep"></div>
    <div class="kv"><span>Monto típico Base/Riesgo</span><b class="num">${money(uRiesgo)}</b></div>
    <div class="kv"><span>Monto típico Salva</span><b class="num">${money(uSalva)}</b></div>
    <div class="kv"><span>Racha actual ganando</span><b class="num">${racha}</b></div>
    <div class="kv"><span>Peor racha perdiendo</span><b class="num">${peor}</b></div>
    ${perdidas.length ? `<div class="kv"><span>Cuota media de las pérdidas</span><b class="num loss">${fmt(perdidas.reduce((a, t) => a + t.cuota, 0) / perdidas.length, 2)}</b></div>` : ''}
    <div class="hint">Con pocos boletos estos números se mueven mucho. Míralos como pistas, no como reglas, hasta pasar los 100.</div></div>`;
}

// ---------- lector de capturas ----------
let ocrWorker = null;
function cargarScript(src){ return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('no cargó ' + src)); document.head.appendChild(s); }); }
async function lector(onProg){
  if (ocrWorker) return ocrWorker;
  if (!window.Tesseract) await cargarScript('ocr/tesseract.min.js');
  ocrWorker = await Tesseract.createWorker('eng', 1, {
    workerPath: 'ocr/worker.min.js', corePath: 'ocr/', langPath: 'ocr/', gzip: true, workerBlobURL: false,
    logger: m => { if (onProg && m.progress != null) onProg(m.status, m.progress); }
  });
  await ocrWorker.setParameters({ tessedit_pageseg_mode: '4' });
  return ocrWorker;
}
// agranda, pasa a gris y limpia el fondo: así lee hasta las fechas en gris claro
// modo 'claro': texto oscuro sobre fondo claro (la lista); 'oscuro': texto blanco sobre fondo azul (la cabecera del detalle)
function prepararImagen(file, modo = 'claro'){
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(2, 1600 / img.width), w = Math.round(img.width * k), h = Math.round(img.height * k);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(img, 0, 0, w, h);
      const d = cx.getImageData(0, 0, w, h), px = d.data;
      for (let i = 0; i < px.length; i += 4){ const g = .299 * px[i] + .587 * px[i + 1] + .114 * px[i + 2], v = modo === 'oscuro' ? 255 - g : (g < 200 ? 0 : 255); px[i] = px[i + 1] = px[i + 2] = v; }
      cx.putImageData(d, 0, 0); URL.revokeObjectURL(url);
      if (modo !== 'oscuro') return ok(cv);
      // solo la franja de arriba con fondo oscuro (ya invertida, ahora es clara): ahí vienen el N.º y la fecha
      // termina donde empieza la hoja blanca (invertida queda casi negra)
      let fin = 0;
      for (let y = Math.round(h * .05); y < h * .8; y += 4){
        let s = 0; for (let x = 0; x < w; x += 8) s += px[(y * w + x) * 4];
        if (s / Math.ceil(w / 8) < 60){ fin = y; break; }
      }
      if (fin < 80) return ok(cv);
      const c2 = document.createElement('canvas'); c2.width = w; c2.height = Math.min(h, fin + 20);
      c2.getContext('2d').drawImage(cv, 0, 0); ok(c2);
    };
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('imagen')); };
    img.src = url;
  });
}
async function leerCapturas(files){
  const box = $('#txProg'), bar = $('#txProgB'), txt = $('#txProgT');
  if (box) box.style.display = 'block';
  const prog = (i, s, p) => { if (bar) bar.style.width = ((i + (p || 0)) / files.length * 100) + '%'; if (txt) txt.textContent = s; };
  try {
    prog(0, 'Preparando el lector (la primera vez baja unos 7 MB)…', 0);
    const w = await lector((st, p) => { if (st && /load|init/i.test(st) && txt) txt.textContent = 'Preparando el lector… ' + Math.round(p * 100) + '%'; });
    const listas = [];
    for (let i = 0; i < files.length; i++){
      prog(i, `Leyendo captura ${i + 1} de ${files.length}…`, 0.1);
      const textos = [(await w.recognize(await prepararImagen(files[i], 'claro'))).data.text];
      let ts = Lector.leerCaptura(textos);
      // pantalla de detalle: el N.º y la fecha vienen en blanco sobre azul → segunda lectura
      if (!ts.length || ts.some(t => !t.completo)){
        prog(i, `Leyendo captura ${i + 1} de ${files.length} (2ª pasada)…`, 0.5);
        textos.push((await w.recognize(await prepararImagen(files[i], 'oscuro'))).data.text);
        ts = Lector.leerCaptura(textos);
      }
      listas.push(ts);
      prog(i + 1, `Leída ${i + 1} de ${files.length}`, 0);
    }
    if (box) box.style.display = 'none';
    const { tickets } = Lector.unir(listas);
    if (!tickets.length){ toast('No encontré boletos en esas capturas'); return; }
    revisarLote(tickets);
  } catch (err){
    if (box) box.style.display = 'none';
    console.error(err);
    toast('⚠ El lector no arrancó. Abre la app con internet la primera vez.', 4000);
  }
}
function revisarLote(nuevos){
  const ts = TX();
  const items = nuevos.map(n => {
    const ya = ts.find(t => Lector.mismo(t, n));
    let accion = 'nuevo';
    if (ya){
      if (ya.estado === 'abierta' && n.estado && n.estado !== 'abierta') accion = 'resultado';
      else if ((ya.monto == null && n.monto != null) || (!(ya.partidos || []).length && (n.partidos || []).length)) accion = 'completa';
      else accion = 'ya';
    }
    return { n, ya, accion, usar: accion !== 'ya' };
  }).sort((a, b) => (a.accion === 'ya') - (b.accion === 'ya') || (b.n.fecha || '').localeCompare(a.n.fecha || ''));
  const cuenta = k => items.filter(i => i.accion === k).length;
  const fila = (it, i) => {
    const t = it.n, mal = !t.completo && it.accion === 'nuevo';
    const etiqueta = { nuevo: '<span class="tx-nuevo">NUEVO</span>', resultado: '<span class="badge ganan">TRAE RESULTADO</span>', completa: '<span class="badge prot">COMPLETA DATOS</span>', ya: '<span class="badge noaposte">YA ESTABA</span>' }[it.accion];
    return `<div class="tx-rev ${mal ? 'mal' : ''} ${it.accion === 'ya' ? 'ya' : ''}" data-i="${i}">
      <div class="row" style="justify-content:space-between"><div>${etiqueta} <span class="dim num" style="font-size:12px">N.º ${esc(t.nro || '—')}</span></div>
        ${it.accion !== 'ya' ? `<label style="font-size:12px;color:var(--muted);display:flex;gap:6px;align-items:center"><input type="checkbox" class="rUsar" ${it.usar ? 'checked' : ''}> guardar</label>` : ''}</div>
      <div class="dim" style="font-size:12px;margin:4px 0 8px">${t.fecha ? fechaHora(t.fecha) : '<span class="loss">sin fecha</span>'} · ${t.legs || 1} partido${(t.legs || 1) > 1 ? 's' : ''}${(t.partidos || []).length ? '' : t.partido ? ' · ' + esc(t.partido) : ''}</div>
      ${it.accion !== 'ya' && (t.partidos || []).length ? t.partidos.map(p => `<div class="tx-part" style="padding:8px 10px;margin:0 0 6px"><div class="row" style="justify-content:space-between"><b style="font-size:13px">${esc(p.partido)}</b><b class="num" style="font-size:13px">${p.cuota ? fmt(p.cuota, 2) : ''}</b></div><div class="dim" style="font-size:11.5px">${esc(p.mercado || '')}${p.liga ? ' · ' + esc(p.liga) : ''}${p.hora ? ' · juega ' + fechaHora(p.hora) : ''}</div></div>`).join('') : ''}
      ${it.accion === 'ya' ? '' : `<div class="grid3">
        <div><label class="f">Cuota</label><input class="inp num rC" inputmode="decimal" value="${t.cuota ?? ''}"></div>
        <div><label class="f">Monto</label><input class="inp num rM" inputmode="decimal" value="${t.monto ?? ''}"></div>
        <div><label class="f">Estado</label><select class="inp rE" style="font-size:14px;padding:9px 6px">${['abierta', 'ganada', 'perdida'].map(e => `<option ${t.estado === e ? 'selected' : ''} value="${e}">${e}</option>`).join('')}</select></div></div>
        ${it.accion === 'nuevo' && !t.fecha ? `<label class="f" style="margin-top:8px">Fecha y hora</label><input class="inp sm rF" type="datetime-local">` : ''}`}
      ${it.accion !== 'ya' && (t.avisos || []).length ? `<div class="hint" style="color:${mal ? 'var(--loss)' : 'var(--dim)'}">${t.avisos.map(esc).join(' · ')}</div>` : ''}
    </div>`;
  };
  modal(`<h3>Lo que leí</h3>
    <div class="muted" style="font-size:13px;margin-bottom:6px">${cuenta('nuevo')} nuevo${cuenta('nuevo') !== 1 ? 's' : ''} · ${cuenta('resultado')} con resultado · ${cuenta('completa')} completa${cuenta('completa') !== 1 ? 'n' : ''} datos · ${cuenta('ya')} repetido${cuenta('ya') !== 1 ? 's' : ''}. Revisa los marcados en rojo antes de guardar.</div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:8px 0"><input type="checkbox" id="rMotor" checked> Estos boletos salieron del motor</label>
    ${items.some(it => it.accion !== 'ya' && (it.n.partidos || []).some(p => p.hora && new Date(p.hora).getTime() > Date.now())) ? `<label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:8px 0"><input type="checkbox" id="rAviso" ${S.txCfg.canal ? 'checked' : 'disabled'}> Avisarme ${S.txCfg.minAntes} min antes de cada partido para la cuota de cierre${S.txCfg.canal ? '' : ' <span class="dim">(falta el canal, abajo en Tickets)</span>'}</label>` : ''}
    ${items.map((it, i) => it.accion === 'ya' ? '' : fila(it, i)).join('')}
    ${cuenta('ya') ? `<details style="margin:10px 0"><summary>${cuenta('ya')} que ya estaban guardados</summary>${items.map((it, i) => it.accion === 'ya' ? fila(it, i) : '').join('')}</details>` : ''}
    <button class="btn" id="rGuardar" style="margin-top:8px">Guardar</button>`, ov => {
    $('#rGuardar', ov).onclick = () => {
      const lote = 'L' + Date.now().toString(36), motor = $('#rMotor', ov).checked, avisar = !!($('#rAviso', ov) && $('#rAviso', ov).checked);
      const paraAvisar = [];
      const partidosDe = (it, cuota) => (it.n.partidos || []).map(p => ({ partido: p.partido, liga: p.liga || '', mercado: p.mercado || '', cuota: p.cuota || ((it.n.legs || 1) === 1 ? cuota : null), hora: p.hora || null }));
      let n = 0, errores = 0;
      items.forEach((it, i) => {
        const el = $(`.tx-rev[data-i="${i}"]`, ov);
        if (it.accion === 'ya' || !$('.rUsar', el).checked) return;
        const cuota = parseNum($('.rC', el).value), monto = parseNum($('.rM', el).value), estado = $('.rE', el).value;
        const fF = $('.rF', el), fecha = it.n.fecha || (fF && fF.value) || null;
        if (!(cuota > 1) || !(monto > 0) || !fecha){ errores++; el.classList.add('mal'); return; }
        const cobro = estado === 'ganada' ? (Math.abs((it.n.cobro || 0) - monto * cuota) <= .06 ? it.n.cobro : r2(monto * cuota)) : estado === 'perdida' ? 0 : null;
        if (it.ya){
          const t = it.ya, antes = { estado: t.estado, monto: t.monto, cobro: t.cobro };
          t.estado = estado; t.monto = monto; t.cobro = cobro; t.cuota = cuota; t.lote = lote;
          if ((it.n.partidos || []).length && !(t.partidos || []).length) t.partidos = partidosDe(it, cuota);
          if (avisar) paraAvisar.push(t);
          (t.cambios = t.cambios || []).push({ cuando: new Date().toISOString(), por: 'captura', antes });
        } else {
          S.tickets.push({ nro: it.n.nro || 'M' + Date.now().toString(36) + i, fecha, legs: it.n.legs || 1, cuota, monto, cobro, estado, motor,
            partidos: partidosDe(it, cuota), origen: 'captura', lote, registrado: new Date().toISOString() });
          if (avisar) paraAvisar.push(S.tickets[S.tickets.length - 1]);
        }
        n++;
      });
      if (errores){ toast(`Faltan datos en ${errores} boleto${errores > 1 ? 's' : ''} (en rojo)`); return; }
      if (n){ S.txUltLote = lote; save(); }
      ov.remove(); txSel = null; render();
      toast(n ? `${n} boleto${n > 1 ? 's' : ''} guardado${n > 1 ? 's' : ''} ✓` : 'No había nada nuevo');
      if (paraAvisar.length) programarAvisos(paraAvisar);
    };
  });
}
function ticketAMano(){
  const ahora = new Date(); ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  modal(`<h3>Boleto a mano</h3>
    <div class="grid2"><div><label class="f">N.º de boleto</label><input class="inp sm num" id="hN" inputmode="numeric"></div>
      <div><label class="f">Fecha y hora</label><input class="inp sm" id="hF" type="datetime-local" value="${ahora.toISOString().slice(0, 16)}"></div></div>
    <div class="grid3" style="margin-top:10px"><div><label class="f">Partidos</label><input class="inp sm num" id="hL" inputmode="numeric" value="2"></div>
      <div><label class="f">Cuota</label><input class="inp sm num" id="hC" inputmode="decimal"></div>
      <div><label class="f">Monto</label><input class="inp sm num" id="hM" inputmode="decimal"></div></div>
    <label class="f" style="margin-top:10px">Estado</label>
    <select class="inp sm" id="hE"><option value="abierta">Abierta</option><option value="ganada">Ganada</option><option value="perdida">Perdida</option></select>
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:12px 0"><input type="checkbox" id="hMo" checked> Salió del motor</label>
    <button class="btn" id="hG">Guardar boleto</button>`, ov => {
    $('#hG', ov).onclick = () => {
      const nro = $('#hN', ov).value.replace(/\D/g, ''), cuota = parseNum($('#hC', ov).value), monto = parseNum($('#hM', ov).value), estado = $('#hE', ov).value, fecha = $('#hF', ov).value;
      if (!(cuota > 1) || !(monto > 0) || !fecha) return toast('Faltan cuota, monto o fecha');
      if (nro && TX().some(t => t.nro === nro)) return toast('Ese N.º ya está registrado');
      const lote = 'L' + Date.now().toString(36);
      S.tickets.push({ nro: nro || 'M' + Date.now().toString(36), fecha, legs: Math.max(1, parseInt($('#hL', ov).value) || 1), cuota, monto,
        cobro: estado === 'ganada' ? r2(monto * cuota) : estado === 'perdida' ? 0 : null, estado, motor: $('#hMo', ov).checked, partidos: [], origen: 'mano', lote, registrado: new Date().toISOString() });
      S.txUltLote = lote; save(); ov.remove(); render(); toast('Boleto guardado ✓');
    };
  });
}

// ---------- detalle de un boleto ----------
function detalleTicket(nro){
  const t = TX().find(x => x.nro === nro); if (!t) return;
  t.partidos = t.partidos || [];
  const n = netoDe(t), tp = tipoDe(t.cuota), cl = clvTicket(t);
  const probT = t.partidos.length && t.partidos.every(p => p.prob > 0) ? t.partidos.reduce((a, p) => a * p.prob / 100, 1) : null;
  const filaP = (p, i) => {
    const c = clvDe(p), min = p.prob > 0 ? 100 / p.prob : null;
    return `<div class="tx-part" data-i="${i}">
      <div class="row" style="justify-content:space-between"><b style="font-size:14px">${esc(p.partido || 'Partido ' + (i + 1))}</b><span class="dim" style="font-size:12px">${esc(p.mercado || '')}</span></div>
      <div class="dim" style="font-size:12px;margin-top:2px">${p.hora ? 'Juega ' + fechaHora(p.hora) : 'sin hora'}${p.liga ? ' · ' + esc(p.liga) : ''}${p.aviso ? ' · ⏰ aviso programado' : ''}</div>
      <div class="grid3" style="margin-top:8px">
        <div><label class="f">Cuota</label><input class="inp sm num pC" inputmode="decimal" value="${p.cuota ?? ''}"></div>
        <div><label class="f">Cierre</label><input class="inp sm num pK" inputmode="decimal" value="${p.cierre ?? ''}" placeholder="antes del pitazo"></div>
        <div><label class="f">Prob. motor %</label><input class="inp sm num pP" inputmode="decimal" value="${p.prob ?? ''}"></div></div>
      <div style="font-size:12.5px;margin-top:6px">
        ${min ? `Cuota mínima <b class="num">${fmt(min, 2)}</b> · ${p.cuota >= min ? `<span class="win">con valor (+${pct(p.cuota / min - 1, 1)})</span>` : `<span class="loss">sin valor (${pct(p.cuota / min - 1, 1)})</span>`}` : ''}
        ${c !== null ? `${min ? ' · ' : ''}Cuota ${c >= 0 ? `<b class="win">bajó ${pct(c, 1)} ▼ a tu favor</b>` : `<b class="loss">subió ${pct(-c, 1)} ▲ en contra</b>`}` : ''}</div>
    </div>`;
  };
  modal(`<div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><div class="caps">Boleto ${esc(t.nro)}</div><h3 style="margin:4px 0 0" class="num">@ ${fmt(t.cuota, 3)} · ${money(t.monto)}</h3></div>
      <span class="tx-tipo ${tp}" style="margin-top:4px">${tp.toUpperCase()}</span></div>
    <div class="dim" style="font-size:12.5px;margin:4px 0 10px">${fechaHora(t.fecha)} · ${t.legs || 1} partido${(t.legs || 1) > 1 ? 's' : ''} · ${t.motor === false ? 'fuera del motor' : 'del motor'}${t.origen === 'precarga' ? ' · precargado' : ''}</div>
    <div class="kv"><span>Resultado</span><b class="num ${n > 0 ? 'win' : n < 0 ? 'loss' : ''}">${t.estado === 'abierta' ? 'abierto' : t.estado + ' · ' + moneyS(n)}</b></div>
    ${probT ? `<div class="kv"><span>Prob. del motor (boleto)</span><b class="num">${pct(probT, 1)} · mín. ${fmt(1 / probT, 2)}</b></div><div class="kv"><span>Valor esperado</span><b class="num ${probT * t.cuota - 1 >= 0 ? 'win' : 'loss'}">${moneyS(r2(t.monto * (probT * t.cuota - 1)))}</b></div>` : ''}
    ${cl !== null ? `<div class="kv"><span>Movimiento de cuota (CLV)</span><b class="num ${cl >= 0 ? 'win' : 'loss'}">${cl >= 0 ? '+' : ''}${pct(cl, 1)}</b></div>` : ''}
    ${t.estado === 'abierta' ? `<div class="res" style="grid-template-columns:1fr 1fr;margin-top:12px"><button class="rbtn ganan" id="dG">${RES_IC.ganan} Ganó</button><button class="rbtn pierden" id="dP">${RES_IC.pierden} Perdió</button></div>` : ''}

    <div class="sep"></div>
    <div class="row" style="justify-content:space-between"><b>Partidos</b><button class="lnk" id="dAdd">+ Agregar partido</button></div>
    <div id="dParts">${t.partidos.length ? t.partidos.map(filaP).join('') : '<div class="muted" style="font-size:13px;padding:6px 0">Sin partidos. Agrégalos para seguir la cuota y recibir el aviso antes del pitazo.</div>'}</div>
    ${t.partidos.length ? '<button class="btn sm" id="dGuardar" style="margin-top:12px">Guardar cuotas</button>' : ''}
    ${t.estado !== 'abierta' ? '<button class="lnk" style="margin-top:14px;color:var(--muted)" id="dCorr">Corregir este boleto…</button>' : ''}
    ${(t.cambios || []).length ? `<details style="margin-top:10px"><summary>Historial de cambios (${t.cambios.length})</summary><div class="hint">${t.cambios.map(c => `${fechaHora(c.cuando)} · ${esc(c.por)}${c.motivo ? ': ' + esc(c.motivo) : ''}`).join('<br>')}</div></details>` : ''}`, ov => {
    const cerrar = () => { ov.remove(); render(); };
    const resolver = est => { (t.cambios = t.cambios || []).push({ cuando: new Date().toISOString(), por: 'a mano', antes: { estado: t.estado } }); t.estado = est; t.cobro = est === 'ganada' ? r2(t.monto * t.cuota) : 0; S.txUltLote = t.lote = 'L' + Date.now().toString(36); save(); cerrar(); toast('Resultado guardado ✓'); };
    if ($('#dG', ov)) $('#dG', ov).onclick = () => resolver('ganada');
    if ($('#dP', ov)) $('#dP', ov).onclick = () => resolver('perdida');
    $('#dAdd', ov).onclick = () => { ov.remove(); agregarPartido(t); };
    if ($('#dGuardar', ov)) $('#dGuardar', ov).onclick = () => {
      $$('.tx-part', ov).forEach(el => {
        const p = t.partidos[+el.dataset.i], c = parseNum($('.pC', el).value), k = parseNum($('.pK', el).value), pr = parseNum($('.pP', el).value);
        p.cuota = c > 1 ? c : p.cuota; p.cierre = k > 1 ? k : null; p.prob = pr > 0 && pr <= 100 ? pr : null;
        if (p.cierre && !p.cierreCuando) p.cierreCuando = new Date().toISOString();
      });
      save(); ov.remove(); detalleTicket(nro); toast('Cuotas guardadas ✓');
    };
    if ($('#dCorr', ov)) $('#dCorr', ov).onclick = () => { ov.remove(); corregirTicket(t); };
  });
}
function agregarPartido(t){
  modal(`<h3>Agregar partido</h3>
    <label class="f">Partido</label><input class="inp sm" id="aP" placeholder="Local - Visitante">
    <div class="grid2" style="margin-top:10px"><div><label class="f">Mercado</label><select class="inp sm" id="aM">${['Under 2.5', 'Under 3.5', 'Under 4.5', 'Under 1.5', 'Otro'].map(m => `<option>${m}</option>`).join('')}</select></div>
      <div><label class="f">Cuota al apostar</label><input class="inp sm num" id="aC" inputmode="decimal"></div></div>
    <div class="grid2" style="margin-top:10px"><div><label class="f">Hora del partido</label><input class="inp sm" id="aH" type="datetime-local"></div>
      <div><label class="f">Prob. motor %</label><input class="inp sm num" id="aPr" inputmode="decimal" placeholder="opcional"></div></div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:12px 0"><input type="checkbox" id="aAv" ${S.txCfg.canal ? 'checked' : 'disabled'}> Avisarme ${S.txCfg.minAntes} min antes para capturar la cuota de cierre${S.txCfg.canal ? '' : ' <span class="dim">(configura el canal abajo en Tickets)</span>'}</label>
    <button class="btn" id="aG">Agregar</button>`, ov => {
    $('#aG', ov).onclick = async () => {
      const p = { partido: $('#aP', ov).value.trim(), mercado: $('#aM', ov).value, cuota: parseNum($('#aC', ov).value), hora: $('#aH', ov).value || null, prob: parseNum($('#aPr', ov).value) };
      if (!p.partido || !(p.cuota > 1)) return toast('Falta el partido o la cuota');
      if (!(p.prob > 0 && p.prob <= 100)) p.prob = null;
      t.partidos.push(p); save();
      if ($('#aAv', ov).checked && p.hora){
        const cuando = new Date(p.hora).getTime() - S.txCfg.minAntes * 60000;
        if (cuando > Date.now() + 60000){
          const ok = await mandarAviso('Cuota de cierre', `${p.partido} · ${p.mercado} @ ${fmt(p.cuota, 2)}. Captura la cuota ahora y cárgala en el boleto ${t.nro}.`, cuando);
          p.aviso = ok; save(); toast(ok ? '⏰ Aviso programado' : '⚠ No se pudo programar el aviso');
        } else toast('El partido ya está muy cerca para programar aviso');
      }
      ov.remove(); detalleTicket(t.nro);
    };
  });
}
function corregirTicket(t){
  modal(`<h3>Corregir boleto</h3>
    <div class="muted" style="font-size:13px">Los boletos no se borran. Si el lector se equivocó, corrígelo aquí y queda anotado en su historial.</div>
    <div class="grid3" style="margin-top:10px"><div><label class="f">Cuota</label><input class="inp sm num" id="cC" inputmode="decimal" value="${t.cuota}"></div>
      <div><label class="f">Monto</label><input class="inp sm num" id="cM" inputmode="decimal" value="${t.monto}"></div>
      <div><label class="f">Estado</label><select class="inp sm" id="cE">${['abierta', 'ganada', 'perdida'].map(e => `<option ${t.estado === e ? 'selected' : ''}>${e}</option>`).join('')}</select></div></div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin:12px 0"><input type="checkbox" id="cMo" ${t.motor !== false ? 'checked' : ''}> Salió del motor</label>
    <label class="f">Motivo</label><input class="inp sm" id="cMot" placeholder="Ej. el lector leyó mal el monto">
    <button class="btn" id="cG" style="margin-top:12px">Guardar corrección</button>`, ov => {
    $('#cG', ov).onclick = () => {
      const c = parseNum($('#cC', ov).value), m = parseNum($('#cM', ov).value), e = $('#cE', ov).value, mot = $('#cMot', ov).value.trim();
      if (!(c > 1) || !(m > 0)) return toast('Cuota o monto no válidos');
      if (!mot) return toast('Escribe el motivo');
      (t.cambios = t.cambios || []).push({ cuando: new Date().toISOString(), por: 'corrección', motivo: mot, antes: { cuota: t.cuota, monto: t.monto, estado: t.estado, motor: t.motor } });
      t.cuota = c; t.monto = m; t.estado = e; t.motor = $('#cMo', ov).checked; t.cobro = e === 'ganada' ? r2(m * c) : e === 'perdida' ? 0 : null;
      save(); ov.remove(); detalleTicket(t.nro); toast('Corregido ✓');
    };
  });
}

// programa la alarma de cuota de cierre de cada partido que todavía no empieza
async function programarAvisos(tickets){
  let ok = 0, mal = 0;
  for (const t of tickets) for (const p of (t.partidos || [])){
    if (!p.hora || p.aviso) continue;
    const cuando = new Date(p.hora).getTime() - S.txCfg.minAntes * 60000;
    if (cuando < Date.now() + 60000) continue;
    const r = await mandarAviso('Cuota de cierre', `${p.partido} · ${p.mercado || ''} @ ${p.cuota ? fmt(p.cuota, 2) : '?'}. Captura la cuota ahora y cárgala en el boleto ${t.nro}.`, cuando);
    if (r){ p.aviso = true; ok++; } else mal++;
  }
  if (ok || mal){ save(); toast(mal ? `⚠ ${mal} aviso${mal > 1 ? 's' : ''} no salió` : `⏰ ${ok} aviso${ok > 1 ? 's' : ''} programado${ok > 1 ? 's' : ''}`); }
}

// ---------- aviso a MATRIX Alertas (ntfy) ----------
async function mandarAviso(titulo, texto, cuandoMs){
  const c = S.txCfg; if (!c.canal) return false;
  const cuerpo = { topic: c.canal, title: titulo, message: texto, priority: 5, tags: ['alarm_clock'] };
  if (cuandoMs) cuerpo.delay = String(Math.floor(cuandoMs / 1000));
  try { const r = await fetch(c.servidor || 'https://ntfy.sh', { method: 'POST', body: JSON.stringify(cuerpo) }); return r.ok; }
  catch (e){ return false; }
}

// ---------- integración con la pestaña HOY ----------
// boletos de un día: sirven para cerrar el día con el neto real
const ticketsDelDia = iso => TX().filter(t => (t.fecha || '').slice(0, 10) === iso && t.motor !== false);
function hoyTicketsHTML(){
  return tarjetaGrafico(false).replace('class="tx-graf"', 'class="tx-graf" style="position:static"');
}
function pintarHoyTix(){
  const h = $('#hoyTix'); if (!h) return;
  h.innerHTML = hoyTicketsHTML();
  activarGrafico(h);
}
// en la jugada: probabilidad del motor → cuota mínima y valor esperado; y usar el neto de los boletos del día
function motorJugada(j, sp, S0){
  const box = $('#jMotor'); if (!box) return;
  const b = R.borr || {};
  const pA = parseNum(b.pA), pB = parseNum(b.pB);
  let info = '';
  if (sp && pA > 0 && pA <= 100){
    const a = pA / 100, bb = pB > 0 && pB <= 100 ? Math.max(a, pB / 100) : null;
    info += `<div class="kv"><span>Cuota mínima A (U2.5)</span><b class="num ${j.cR >= 1 / a ? 'win' : 'loss'}">${fmt(1 / a, 2)} ${j.cR >= 1 / a ? '✓' : '✗ sin valor'}</b></div>`;
    if (bb){
      info += `<div class="kv"><span>Cuota mínima B (U3.5)</span><b class="num ${j.cP >= 1 / bb ? 'win' : 'loss'}">${fmt(1 / bb, 2)} ${j.cP >= 1 / bb ? '✓' : '✗ sin valor'}</b></div>`;
      const ganan = sp.r * (j.cR - 1) + sp.p * (j.cP - 1), ev = a * ganan + (bb - a) * 0 + (1 - bb) * (-S0);
      info += `<div class="kv"><span>Valor esperado del día</span><b class="num ${ev >= 0 ? 'win' : 'loss'}">${moneyS(r2(ev))}</b></div>
        <div class="hint">Ganan las 2 ${pct(a)} · solo B ${pct(bb - a)} · pierden las 2 ${pct(1 - bb)}, según tu motor.</div>`;
    }
  }
  const dia = ticketsDelDia(j.fecha || hoyISO()), res = dia.filter(t => t.estado !== 'abierta'), ab = dia.length - res.length;
  const neto = r2(res.reduce((x, t) => x + netoDe(t), 0));
  box.innerHTML = `<details style="margin-top:12px" ${pA > 0 ? 'open' : ''}><summary>Probabilidad del motor (opcional)</summary>
      <div class="grid2" style="margin-top:8px"><div><label class="f">Prob. A ganan (U2.5) %</label><input class="inp sm num" id="jPA" inputmode="decimal" value="${b.pA ?? ''}"></div>
      <div><label class="f">Prob. B (U3.5) %</label><input class="inp sm num" id="jPB" inputmode="decimal" value="${b.pB ?? ''}"></div></div>
      <div class="hint">La del boleto completo. En una doble, multiplica: 0.85 × 0.80 = 68%.</div>${info}</details>
    ${dia.length ? `<div class="aviso info" style="margin-top:12px"><div style="width:100%">Boletos de este día: <b>${dia.length}</b>${ab ? ` (${ab} abierto${ab > 1 ? 's' : ''})` : ''} · neto <b class="${neto >= 0 ? 'win' : 'loss'}">${moneyS(neto)}</b>
      ${res.length && !ab ? `<br><button class="lnk" id="jUsarTix">Usar ${moneyS(neto)} como ganancia real del día →</button>` : ''}</div></div>` : ''}`;
  ['jPA', 'jPB'].forEach(id => $('#' + id).addEventListener('change', e => { R.borr[id === 'jPA' ? 'pA' : 'pB'] = e.target.value.trim(); save(); updJugada(); }));
  if ($('#jUsarTix')) $('#jUsarTix').onclick = () => { $('#jReal').value = neto; const d = $('#jReal').closest('details'); if (d) d.open = true; updJugada(); toast('Ganancia real del día: ' + moneyS(neto)); };
}
