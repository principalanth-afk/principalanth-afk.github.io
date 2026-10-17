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
    const re = /(Combinada|Simple)\s*(?:\(\s*(\d)\s*\))?\s*[@©®e]\s*(\d[\d.,]*)/g;
    const marcas = [];
    let m;
    while ((m = re.exec(t))) marcas.push({ i: m.index, tipo: m[1], legs: m[2] ? +m[2] : 1, cuotaTxt: m[3] });
    const out = [];
    marcas.forEach((mk, k) => {
      const trozo = t.slice(mk.i, k + 1 < marcas.length ? marcas[k + 1].i : t.length);
      const nro = trozo.match(/N\W{0,3}\s*(\d{10,12})/);
      const f = trozo.match(/(\d{2})\/(\d{2})\/(\d{2})\W{1,3}(\d{2})[:.](\d{2})/);
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
      // partido y mercado (solo vienen en simples o en el detalle del boleto)
      const partido = trozo.split('\n').map(s => s.trim()).find(s => /\S\s[-–]\s\S/.test(s) && !/\d{2}\/\d{2}/.test(s) && s.length < 70);
      if (partido) tk.partido = partido.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, '');
      const merc = trozo.match(/(Menos|M[aá]s)\s+de\s*\(?\s*(\d[.,]\d)\s*\)?/i);
      if (merc) tk.mercado = (/menos/i.test(merc[1]) ? 'Under ' : 'Over ') + merc[2].replace(',', '.');
      const liga = trozo.match(/F[uú]tbol\.\s*([^\n]+)/);
      if (liga) tk.liga = liga[1].trim();

      revisar(tk);
      out.push(tk);
    });
    return out;
  }

  function revisar(tk) {
    tk.avisos = (tk.avisos || []).filter(a => a.startsWith('cobro'));
    if (!tk.nro || tk.nro.length !== 11) tk.avisos.push('número de boleto dudoso');
    if (!tk.fecha) tk.avisos.push('sin fecha');
    if (tk.monto == null) tk.avisos.push('sin monto (captura cortada)');
    tk.completo = !!(tk.nro && tk.fecha && tk.monto != null && tk.cuota && tk.estado);
    return tk;
  }

  // el mismo ticket en dos capturas: igual N.º, o igual fecha+hora y cuota
  const firma = tk => tk.fecha && tk.cuota ? tk.fecha + '|' + tk.cuota : null;
  function mismo(a, b) {
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
      const ya = lista.find(x => mismo(x, tk));
      if (!ya) { lista.push(tk); return; }
      if ((!ya.nro || ya.nro.length !== 11) && tk.nro && tk.nro.length === 11) ya.nro = tk.nro;
      for (const k of ['fecha', 'monto', 'cobro', 'estado', 'partido', 'mercado', 'liga'])
        if (ya[k] == null && tk[k] != null) ya[k] = tk[k];
      (tk.avisos || []).forEach(a => { if (a.startsWith('cobro') && !ya.avisos.includes(a)) ya.avisos.push(a); });
      revisar(ya);
    });
    return { tickets: lista };
  }

  const api = { leerTickets, unir, mismo, revisar };
  if (typeof module !== 'undefined') module.exports = api; else raiz.Lector = api;
})(this);
