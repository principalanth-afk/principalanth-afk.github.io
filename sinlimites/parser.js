/* Bitácora — lee el texto de una captura del historial de apuestas
   y lo convierte en tickets. Funciona igual en el celular y en pruebas. */
(function (raiz) {
  const num = s => s == null ? null : parseFloat(String(s).replace(',', '.'));

  function arreglarCuota(s) {
    let c = num(s);
    if (c == null || isNaN(c)) return null;
    // el lector a veces se come el punto: "188" en vez de "1.88"
    if (c >= 20 && !/[.,]/.test(s)) c = parseFloat(s[0] + '.' + s.slice(1));
    return Math.round(c * 1000) / 1000;
  }

  function leerTickets(texto) {
    const t = texto.replace(/[‘’´`]/g, "'").replace(/\r/g, '');
    const re = /(Combinada|Simple)\s*(?:\(\s*(\d)\s*\))?\s*[@©®ea]\s*(\d[\d.,]*)/g;
    const marcas = [];
    let m;
    while ((m = re.exec(t))) marcas.push({ i: m.index, tipo: m[1], legs: m[2] ? +m[2] : 1, cuotaTxt: m[3] });
    const out = [];
    // captura del detalle bajada con el dedo: se ven los partidos pero no la cabecera del boleto
    if (!marcas.length) {
      const partidos = leerPartidos(t, {});
      if (!partidos.length) return out;
      const ev = t.match(/completad\w*[^\n]*?(\d+)\s*$/im);
      const legs = ev && +ev[1] >= partidos.length && +ev[1] <= 20 ? +ev[1] : partidos.length;
      const prod = partidos.length === legs && partidos.every(x => x.cuota > 1) ? Math.floor(partidos.reduce((a, x) => a * x.cuota, 1) * 1000 + 1e-6) / 1000 : null;
      out.push({ sinCabecera: true, nro: null, fecha: null, legs, cuota: prod, monto: null, cobro: null, estado: null, partidos,
        partido: partidos[0].partido, mercado: partidos[0].mercado, liga: partidos[0].liga,
        avisos: ['sin la parte de arriba del boleto (N.º, fecha y monto)'], completo: false });
      return out;
    }
    marcas.forEach((mk, k) => {
      const trozo = t.slice(mk.i, k + 1 < marcas.length ? marcas[k + 1].i : t.length);
      const nro = trozo.match(/N\W{0,3}\s*(\d{10,12})/);
      // la fecha a veces sale sin barras: "1710726, 07:51" = 17/10/26
      let f = trozo.match(/(\d{2})\/(\d{2})\/(\d{2})\W{1,3}(\d{2})[:.](\d{2})/) || trozo.match(/(\d{2})[\/71|l]?(\d{2})[\/71|l](\d{2})\W{1,3}(\d{2})[:.](\d{2})/);
      if (f && !(+f[1] >= 1 && +f[1] <= 31 && +f[2] >= 1 && +f[2] <= 12)) f = null;
      const imp = trozo.match(/Importe\W{0,2}\s*(\d[\d.,]*)/i);
      const cob = trozo.match(/\+\s*\S?\s*(\d[\d.,]*)\s*USDT/);
      const abierta = /Eventos|completad|Vender|Aceptad/i.test(trozo) || /USDT\s*[>→»]\s*\d/.test(trozo);
      const tk = {
        nro: nro ? nro[1] : null,
        legs: mk.legs,
        cuota: arreglarCuota(mk.cuotaTxt),
        fecha: f ? `20${f[3]}-${f[2]}-${f[1]}T${f[4]}:${f[5]}` : null,
        monto: imp ? num(imp[1]) : null,
        cobro: null,
        estado: null,
        avisos: []
      };
      if (tk.monto != null && tk.cuota) {
        const esperado = Math.round(tk.monto * tk.cuota * 100) / 100;
        if (cob) {
          tk.estado = 'ganada';
          const leido = num(cob[1]);
          if (Math.abs(leido - esperado) <= 0.06) tk.cobro = leido;
          else {
            // el lector suele comerse el primer dígito: "1.18" en vez de "11.18"
            const cand = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => num(d + cob[1])).find(v => Math.abs(v - esperado) <= 0.06);
            tk.cobro = cand != null ? cand : esperado;
            tk.avisos.push(`cobro leído ${leido}, corregido a ${tk.cobro}`);
          }
        } else if (abierta) tk.estado = 'abierta';
        else { tk.estado = 'perdida'; tk.cobro = 0; }
      }
      // partidos (vienen en las simples y en el detalle del boleto)
      tk.partidos = leerPartidos(trozo, tk);
      if (tk.partidos.length === 1 && !tk.partidos[0].cuota && tk.legs === 1) tk.partidos[0].cuota = tk.cuota;
      if (tk.partidos[0]) { tk.partido = tk.partidos[0].partido; tk.mercado = tk.partidos[0].mercado; tk.liga = tk.partidos[0].liga; }

      revisar(tk);
      out.push(tk);
    });
    return out;
  }

  const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
  // quita la basura que deja el escudo del equipo al inicio ("LZ Saint George…"), pero respeta FC, CA, CD…
  const SIGLAS = /^(FC|CA|CD|SC|AC|AS|CS|US|SD|UD|CF|IF|FK|SK|BK|KV|RC|AD|CR|CE|SE|EC|AA|AFC|JS|ES|MC|CR|NK|HNK|OFK|PFC)$/;
  const letras = s => {
    let t = s.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, '').replace(/\s+/g, ' ').trim();
    const m = t.match(/^(\S{1,2})\s+(?=[A-ZÁÉÍÓÚÑ])/);
    if (m && !SIGLAS.test(m[1].toUpperCase())) t = t.slice(m[0].length);
    return t;
  };
  function leerPartidos(trozo, tk) {
    const out = []; let cur = null;
    const anio = tk.fecha ? +tk.fecha.slice(0, 4) : new Date().getFullYear();
    let previo = null; // línea anterior fue el nombre del partido (puede seguir en la línea de abajo)
    trozo.split('\n').map(s => s.trim()).filter(Boolean).forEach(l => {
      const fuePartido = previo; previo = null;
      if (fuePartido && fuePartido.partido && !fuePartido.mercado && /^[A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ .'’-]{1,30}$/.test(l)
          && !/^(Total|Tiempo|No establecida|Ganad|Perdid|Juego|Doble|1X2|Eventos)/i.test(l) && !/F[uú]tbol/i.test(l)) {
        fuePartido.partido += ' ' + l.replace(/([a-záéíóú])ii([aeiou])/g, '$1ñ$2'); return;
      }
      const lg = l.match(/F[uú]tbol\b\.?\s*(.*)/i);
      if (lg) {
        const liga = lg[1].replace(/\s*\.\s*/g, '. ').replace(/\.\s*$/, '').trim();
        // a veces el lector pone la liga después del partido
        if (cur && !cur.liga) cur.liga = liga; else { cur = { liga }; out.push(cur); }
        return;
      }
      const h = l.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\W{1,3}(\d{1,2})[:.](\d{2})/i);
      if (h && MESES[h[2].toLowerCase()]) {
        // la hora va antes del partido: si el actual ya tiene partido, empieza el siguiente
        if (!cur || cur.partido) { cur = {}; out.push(cur); }
        const pad = n => String(n).padStart(2, '0');
        cur.hora = `${anio}-${pad(MESES[h[2].toLowerCase()])}-${pad(h[1])}T${pad(h[3])}:${h[4]}`; return;
      }
      const mc = l.match(/(Menos|M[aá]s)\s+de\s*\(?\s*(\d[.,]\d)\s*\)?/i);
      if (mc && cur) { cur.mercado = (/menos/i.test(mc[1]) ? 'Under ' : 'Over ') + mc[2].replace(',', '.'); return; }
      const x12 = l.match(/^1X2\W*(\S+)/i);
      if (x12 && cur && !cur.mercado) { cur.mercado = '1X2: ' + x12[1]; return; }
      const cu = !/USDT|Importe/i.test(l) && l.match(/(?:^|[^\d.,])(\d[.,]\d{2,3})$/);
      if (cu && cur && cur.partido && !cur.cuota) { cur.cuota = num(cu[1]); return; }
      if (/\S\s[-–]\s\S/.test(l) && !/\d{2}\/\d{2}|USDT|Importe|N\W{0,3}\s*\d{9}/i.test(l) && l.length < 80) {
        if (!cur || cur.partido) { cur = {}; out.push(cur); }
        cur.partido = letras(l).replace(/([a-záéíóú])ii([aeiou])/g, '$1ñ$2'); previo = cur;
      }
    });
    return out.filter(p => p.partido);
  }

  // una misma captura leída de dos formas (fondo claro y fondo oscuro): junta los pedazos
  function leerCaptura(textos) {
    const res = [];
    textos.map(leerTickets).flat().forEach(tk => {
      const ya = res.find(x => x.cuota === tk.cuota && x.legs === tk.legs && (!x.nro || !tk.nro || x.nro === tk.nro));
      if (!ya) { res.push(tk); return; }
      if ((!ya.nro || ya.nro.length !== 11) && tk.nro) ya.nro = tk.nro;
      for (const k of ['fecha', 'monto', 'cobro'])
        if (ya[k] == null && tk[k] != null) ya[k] = tk[k];
      if (tk.estado && (!ya.estado || (ya.estado === 'perdida' && tk.estado !== 'perdida'))) { ya.estado = tk.estado; if (tk.estado !== 'perdida') ya.cobro = tk.cobro; }
      ya.partidos = juntarPartidos(ya.partidos, tk.partidos);
      if (ya.partidos[0]) { ya.partido = ya.partidos[0].partido; ya.mercado = ya.partidos[0].mercado; ya.liga = ya.partidos[0].liga; }
      (tk.avisos || []).forEach(a => { if (a.startsWith('cobro') && !ya.avisos.includes(a)) ya.avisos.push(a); });
      revisar(ya);
    });
    return res;
  }
  // mismo partido aunque el lector cambie alguna letra: local completo + primeras letras del visitante, sin tildes
  const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const clave = s => { const [l, v] = String(s || '').split(/\s[-–]\s/); return norm(l) + '|' + norm(v).slice(0, 5); };
  const igual = (a, b) => !!a && !!b && clave(a) === clave(b);
  function juntarPartidos(a = [], b = []) {
    const base = a.length >= b.length ? a.map(p => ({ ...p })) : b.map(p => ({ ...p })), otro = a.length >= b.length ? b : a;
    base.forEach(p => { const q = otro.find(x => igual(x.partido, p.partido)); if (q) for (const k of ['liga', 'hora', 'mercado', 'cuota']) if (p[k] == null && q[k] != null) p[k] = q[k]; });
    return base;
  }

  function revisar(tk) {
    if (tk.sinCabecera) return tk;
    tk.avisos = (tk.avisos || []).filter(a => a.startsWith('cobro'));
    if (!tk.nro || tk.nro.length !== 11) tk.avisos.push('número de boleto dudoso');
    if (!tk.fecha) tk.avisos.push('sin fecha');
    if (tk.monto == null) tk.avisos.push('sin monto (captura cortada)');
    tk.completo = !!(tk.nro && tk.fecha && tk.monto != null && tk.cuota && tk.estado);
    return tk;
  }

  // el mismo ticket en dos capturas: igual N.º, o igual fecha+hora y cuota
  const firma = tk => tk.fecha && tk.cuota ? tk.fecha + '|' + tk.cuota : null;
  // partidos sin cabecera ↔ boleto: misma cantidad de partidos y (producto de cuotas ≈ cuota del boleto, o mismos equipos)
  function mismosPartidos(sc, t) {
    if ((t.legs || 1) !== sc.legs) return false;
    if (sc.cuota && t.cuota && Math.abs(sc.cuota - t.cuota) / t.cuota < 0.006) return true;
    const a = t.partidos || [];
    return a.length > 0 && sc.partidos.every(x => a.some(y => igual(x.partido, y.partido)));
  }
  function mismo(a, b) {
    if (a.sinCabecera && b.sinCabecera) return a.partidos.length === b.partidos.length && a.partidos.every((x, i) => igual(x.partido, b.partidos[i].partido));
    if (a.sinCabecera) return mismosPartidos(a, b);
    if (b.sinCabecera) return mismosPartidos(b, a);
    if (a.nro && b.nro && a.nro === b.nro) return true;
    if (firma(a) && firma(a) === firma(b)) return true;
    // N.º leído con un dígito de menos
    if (a.nro && b.nro && Math.abs(a.nro.length - b.nro.length) === 1 && a.fecha === b.fecha) {
      const [c, l] = a.nro.length < b.nro.length ? [a.nro, b.nro] : [b.nro, a.nro];
      return [...l].some((_, i) => l.slice(0, i) + l.slice(i + 1) === c);
    }
    return false;
  }

  // une los tickets de varias capturas sin contar dos veces el mismo
  function unir(listas) {
    const lista = [];
    listas.flat().forEach(tk => {
      let ya = lista.find(x => mismo(x, tk));
      if (!ya) { lista.push(tk); return; }
      if (ya.sinCabecera && !tk.sinCabecera) { lista[lista.indexOf(ya)] = tk; [ya, tk] = [tk, ya]; }
      if ((!ya.nro || ya.nro.length !== 11) && tk.nro && tk.nro.length === 11) ya.nro = tk.nro;
      for (const k of ['fecha', 'monto', 'cobro', 'estado', 'partido', 'mercado', 'liga'])
        if (ya[k] == null && tk[k] != null) ya[k] = tk[k];
      if ((tk.partidos || []).length) ya.partidos = juntarPartidos(ya.partidos, tk.partidos);
      (tk.avisos || []).forEach(a => { if (a.startsWith('cobro') && !ya.avisos.includes(a)) ya.avisos.push(a); });
      revisar(ya);
    });
    return { tickets: lista };
  }

  const api = { igual, leerTickets, leerCaptura, unir, mismo, mismosPartidos, juntarPartidos, revisar };
  if (typeof module !== 'undefined') module.exports = api; else raiz.Lector = api;
})(this);
