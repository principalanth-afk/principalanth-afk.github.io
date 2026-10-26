/* ASCENSO — Aplicación: cuestionario, plan, biblioteca, reproductor y progreso */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const t = k => I18N.t(k);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const app = $('#app');
  const BPM_FALLBACK = 124;
  let S, tab = 'home';

  /* ================= Iconos ================= */
  const IC = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
    plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
    lib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="2"/><path d="M8 21l3-7 3 3v5M6 12l3-4 4 1 3 3M11 14l-2-5"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    set: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    voice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    flip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-3l-2-3H9L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M9 13a3 3 0 015-2l1 1M15 14a3 3 0 01-5 2l-1-1"/></svg>',
    rec: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="#ff3b30"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="#ff3b30"/></svg>',
    arr: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 6l6 6-6 6"/></svg>',
    fire: '🔥', bolt: '⚡'
  };

  function shield(i, size) {
    const cols = [['#8a5a3c', '#5a3a26'], ['#9c6b45', '#6b4529'], ['#b88a5a', '#7a5832'], ['#a9b1b8', '#6c747b'], ['#c9d1d8', '#848c93'], ['#e2b94a', '#9c7a1e'], ['#f4cf55', '#b08a1c'], ['#5a8cff', '#2e4fb0'], ['#c6ff3d', '#7aa513'], ['#ffffff', '#c6ff3d']];
    const [a, b] = cols[Math.max(0, Math.min(9, i))]; const id = 'sg' + i + Math.random().toString(36).slice(2, 6);
    return `<svg class="shield" viewBox="0 0 64 72" width="${size || 40}" height="${(size || 40) * 1.12}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path d="M32 2l26 9v20c0 19-12 32-26 39C18 63 6 50 6 31V11z" fill="url(#${id})" stroke="#0a0d08" stroke-width="3"/><text x="32" y="44" text-anchor="middle" font-family="Bebas Neue, Impact" font-size="30" fill="#0a0d08">${i + 1}</text></svg>`;
  }

  /* ================= Animaciones ================= */
  const Anim = {
    items: new Set(), stages: [],
    stage(canvas, motion, opts) { const s = new Figure.Stage(canvas, opts); s.set(motion); this.stages.push(s); return s; },
    live(canvas, motion, opts) { const s = this.stage(canvas, motion, opts); const it = { s, m: motion, off: Math.random(), speed: (opts && opts.speed) || 1 }; this.items.add(it); return it; },
    still(canvas, motion, phase, opts) { const s = this.stage(canvas, motion, opts); s.draw(phase == null ? 0.3 : phase); return s; },
    clear() { this.items.clear(); this.stages.forEach(s => s.destroy()); this.stages = []; },
    loop() {
      const now = performance.now() / 1000;
      for (const it of this.items) {
        if (!it.s.c.isConnected) { this.items.delete(it); continue; }
        const cyc = (it.m.b || 4) * 60 / BPM_FALLBACK / it.speed;
        it.s.draw((now / cyc + it.off) % 1);
      }
      requestAnimationFrame(() => this.loop());
    }
  };
  Anim.loop();

  function toast(msg) { const d = el(`<div class="toast">${esc(msg)}</div>`); document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
  function exById(id) { return Exercises.byId(id); }
  function exMotion(e) { return Motions[e.motion]; }
  function nm(e) { return I18N.exName(e); }
  function doseTxt(it, e) { const side = e.side ? ' ×2' : ''; return it.secs ? `${it.secs}${t('sec')}${side}` : `${it.reps}${side}`; }
  function setsTxt(it) { return it.sets > 1 ? `${it.sets} × ` : ''; }

  /* ================= Onboarding ================= */
  let P = {}; // borrador del perfil
  let obIdx = 0;
  const AGE_LOOK = { j: { hair: '#2a1a10', number: '7' }, '18': { hair: '#3a2416', number: '10' }, '30': { hair: '#140d09', number: '8' }, '40': { hair: '#2b1d14', number: '5' }, '50': { hair: '#b9b9b4', number: '9' } };
  const standF = { view: 'front', k: [{ view: 'front', hip: [0, 0.92], t: 180, A1: [8, 4], L1: { to: [0.12, 0.06], b: 1 } }, { view: 'front', hip: [0, 0.915], t: 180, A1: [10, 6], L1: { to: [0.12, 0.06], b: 1 } }], b: 4, g: true };

  function steps() {
    const s = ['welcome', 'lang', 'name', 'age', 'info1', 'goal', 'more', 'body', 'best', 'wchange', 'data', 'push', 'squat', 'flex', 'freq', 'zones', 'info2', 'dur', 'probs', 'foot'];
    if (P.foot && P.foot !== 'fo_no') s.push('pos', 'match');
    s.push('equip', 'perm', 'build');
    return s;
  }
  const SEC = { lang: 0, name: 0, age: 0, info1: 0, goal: 0, more: 0, body: 0, best: 0, wchange: 0, data: 0, push: 1, squat: 1, flex: 1, freq: 1, zones: 1, info2: 1, dur: 1, probs: 1, foot: 2, pos: 2, match: 2, equip: 2, perm: 3, build: 3 };
  const SEC_T = ['secProfile', 'secActivity', 'secFootball', 'secPlan'];

  function startOnboarding(redo) {
    P = redo && S.profile ? JSON.parse(JSON.stringify(S.profile)) : { lang: I18N.lang, equip: [], zones: [], more: [], probs: [], units: 'metric' };
    obIdx = redo ? 1 : 0; renderOb();
  }

  function renderOb() {
    Anim.clear();
    const list = steps(); const id = list[obIdx];
    if (id === 'welcome') return obWelcome();
    if (id === 'build') return obBuild();
    const sec = SEC[id];
    const inSec = list.filter(x => SEC[x] === sec); const pos = inSec.indexOf(id);
    const bars = SEC_T.map((k, i) => `<i><b style="width:${i < sec ? 100 : i === sec ? Math.round((pos + 0.5) / inSec.length * 100) : 0}%"></b></i>`).join('');
    const v = el(`<div class="ob"><div class="ob-top"><button class="iconbtn" id="obBack" aria-label="${t('back')}">${IC.back}</button><div><div class="ttl">${t(SEC_T[sec])}</div><div class="bars">${bars}</div></div><span></span></div><div id="obBody"></div><div class="ob-foot"><button class="btn" id="obNext">${t('next')}</button></div></div>`);
    app.replaceChildren(v);
    $('#obBack').onclick = () => { obIdx = Math.max(0, obIdx - 1); renderOb(); };
    const body = $('#obBody'), next = $('#obNext');
    const go = () => { obIdx++; renderOb(); window.scrollTo(0, 0); };
    next.onclick = go;
    const R = OB[id]; R(body, next, go);
    window.scrollTo(0, 0);
  }

  function single(body, next, go, key, title, opts, sub) {
    body.innerHTML = `<h2 class="q">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}<div class="opts"></div>`;
    const box = $('.opts', body);
    next.classList.add('hidden');
    opts.forEach(o => {
      const b = el(`<button class="opt ${P[key] === o.v ? 'sel' : ''}">${o.ic ? `<span class="ic">${o.ic}</span>` : ''}<span class="tx">${o.l}</span><span class="ck"></span></button>`);
      b.onclick = () => { P[key] = o.v; $$('.opt', box).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); Music.blip && tryBlip('tick'); setTimeout(go, 220); };
      box.appendChild(b);
    });
  }
  function multi(body, next, key, title, opts, exclusive) {
    body.innerHTML = `<h2 class="q">${title}</h2><p class="sub">${t('chooseAll')}</p><div class="opts"></div>`;
    const box = $('.opts', body); P[key] = P[key] || [];
    const upd = () => { next.disabled = !P[key].length; };
    opts.forEach(o => {
      const b = el(`<button class="opt multi ${P[key].includes(o.v) ? 'sel' : ''}">${o.ic ? `<span class="ic">${o.ic}</span>` : ''}<span class="tx">${o.l}</span><span class="ck"></span></button>`);
      b.onclick = () => {
        const a = P[key]; const i = a.indexOf(o.v);
        if (i >= 0) a.splice(i, 1); else { if (o.v === exclusive) a.length = 0; else { const j = a.indexOf(exclusive); if (j >= 0) a.splice(j, 1); } a.push(o.v); }
        $$('.opt', box).forEach((x, k) => x.classList.toggle('sel', a.includes(opts[k].v))); upd(); tryBlip('tick');
      };
      box.appendChild(b);
    });
    upd();
  }
  function tryBlip(k) { try { if (Music.ctx) Music.blip(k); } catch (e) { } }

  const OB = {
    lang(body, next, go) {
      single(body, next, go, 'lang', t('qLang'), I18N.langs.map(l => ({ v: l.id, l: l.label, ic: l.flag })));
      $$('.opt', body).forEach((b, i) => { const old = b.onclick; b.onclick = () => { I18N.lang = I18N.langs[i].id; P.lang = I18N.lang; Voice.pick(); old(); }; });
    },
    name(body, next) {
      body.innerHTML = `<h2 class="q">${t('qName')}</h2><p class="sub">${t('qNameSub')}</p><div class="field"><input class="inp" id="nm" maxlength="24" autocomplete="given-name" placeholder="${t('namePh')}" value="${esc(P.name || '')}"></div>`;
      const i = $('#nm'); const upd = () => { P.name = i.value.trim(); next.disabled = !P.name; };
      i.oninput = upd; upd(); setTimeout(() => i.focus(), 200);
      i.onkeydown = e => { if (e.key === 'Enter' && P.name) next.click(); };
    },
    age(body, next, go) {
      next.classList.add('hidden');
      const groups = [['18', '18-29'], ['30', '30-39'], ['40', '40-49'], ['50', '50+'], ['j', '12-17']];
      body.innerHTML = `<h2 class="q" style="font-family:var(--fd);font-weight:400;font-size:46px;letter-spacing:1px">${t('qAge')}</h2><p class="sub tiny" style="font-size:15px">${t('qAgeSub')}</p><div class="grid2"></div>`;
      const g = $('.grid2', body);
      groups.forEach(([v, lab]) => {
        const c = el(`<button class="card-pic ${P.ageGroup === v ? 'sel' : ''}"><canvas></canvas><div class="lab"><span>${v === 'j' ? t('ageJ') : t('age')}: ${lab}</span><span class="arr">${IC.arr}</span></div></button>`);
        g.appendChild(c);
        Anim.live($('canvas', c), standF, { look: AGE_LOOK[v], pad: 0.08 });
        c.onclick = () => { P.ageGroup = v; P.age = P.age && ageInGroup(P.age, v) ? P.age : { j: 15, '18': 24, '30': 34, '40': 44, '50': 55 }[v]; go(); };
      });
    },
    info1(body) { infoScreen(body, 'pushup', t('info1T'), t('info1B')); },
    info2(body) { infoScreen(body, 'crunch', t('info2T'), t('info2B')); },
    goal(body, next, go) { single(body, next, go, 'goal', t('qGoal'), ['g_muscle', 'g_lose', 'g_recomp', 'g_fit'].map(v => ({ v, l: t(v) }))); },
    more(body, next) { multi(body, next, 'more', t('qMore'), [['m_tone', '💪'], ['m_endur', '⚡'], ['m_post', '🧘'], ['m_libido', '🚀'], ['m_stress', '🌙']].map(([v, ic]) => ({ v, l: t(v), ic }))); },
    body(body, next, go) {
      next.classList.add('hidden');
      body.innerHTML = `<h2 class="q">${t('qBody')}</h2><div class="grid2" style="margin-top:14px"></div>`;
      const g = $('.grid2', body);
      ['b_slim', 'b_mid', 'b_chubby', 'b_over'].forEach((v, i) => {
        const c = el(`<button class="card-pic dark ${P.body === v ? 'sel' : ''}"><canvas></canvas><div class="lab"><span>${t(v)}</span><span class="ck"></span></div></button>`);
        g.appendChild(c); Anim.live($('canvas', c), standF, { look: { build: i, number: '' }, pad: 0.06 });
        c.onclick = () => { P.body = v; $$('.card-pic', g).forEach(x => x.classList.remove('sel')); c.classList.add('sel'); setTimeout(go, 220); };
      });
    },
    best(body, next, go) { single(body, next, go, 'best', t('qBest'), ['bs_1', 'bs_2', 'bs_3', 'bs_never'].map(v => ({ v, l: t(v) }))); },
    wchange(body, next, go) { single(body, next, go, 'wchange', t('qWeight'), ['w_hard', 'w_easy', 'w_slow'].map(v => ({ v, l: t(v) }))); },
    data(body, next) {
      const imp = P.units === 'imperial';
      const w = P.weight || 75, hcm = P.height || 172;
      body.innerHTML = `<h2 class="q">${t('qData')}</h2><p class="sub">${t('qDataSub')}</p>
        <div class="row" style="justify-content:center;margin-bottom:16px"><div class="seg" id="units"><button data-u="metric" class="${!imp ? 'on' : ''}">kg · cm</button><button data-u="imperial" class="${imp ? 'on' : ''}">lb · ft</button></div></div>
        <div class="field"><label>${t('ageExact')}</label><input class="inp" id="dAge" type="number" inputmode="numeric" min="10" max="99" value="${P.age || ''}"></div>
        <div class="field"><label>${t('weight')} (${imp ? 'lb' : 'kg'})</label><input class="inp" id="dW" type="number" inputmode="decimal" step="0.1" value="${imp ? Math.round(w * 2.2046) : Math.round(w * 10) / 10}"></div>
        <div class="field"><label>${t('height')} (${imp ? 'ft / in' : 'cm'})</label>${imp ? `<div class="row"><input class="inp" id="dFt" type="number" inputmode="numeric" value="${Math.floor(hcm / 30.48)}"><input class="inp" id="dIn" type="number" inputmode="numeric" value="${Math.round((hcm / 2.54) % 12)}"></div>` : `<input class="inp" id="dH" type="number" inputmode="numeric" value="${Math.round(hcm)}">`}</div>
        <div class="bmi"><span class="muted">${t('bmi')}</span><b id="bmiV" class="disp" style="font-size:30px"></b><span id="bmiL" class="small"></span></div>`;
      $$('#units button', body).forEach(b => b.onclick = () => { read(); P.units = b.dataset.u; OB.data(body, next); });
      const read = () => {
        const a = +$('#dAge').value; P.age = a || P.age;
        if (P.age) P.ageGroup = P.age < 18 ? 'j' : P.age < 30 ? '18' : P.age < 40 ? '30' : P.age < 50 ? '40' : '50';
        const wi = +$('#dW').value; if (wi) P.weight = P.units === 'imperial' ? wi / 2.2046 : wi;
        if (P.units === 'imperial') { const ft = +$('#dFt').value, inch = +$('#dIn').value; if (ft) P.height = (ft * 12 + inch) * 2.54; }
        else { const hh = +$('#dH').value; if (hh) P.height = hh; }
        const bmi = P.weight / Math.pow(P.height / 100, 2);
        $('#bmiV').textContent = isFinite(bmi) ? bmi.toFixed(1) : '–';
        const lab = I18N.lang === 'en' ? ['Underweight', 'Healthy', 'Overweight', 'Obesity'] : ['Bajo peso', 'Saludable', 'Sobrepeso', 'Obesidad'];
        $('#bmiL').textContent = !isFinite(bmi) ? '' : bmi < 18.5 ? lab[0] : bmi < 25 ? lab[1] : bmi < 30 ? lab[2] : lab[3];
        next.disabled = !(P.age >= 10 && P.age <= 99 && P.weight > 25 && P.weight < 300 && P.height > 110 && P.height < 230);
      };
      $$('input', body).forEach(i => i.oninput = read); read();
    },
    push(body, next, go) { single(body, next, go, 'push', t('qPush'), [0, 1, 2, 3].map(v => ({ v, l: t('p_' + v) }))); },
    squat(body, next, go) { single(body, next, go, 'squat', t('qSquat'), [0, 1, 2, 3].map(v => ({ v, l: t('s_' + v) }))); },
    flex(body, next, go) { single(body, next, go, 'flex', t('qFlex'), [3, 2, 1, 0].map(v => ({ v, l: t('f_' + v) }))); },
    freq(body, next, go) { single(body, next, go, 'freq', t('qFreq'), [3, 2, 1, 0].map(v => ({ v, l: t('fr_' + v) }))); },
    zones(body, next) { multi(body, next, 'zones', t('qZones'), ['abs', 'chest', 'arms', 'legs', 'back', 'glutes'].map(v => ({ v, l: t('z_' + v) }))); },
    dur(body, next, go) { single(body, next, go, 'dur', t('qDur'), ['d_15', 'd_20', 'd_25', 'd_30', 'd_x'].map(v => ({ v, l: t(v) }))); },
    probs(body, next) { multi(body, next, 'probs', t('qProb'), [['pr_back', '🔙'], ['pr_knee', '🦵'], ['pr_none', '✅']].map(([v, ic]) => ({ v, l: t(v), ic })), 'pr_none'); },
    foot(body, next, go) { single(body, next, go, 'foot', t('qFoot'), [['fo_no', '🚫'], ['fo_rec', '⚽'], ['fo_team', '🏆']].map(([v, ic]) => ({ v, l: t(v), ic }))); },
    pos(body, next, go) { single(body, next, go, 'pos', t('qPos'), [['po_gk', '🧤'], ['po_def', '🛡️'], ['po_mid', '🎯'], ['po_fw', '⚡']].map(([v, ic]) => ({ v, l: t(v), ic }))); },
    match(body, next, go) {
      const days = t('dayNames');
      single(body, next, go, 'matchDay', t('qMatch'), [{ v: -1, l: t('md_none') }].concat(days.map((d, i) => ({ v: i, l: d }))));
    },
    equip(body, next) {
      P.equip = P.equip || [];
      body.innerHTML = `<h2 class="q">${t('qEquip')}</h2><p class="sub">${t('qEquipSub')}</p><div class="opts"></div>`;
      const box = $('.opts', body);
      Exercises.EQUIP.filter(q => q.id !== 'none').forEach(q => {
        const b = el(`<button class="opt multi ${P.equip.includes(q.id) ? 'sel' : ''}"><span class="tx">${I18N.lang === 'en' ? q.en : q.es}</span><span class="ck"></span></button>`);
        b.onclick = () => { const i = P.equip.indexOf(q.id); if (i >= 0) P.equip.splice(i, 1); else P.equip.push(q.id); b.classList.toggle('sel'); tryBlip('tick'); };
        box.appendChild(b);
      });
      next.disabled = false;
    },
    perm(body, next) {
      body.innerHTML = `<h2 class="q">${t('qPerm')}</h2><p class="sub">${t('qPermSub')}</p><div class="perm">
        <button class="btn dark" id="pCam">${IC.cam}<span>${t('permCam')}</span></button>
        <button class="btn dark" id="pSnd">${IC.music}<span>${t('permSound')}</span></button>
        <div class="toggle"><span>${t('permWake')}</span><span class="sw ${S.settings.wake ? 'on' : ''}" id="pWake"></span></div>
        <p class="small muted" style="text-align:center">${t('camHint')}</p></div>`;
      $('#pCam').onclick = async () => { const ok = await Cam.request(); $('#pCam span').textContent = ok ? t('permCamOk') : t('permCamNo'); };
      $('#pSnd').onclick = () => {
        Music.resume(); Music.setOn(true); Music.start();
        Voice.say(I18N.motiv('start', P.name));
        setTimeout(() => Music.stop(), 4500);
        $('#pSnd span').textContent = t('permSoundOk');
      };
      $('#pWake').onclick = e => { S.settings.wake = !S.settings.wake; e.target.classList.toggle('on', S.settings.wake); };
    }
  };

  function ageInGroup(a, g) { return g === 'j' ? a < 18 : g === '18' ? a >= 18 && a < 30 : g === '30' ? a >= 30 && a < 40 : g === '40' ? a >= 40 && a < 50 : a >= 50; }

  function infoScreen(body, motion, title, txt) {
    body.innerHTML = `<div class="info"><h2>${title}</h2><p>${txt}</p><div class="info-hero"><canvas></canvas></div></div>`;
    Anim.live($('canvas', body), Motions[motion], { pad: 0.1 });
  }

  function obWelcome() {
    const v = el(`<div class="welcome"><canvas></canvas><div class="wz"><div class="logo">ASCEN<span>SO</span></div><div class="motto">${t('motto')}</div><p class="muted" style="margin:0 0 22px;font-size:17px">${t('tagline')} · ${Exercises.LIST.length} ${t('exercises')}</p><button class="btn" id="wGo">${t('start')}</button></div></div>`);
    app.replaceChildren(v);
    const demo = ['burpee', 'pushup', 'mountain_climber', 'jump_squat', 'russian_twist', 'pullup'];
    let k = 0; const c = $('canvas', v);
    const it = Anim.live(c, Motions[demo[0]], { pad: 0.14, reserveTop: 40 });
    c.style.bottom = '46%'; c.style.height = '54%';
    const iv = setInterval(() => { if (!c.isConnected) return clearInterval(iv); k = (k + 1) % demo.length; it.m = Motions[demo[k]]; it.s.set(it.m); }, 4200);
    $('#wGo').onclick = () => { obIdx = 1; renderOb(); };
  }

  function obBuild() {
    Anim.clear();
    const v = el(`<div class="build"><svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" stroke="#252b22" stroke-width="8" fill="none"/><circle id="rg" cx="50" cy="50" r="44" stroke="#c6ff3d" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="276.5" transform="rotate(-90 50 50)"/><text id="rgT" x="50" y="58" text-anchor="middle" fill="#fff" font-family="Bebas Neue, Impact" font-size="26">0%</text></svg><h2 style="font-size:40px">${t('building')}</h2><div class="steps-list">${t('buildSteps').map(s => `<div><i>✓</i>${s}</div>`).join('')}</div></div>`);
    app.replaceChildren(v);
    const items = $$('.steps-list div', v); let p = 0;
    const iv = setInterval(() => {
      p += 2; $('#rg').setAttribute('stroke-dashoffset', 276.5 * (1 - p / 100)); $('#rgT').textContent = p + '%';
      items.forEach((d, i) => d.classList.toggle('ok', p >= (i + 1) * 19));
      if (p >= 100) { clearInterval(iv); finishOnboarding(); }
    }, 55);
  }

  function finishOnboarding() {
    P.probs = (P.probs || []).filter(x => x !== 'pr_none');
    if (P.matchDay == null) P.matchDay = -1;
    S.profile = P; S.settings.lang = I18N.lang;
    S.plan = Planner.build(P, S.prog.xp, S.prog.seed);
    Store.save();
    const c = Game.cat(S.prog.xp);
    const v = el(`<div class="build">${shield(c.i, 120)}<h2 style="font-size:46px">${esc(t('readyT').replace('{n}', P.name))}</h2><p class="muted" style="font-size:18px;margin:0">${t('readyB')}: <b class="lime">${c.name}</b></p><div class="motto" style="text-align:center">${t('motto')}</div>${S.plan.d.minor ? `<p class="small muted">${t('safetyMinor')}</p>` : ''}<button class="btn" id="goMain" style="max-width:380px">${t('go')}</button></div>`);
    app.replaceChildren(v);
    $('#goMain').onclick = () => { tab = 'home'; renderMain(); };
  }

  /* ================= Principal ================= */
  function ensurePlan() {
    if (!S.plan || S.plan.week !== Game.weekKey() || !S.plan.days) { S.plan = Planner.build(S.profile, S.prog.xp, S.prog.seed); Store.save(); }
    return S.plan;
  }

  function renderMain() {
    Anim.clear(); ensurePlan();
    const v = el(`<div><div class="main" id="mainBody"></div><nav class="tabs">${[['home', 'tabHome'], ['plan', 'tabPlan'], ['lib', 'tabLib'], ['stats', 'tabStats'], ['set', 'tabSet']].map(([k, l]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${IC[k]}<span>${t(l)}</span></button>`).join('')}</nav></div>`);
    app.replaceChildren(v);
    $$('.tabs button', v).forEach(b => b.onclick = () => { tab = b.dataset.t; renderMain(); window.scrollTo(0, 0); });
    ({ home: viewHome, plan: viewPlan, lib: viewLib, stats: viewStats, set: viewSettings })[tab]($('#mainBody'));
  }

  function weekDone() { return S.prog.weeks[Game.weekKey()] || []; }

  function viewHome(root) {
    const plan = S.plan, ti = Game.todayIdx(), day = plan.days[ti], c = Game.cat(S.prog.xp);
    const first = exById((day.main[0] || day.warm[0]).id);
    const done = weekDone();
    root.innerHTML = `<div class="topbar"><div><div class="muted small">${t('dayNames')[ti]}</div><div class="hi">${I18N.lang === 'en' ? 'Hi' : 'Hola'}, ${esc(S.profile.name)} 👋</div></div><div class="badge-cat">${shield(c.i, 22)}${c.name}</div></div>
      <div class="hero"><canvas></canvas><div class="over"><div class="tiny">${t('today')} · ${plan.d.football ? t('footMode') : t('adultMode')}</div><h2>${t('focus')[day.focus]}</h2><div class="meta"><span>⏱ ${day.mins} ${t('min')}</span><span>🏋️ ${day.main.length} ${t('exercises')}</span>${done.includes(ti) ? `<span class="lime">✓ ${t('done')}</span>` : ''}</div></div><div class="go"><button class="btn" id="startToday">${t('startWorkout')}</button></div></div>
      <div class="mottoBar">${t('motto')}</div>
      <div class="stats3"><div class="stat"><div class="v">${IC.fire} ${S.prog.streak}</div><div class="l">${t('streak')}</div></div><div class="stat"><div class="v gold">${S.prog.xp}</div><div class="l">${t('xp')}</div></div><div class="stat"><div class="v lime">+${Math.round((Game.mult(S.prog.xp) - 1) * 100)}%</div><div class="l">${t('exig')}</div></div></div>
      <div class="catcard">${shield(c.i, 62)}<div style="flex:1"><div class="tiny muted">${t('cat')} ${c.i + 1}/10</div><div class="disp" style="font-size:30px">${c.name}</div><div class="prog"><b style="width:${Math.round(c.pct * 100)}%"></b></div><div class="small muted" style="margin-top:6px">${c.next ? `${S.prog.xp} / ${c.next} ${t('xp')} → ${t('catNames')[c.i + 1]}` : '🏆'}</div></div></div>
      <div class="sec-t"><h3>${t('week')}</h3><button class="small lime" id="toPlan">${t('tabPlan')} ›</button></div>
      <div class="weekstrip">${plan.days.map((d, i) => `<div class="wd ${i === ti ? 'today' : ''} ${done.includes(i) ? 'done' : ''} ${Planner.FOCUS[d.focus].light ? 'recd' : ''}">${t('dayShort')[i]}<div class="n">${d.mins}'</div></div>`).join('')}</div>`;
    const hero = $('.hero canvas', root);
    const it = Anim.live(hero, exMotion(first), { pad: 0.08, reserveTop: 120 });
    let k = 0; const ids = day.main.map(m => m.id);
    const iv = setInterval(() => { if (!hero.isConnected) return clearInterval(iv); k = (k + 1) % ids.length; it.m = exMotion(exById(ids[k])); it.s.set(it.m); }, 5000);
    $('#startToday').onclick = () => startWorkout(day);
    $('#toPlan').onclick = () => { tab = 'plan'; renderMain(); };
  }

  function viewPlan(root) {
    const plan = S.plan, ti = Game.todayIdx(), done = weekDone();
    root.innerHTML = `<div class="topbar"><h1 style="font-size:40px">${t('week')}</h1><button class="btn sm ghost" id="regen">↻</button></div><div id="days"></div><p class="small muted" style="text-align:center">${t('motto')}</p>`;
    const box = $('#days', root);
    plan.days.forEach((d, i) => {
      const open = i === ti;
      const c = el(`<div class="daycard ${i === ti ? 'today' : ''} ${done.includes(i) ? 'done' : ''}"><button class="dayhead"><span class="dn">${t('dayShort')[i]}</span><span class="f"><b>${t('dayNames')[i]} · ${t('focus')[d.focus]}</b><span class="small muted">⏱ ${d.mins} ${t('min')} · ${d.main.length} ${t('exercises')}${done.includes(i) ? ' · ✓' : ''}</span></span><span>${IC.arr}</span></button><div class="daybody ${open ? '' : 'hidden'}"></div></div>`);
      box.appendChild(c);
      const bd = $('.daybody', c);
      const fill = () => {
        if (bd.dataset.f) return; bd.dataset.f = 1;
        [['warmup', d.warm], ['main', d.main], ['cool', d.cool]].forEach(([k, arr]) => {
          bd.appendChild(el(`<div class="grp">${t(k)}</div>`));
          arr.forEach(it => {
            const e = exById(it.id);
            const r = el(`<button class="exrow"><canvas></canvas><span class="nm">${esc(nm(e))}<br><span class="tiny dim">${it.sets} ${t('sets')}${e.side ? ' · ' + t('perSide') : ''}</span></span><span class="ds">${doseTxt(it, e)}</span></button>`);
            bd.appendChild(r); Anim.still($('canvas', r), exMotion(e), 0.42, { pad: 0.08 });
            r.onclick = () => exSheet(e, it);
          });
        });
        const b = el(`<button class="btn" style="margin-top:12px">${t('startWorkout')}</button>`); b.onclick = () => startWorkout(d); bd.appendChild(b);
      };
      if (open) fill();
      $('.dayhead', c).onclick = () => { bd.classList.toggle('hidden'); fill(); };
    });
    $('#regen').onclick = () => { S.prog.seed = (S.prog.seed || 0) + 1; S.plan = Planner.build(S.profile, S.prog.xp, S.prog.seed); Store.save(); toast(t('regen')); viewPlan(root); };
  }

  function viewLib(root) {
    let filt = 'all', q = '', eqF = false;
    const eq = new Set(['none'].concat(S.profile.equip || []));
    root.innerHTML = `<div class="topbar"><h1 style="font-size:40px">${t('library')}</h1><span class="badge-cat">${Exercises.LIST.length}</span></div><input class="search" id="q" placeholder="${t('search')}"><div class="chips">${[['all', t('all')], ['futbol', t('futbol')], ['militar', t('militar')], ['eq', '🎒 ' + t('equipment')]].map(([k, l]) => `<button class="chip ${k === 'all' ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div><div id="libList"></div>`;
    const list = $('#libList', root);
    const draw = () => {
      list.innerHTML = '';
      Exercises.SECTIONS.forEach(sec => {
        if (filt !== 'all' && filt !== 'eq' && sec.group !== filt) return;
        const items = Exercises.LIST.filter(e => e.sec === sec.id && (!q || (e.es + ' ' + e.en).toLowerCase().includes(q)) && (!eqF || eq.has(e.equip)));
        if (!items.length) return;
        const s = el(`<div class="libsec"><h4>${sec.group === 'futbol' ? '⚽' : '🎖️'} ${I18N.lang === 'en' ? sec.en : sec.es}</h4></div>`);
        items.forEach(e => {
          const r = el(`<button class="exrow"><canvas></canvas><span class="nm">${esc(nm(e))}<br><span class="tiny dim">${'★'.repeat(e.lv)}${e.equip !== 'none' ? ' · ' + eqName(e.equip) : ''}</span></span><span class="ds">${e.mode === 'time' ? e.base + t('sec') : e.base}</span></button>`);
          s.appendChild(r);
          r.onclick = () => exSheet(e);
          lazyStill($('canvas', r), exMotion(e));
        });
        list.appendChild(s);
      });
    };
    $('#q', root).oninput = e => { q = e.target.value.toLowerCase().trim(); draw(); };
    $$('.chip', root).forEach(c => c.onclick = () => { if (c.dataset.f === 'eq') { eqF = !eqF; c.classList.toggle('on', eqF); } else { filt = c.dataset.f; $$('.chip', root).forEach(x => x.dataset.f !== 'eq' && x.classList.toggle('on', x === c)); } draw(); });
    draw();
  }
  const lazyIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { const c = en.target; lazyIO.unobserve(c); Anim.still(c, c._m, 0.42, { pad: 0.08 }); } }), { rootMargin: '200px' }) : null;
  function lazyStill(c, m) { if (!lazyIO) return Anim.still(c, m, 0.42, { pad: 0.08 }); c._m = m; lazyIO.observe(c); }
  function eqName(id) { const q = Exercises.EQUIP.find(x => x.id === id); return q ? (I18N.lang === 'en' ? q.en : q.es) : id; }

  function exSheet(e, it) {
    const m = exMotion(e); const sec = Exercises.SECTIONS.find(s => s.id === e.sec);
    const cue = (Exercises.CUES[m.fam] || Exercises.CUES.stand)[I18N.lang] || Exercises.CUES.stand.es;
    const bg = el(`<div class="sheet-bg"><div class="sheet"><div class="grab"></div><canvas class="demo"></canvas><h2 style="font-size:34px;margin-top:14px">${esc(nm(e))}</h2><div class="small muted">${I18N.lang === 'en' ? sec.en : sec.es}</div>
      <div class="kv"><span>${'★'.repeat(e.lv)}${'☆'.repeat(3 - e.lv)}</span><span>${it ? setsTxt(it) + doseTxt(it, e) : (e.mode === 'time' ? e.base + ' ' + t('sec') : e.base + ' ' + t('reps'))}${e.side ? ' · ' + t('perSide') : ''}</span><span>${eqName(e.equip)}</span>${e.zones.map(z => `<span>${t('z_' + z)}</span>`).join('')}${m.cam && m.cam !== 'generic' ? `<span class="lime">📷 ${t('verified')}</span>` : ''}</div>
      <div class="tiny muted" style="margin-top:6px">${t('cue')}</div>${cue.map(c => `<div class="cue">${esc(c)}</div>`).join('')}
      <div class="row" style="margin-top:14px"><button class="btn ghost" id="shClose">${t('close')}</button><button class="btn" id="shTry">${t('start')}</button></div></div></div>`);
    document.body.appendChild(bg);
    const live = Anim.live($('canvas.demo', bg), m, { pad: 0.12 });
    const close = () => { bg.remove(); Anim.items.delete(live); live.s.destroy(); };
    bg.onclick = ev => { if (ev.target === bg) close(); };
    $('#shClose', bg).onclick = close;
    $('#shTry', bg).onclick = () => { close(); const item = it || Object.assign({ id: e.id, sets: 2, rest: 30 }, e.mode === 'time' ? { secs: e.base } : { reps: e.base }); startWorkout({ idx: -1, focus: 'stab', warm: [], main: [item], cool: [], single: true }); };
  }

  function viewStats(root) {
    const p = S.prog, c = Game.cat(p.xp);
    const B = { first: '🥇', streak3: '🔥', streak7: '📅', reps500: '💯', reps2000: '🏋️', cam: '📷', week: '🗓️', level5: '🎽', legend: '👑' };
    root.innerHTML = `<div class="topbar"><h1 style="font-size:40px">${t('tabStats')}</h1></div>
      <div class="stats3"><div class="stat"><div class="v gold">${p.xp}</div><div class="l">${t('xp')}</div></div><div class="stat"><div class="v">${p.reps}</div><div class="l">${t('totalReps')}</div></div><div class="stat"><div class="v">${p.best}</div><div class="l">${t('streak')} max</div></div></div>
      <div class="sec-t"><h3>${t('cat')}</h3><span class="small muted">${t('motto')}</span></div>
      <div class="ladder">${t('catNames').map((n, i) => `<div class="rung ${i <= c.i ? 'got' : ''} ${i === c.i ? 'cur' : ''}">${shield(i, 30)}<b style="flex:1">${n}</b><span class="small">${Game.THRESH[i]} ${t('xp')} · +${i * 7}%</span></div>`).join('')}</div>
      <div class="sec-t"><h3>${t('badges')}</h3></div>
      <div class="badges">${Object.keys(B).map(k => `<div class="bdg ${p.badges.includes(k) ? 'got' : ''}"><div class="e">${B[k]}</div>${t('badgeNames')[k]}</div>`).join('')}</div>
      <div class="sec-t"><h3>${t('history')}</h3></div>
      <div>${p.hist.length ? p.hist.slice(0, 30).map(h => `<div class="hist"><span>${h.date}<br><span class="muted small">${h.day >= 0 ? t('focus')[h.focus] || '' : ''}</span></span><span style="text-align:right"><b class="gold">+${h.xp} XP</b><br><span class="muted small">${h.reps} ${t('reps')} · ${Math.round((h.dur || 0) / 60)} ${t('min')}${h.verified ? ' · 📷' + h.verified : ''}</span></span></div>`).join('') : `<p class="muted">${t('noHistory')}</p>`}</div>`;
  }

  function viewSettings(root) {
    const st = S.settings, pr = S.profile;
    root.innerHTML = `<div class="topbar"><h1 style="font-size:40px">${t('settings')}</h1></div>
      <div class="set-row"><span>${t('language')}</span><div class="seg" id="sLang">${I18N.langs.map(l => `<button data-l="${l.id}" class="${I18N.lang === l.id ? 'on' : ''}">${l.flag} ${l.id.toUpperCase()}</button>`).join('')}</div></div>
      <div class="set-row"><span>${t('voice')}</span><span class="sw ${st.voice ? 'on' : ''}" id="sVoice"></span></div>
      <div class="set-row"><span>${t('music')}</span><span class="sw ${st.music ? 'on' : ''}" id="sMusic"></span></div>
      <div class="set-row"><span>${t('musicStyle')}</span><select class="inp" id="sStyle" style="width:auto">${Object.entries(Music.STYLES).map(([k, v]) => `<option value="${k}" ${st.style === k ? 'selected' : ''}>${v[I18N.lang] || v.es}</option>`).join('')}</select></div>
      <div class="set-row"><span>${t('volume')}</span><input type="range" min="0" max="1" step="0.05" value="${st.vol}" id="sVol"></div>
      <div class="set-row"><span>${t('permWake')}</span><span class="sw ${st.wake ? 'on' : ''}" id="sWake"></span></div>
      <div class="sec-t"><h3>${t('profile')}</h3></div>
      <div class="set-row"><span>${esc(pr.name)} · ${pr.age} · ${Math.round(pr.weight)} kg · ${Math.round(pr.height)} cm</span><span class="small lime">${t('bmi')} ${S.plan.d.bmi.toFixed(1)}</span></div>
      <button class="btn dark" id="sRedo" style="margin-bottom:10px">${t('redo')}</button>
      <button class="btn dark" id="sRegen" style="margin-bottom:10px">${t('regen')}</button>
      <div class="row" style="margin-bottom:10px"><button class="btn ghost" id="sExp">${t('export')}</button><label class="btn ghost" style="cursor:pointer">${t('import')}<input type="file" accept=".json,application/json" id="sImp" hidden></label></div>
      <button class="btn ghost" id="sReset" style="color:var(--red);border-color:#5a2a20">${t('reset')}</button>
      <p class="small dim" style="text-align:center;margin-top:20px">ASCENSO v1.0 · ${t('motto')}</p>`;
    $$('#sLang button', root).forEach(b => b.onclick = () => { I18N.lang = b.dataset.l; S.settings.lang = I18N.lang; S.profile.lang = I18N.lang; Voice.pick(); Store.save(); renderMain(); });
    const sw = (id, key, fn) => { $(id, root).onclick = e => { st[key] = !st[key]; e.target.classList.toggle('on', st[key]); fn && fn(st[key]); Store.save(); }; };
    sw('#sVoice', 'voice', v => Voice.on = v); sw('#sMusic', 'music', v => Music.setOn(v)); sw('#sWake', 'wake');
    $('#sStyle', root).onchange = e => { st.style = e.target.value; Music.setStyle(st.style); Store.save(); Music.resume(); Music.setOn(true); Music.start(); setTimeout(() => { if (!player) Music.stop(); }, 4000); };
    $('#sVol', root).oninput = e => { st.vol = +e.target.value; Music.setVol(st.vol); Store.save(); };
    $('#sRedo', root).onclick = () => startOnboarding(true);
    $('#sRegen', root).onclick = () => { S.prog.seed = (S.prog.seed || 0) + 1; S.plan = Planner.build(S.profile, S.prog.xp, S.prog.seed); Store.save(); toast(t('regen')); };
    $('#sExp', root).onclick = () => { const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const a = el(`<a download="ascenso-progreso.json"></a>`); a.href = URL.createObjectURL(b); a.click(); };
    $('#sImp', root).onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(txt => { try { const d = JSON.parse(txt); if (d.profile && d.prog) { Store.s = d; S = d; Store.save(); applySettings(); renderMain(); toast('✓'); } } catch (x) { toast('✗'); } }); };
    $('#sReset', root).onclick = () => { if (confirm(t('resetQ'))) { Store.reset(); S = Store.s; startOnboarding(); } };
  }

  /* ================= Reproductor de entrenamiento ================= */
  let player = null;
  const COUNTABLE = new Set(['squat', 'pushup', 'situp', 'lunge', 'jack', 'pullup', 'bridge', 'climber', 'burpee']);

  function buildSteps(day) {
    const out = [];
    const add = (it, block) => {
      const e = exById(it.id);
      for (let s = 1; s <= it.sets; s++) for (const side of (e.side ? [1, 2] : [0])) out.push({ it, e, m: exMotion(e), block, set: s, sets: it.sets, side, mode: it.secs ? 'time' : 'reps', target: it.secs || it.reps, rest: it.rest });
    };
    day.warm.forEach(i => add(i, 'warmup')); day.main.forEach(i => add(i, 'main')); day.cool.forEach(i => add(i, 'cool'));
    return out;
  }

  async function startWorkout(day) {
    Anim.clear();
    Music.resume(); Music.setStyle(S.settings.style); Music.setVol(S.settings.vol); Music.setOn(S.settings.music); Music.start();
    Voice.on = S.settings.voice;
    player = new Player(day);
    let wake = null;
    if (S.settings.wake && navigator.wakeLock) { try { wake = await navigator.wakeLock.request('screen'); } catch (e) { } }
    player.onExit = () => { if (wake) try { wake.release(); } catch (e) { } };
  }

  class Player {
    constructor(day) {
      this.day = day; this.steps = buildSteps(day); this.i = 0; this.state = 'ready';
      this.stats = { reps: 0, secs: 0, verified: 0, t0: Date.now(), combo: 0, maxCombo: 0 };
      this.videos = []; this.cam = false; this.paused = false; this.pauseAt = 0; this.pausedTotal = 0;
      this.render(); this.enterReady(6);
      this.raf = requestAnimationFrame(() => this.tick());
    }
    // reloj unificado (segundos) — el audio manda
    now() { return Music.playing ? Music.now() : performance.now() / 1000; }
    beatsPerSec() { return (Music.playing ? Music.bpm : BPM_FALLBACK) / 60; }
    render() {
      const v = el(`<div class="player"><div class="pl-top"><button class="iconbtn" id="plX">${IC.x}</button><div class="ttl"><b id="plName"></b><span id="plSub"></span></div><button class="iconbtn ${S.settings.music ? 'on' : ''}" id="plMus">${IC.music}</button><button class="iconbtn ${S.settings.voice ? 'on' : ''}" id="plVoi">${IC.voice}</button></div>
        <div class="pl-prog" id="plProg"></div>
        <div class="pl-stage"><div style="position:relative;flex:1;min-height:0;display:flex"><canvas class="anim" id="plAnim"></canvas><div class="counter"><div class="big" id="plBig"></div><div class="word" id="plWord"></div></div><div class="phase-tag" id="plTag"></div><div class="combo hidden" id="plCombo"></div><div class="motiv" id="plMotiv"></div><div class="tapcount" id="plTap"></div></div>
          <div class="pl-cam" id="plCam"><video id="plVid" playsinline muted></video><canvas id="plCamC"></canvas><div class="camctl"><button class="iconbtn" id="plRec">${IC.rec}</button><button class="iconbtn" id="plFlip">${IC.flip}</button></div><div class="camnote" id="plCamNote"></div></div>
          <div class="restscreen hidden" id="plRest"></div></div>
        <div class="pl-bot"><div class="pl-info"><span class="cuet" id="plCue"></span></div><div class="pl-ctl"><button class="iconbtn" id="plCamBtn" title="${t('camOn')}">${IC.cam}</button><button class="btn dark" id="plPause">${t('pause')}</button><button class="btn" id="plDone">${t('done')}</button><button class="iconbtn" id="plSkip" title="${t('skipEx')}">»</button></div></div></div>`);
      document.body.appendChild(v); this.v = v;
      this.stage = new Figure.Stage($('#plAnim', v), { pad: 0.08, reserveTop: 150 });
      const prog = $('#plProg', v); prog.innerHTML = this.steps.map(() => '<i></i>').join('');
      $('#plX', v).onclick = () => { if (confirm(I18N.lang === 'en' ? 'Leave the workout?' : '¿Salir del entreno?')) this.exit(false); };
      $('#plMus', v).onclick = e => { S.settings.music = !S.settings.music; Music.setOn(S.settings.music); e.currentTarget.classList.toggle('on', S.settings.music); Store.save(); };
      $('#plVoi', v).onclick = e => { S.settings.voice = !S.settings.voice; Voice.on = S.settings.voice; if (!Voice.on) Voice.stop(); e.currentTarget.classList.toggle('on', S.settings.voice); Store.save(); };
      $('#plPause', v).onclick = () => this.togglePause();
      $('#plDone', v).onclick = () => { if (this.state === 'work') this.finishStep(false); else if (this.state === 'rest' || this.state === 'ready') this.enterWork(); };
      $('#plSkip', v).onclick = () => { if (this.state === 'work' || this.state === 'ready') { if (this.state === 'work') { const s = this.step(); if (s.mode === 'reps') { this.stats.reps += this.done; this.stats.verified += this.camDone; } else this.stats.secs += Math.min(s.target, Math.floor(Math.max(0, this.elapsed()))); } this.stats.combo = 0; this.next(true); } else this.enterWork(); };
      $('#plCamBtn', v).onclick = () => this.toggleCam();
      $('#plFlip', v).onclick = () => Cam.flip();
      $('#plRec', v).onclick = () => this.toggleRec();
      $('#plTap', v).onclick = () => { if (this.state === 'work' && this.step().mode === 'reps' && this.manual) this.addRep(false); };
    }
    step() { return this.steps[this.i]; }
    setHeader() {
      const s = this.step(); const e = s.e;
      $('#plName', this.v).textContent = nm(e) + (s.side ? (I18N.lang === 'en' ? (s.side === 1 ? ' · right' : ' · left') : (s.side === 1 ? ' · derecha' : ' · izquierda')) : '');
      $('#plSub', this.v).textContent = `${t(s.block)} · ${t('set')} ${s.set} ${t('of')} ${s.sets} · ${this.i + 1}/${this.steps.length}`;
      const cue = (Exercises.CUES[s.m.fam] || Exercises.CUES.stand)[I18N.lang];
      $('#plCue', this.v).textContent = '💡 ' + cue[s.set % cue.length];
      $$('#plProg i', this.v).forEach((x, k) => { x.className = k < this.i ? 'd' : k === this.i ? 'c' : ''; });
      this.stage.set(s.m);
      if (this.cam) Cam.setExercise(s.m.cam, nm(e));
      this.manual = this.cam && Cam.landmarker && COUNTABLE.has(s.m.cam);
    }
    say(kind) { Voice.say(I18N.motiv(kind, S.profile.name)); this.flash(I18N.motiv(kind, S.profile.name)); }
    flash(txt) { const m = $('#plMotiv', this.v); m.textContent = txt; m.classList.add('show'); clearTimeout(this._ft); this._ft = setTimeout(() => m.classList.remove('show'), 2200); }
    enterReady(sec) {
      this.state = 'ready'; this.setHeader(); this.tEnd = this.now() + sec; this.lastSay = null;
      $('#plTag', this.v).textContent = t('getReady'); $('#plDone', this.v).textContent = t('start');
      Voice.say(`${t('getReady')}. ${nm(this.step().e)}. ${this.i === 0 ? I18N.motiv('start', S.profile.name) : ''}`);
    }
    enterWork() {
      $('#plRest', this.v).classList.add('hidden');
      this.state = 'work'; this.setHeader(); this.done = 0; this.camDone = 0; this.holdGood = 0;
      const s = this.step();
      this.t0 = this.now(); this.pausedTotal = 0; this.lastRep = 0; this.lastSec = -1; this.saidHalf = false; this.saidLast = false;
      // alinear el arranque al siguiente pulso de la música para ir a tempo
      if (Music.playing) { const b = Music.beat(); this.beat0 = Math.ceil(b); this.t0 = this.now() + (this.beat0 - b) / this.beatsPerSec(); }
      else this.beat0 = 0;
      $('#plTag', this.v).textContent = s.mode === 'time' ? '⏱ ' + t('holdLeft') : (this.manual ? '📷 ' + t('verified') : '🎵 ' + t('reps'));
      $('#plDone', this.v).textContent = t('done');
      tryBlip('go');
      if (s.mode === 'time') Voice.say(I18N.lang === 'en' ? `Hold ${s.target} seconds` : `Aguanta ${s.target} segundos`, { interrupt: true });
    }
    elapsed() { return this.now() - this.t0 - this.pausedTotal; }
    tick() {
      if (!this.v || !this.v.isConnected) return;
      this.raf = requestAnimationFrame(() => this.tick());
      if (this.paused) return;
      const s = this.step(); if (!s) return;
      const now = this.now();
      const big = $('#plBig', this.v), word = $('#plWord', this.v);
      if (this.state === 'ready' || this.state === 'rest') {
        const left = Math.max(0, Math.ceil(this.tEnd - now));
        if (this.state === 'ready') { big.innerHTML = left; word.textContent = I18N.words(left); this.stage.draw(0); }
        else { const rl = $('#plRestT', this.v); if (rl) rl.textContent = left; }
        if (left <= 3 && left >= 1 && this.lastSay !== left) { this.lastSay = left; Voice.count(left); tryBlip('tick'); }
        if (now >= this.tEnd) { if (this.state === 'ready' || this.state === 'rest') { this.state = 'go'; Voice.say(I18N.lang === 'en' ? 'Go!' : '¡Ya!', { interrupt: true }); this.enterWork(); } }
        return;
      }
      if (this.state !== 'work') return;
      const el2 = this.elapsed();
      const m = s.m, bps = this.beatsPerSec();
      const beats = Math.max(0, el2 * bps);
      this.stage.draw(((beats / (m.b || 4)) % 1 + 1) % 1);
      if (s.mode === 'reps') {
        if (!this.manual) {
          const repLen = (m.b || 4) / (m.rpc || 1);
          const n = Math.floor(beats / repLen);
          if (el2 >= 0 && n > this.done) this.addRep(false);
        }
        big.innerHTML = `${this.done}<small>/${s.target}</small>`;
        if (this.cam) Cam.hud.count = `${this.done}/${s.target}`;
      } else {
        const left = Math.max(0, s.target - Math.floor(Math.max(0, el2)));
        big.innerHTML = left + '<small>s</small>'; word.textContent = I18N.words(left);
        if (this.cam) Cam.hud.count = left + 's';
        if (left !== this.lastSec) {
          this.lastSec = left;
          if (this.cam && Cam.camType === 'plank' && Cam._good) this.holdGood++;
          if (left <= 5 && left > 0) Voice.count(left);
          else if (!this.saidHalf && left === Math.floor(s.target / 2) && s.target >= 20) { this.saidHalf = true; this.say('mid'); }
          else if (left > 5 && left % 10 === 0 && left !== s.target) Voice.say(String(left), { interrupt: true });
        }
        if (el2 >= s.target) this.finishStep(true);
      }
    }
    addRep(fromCam) {
      const s = this.step(); this.done++;
      if (fromCam) this.camDone++;
      const word = $('#plWord', this.v); word.textContent = I18N.words(this.done);
      const left = s.target - this.done;
      if (!this.saidHalf && this.done === Math.ceil(s.target / 2) && s.target >= 10) { this.saidHalf = true; Voice.say(I18N.motiv('mid', S.profile.name), { interrupt: true }); this.flash(I18N.motiv('mid', S.profile.name)); }
      else if (!this.saidLast && left === 3 && s.target >= 8) { this.saidLast = true; Voice.say(`${this.done}. ${I18N.motiv('last', S.profile.name)}`, { interrupt: true }); this.flash(I18N.motiv('last', S.profile.name)); }
      else Voice.count(this.done);
      tryBlip('rep');
      const f = el(`<div class="xpfly">+${fromCam ? 1.5 : 1}</div>`); $('.pl-stage > div', this.v).appendChild(f); setTimeout(() => f.remove(), 900);
      if (this.done >= s.target) this.finishStep(true);
    }
    finishStep(complete) {
      const s = this.step();
      if (s.mode === 'reps') { this.stats.reps += this.done; this.stats.verified += this.camDone; }
      else { const held = Math.min(s.target, Math.floor(Math.max(0, this.elapsed()))); this.stats.secs += held; this.stats.verified += Math.round(this.holdGood / 3); }
      if (complete) { this.stats.combo++; this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo); }
      const cb = $('#plCombo', this.v); if (this.stats.combo >= 2) { cb.classList.remove('hidden'); cb.textContent = 'COMBO ×' + this.stats.combo; } else cb.classList.add('hidden');
      tryBlip('done');
      this.next(false);
    }
    next(skipped) {
      if (this.i >= this.steps.length - 1) return this.finish();
      const cur = this.step(); this.i++;
      const nx = this.step();
      if (skipped) { this.setHeader(); return this.enterReady(4); }
      const sameEx = nx.e.id === cur.e.id;
      const rest = sameEx && nx.side === 2 ? 5 : Math.max(8, cur.rest || 15);
      this.enterRest(rest, !sameEx);
    }
    enterRest(sec, announce) {
      this.state = 'rest'; this.tEnd = this.now() + sec; this.lastSay = null; this.setHeader();
      const nx = this.step();
      const r = $('#plRest', this.v); r.classList.remove('hidden');
      r.innerHTML = `<div class="tiny muted">${t('restT')}</div><div class="t" id="plRestT">${sec}</div><div class="tiny muted">${t('nextUp')}</div><canvas></canvas><b style="font-size:20px">${esc(nm(nx.e))}</b><span class="muted">${nx.mode === 'time' ? nx.target + ' ' + t('sec') : nx.target + ' ' + t('reps')}${nx.side ? ' · ' + (nx.side === 1 ? (I18N.lang === 'en' ? 'right' : 'derecha') : (I18N.lang === 'en' ? 'left' : 'izquierda')) : ''}</span><div class="row"><button class="btn sm dark" id="plPlus">+10 s</button><button class="btn sm" id="plGo">${t('skip')} »</button></div>`;
      const st = new Figure.Stage($('canvas', r), { pad: 0.1 }); st.set(nx.m);
      const it = { s: st, m: nx.m, off: 0, speed: 1 }; Anim.items.add(it);
      $('#plPlus', r).onclick = () => { this.tEnd += 10; };
      $('#plGo', r).onclick = () => this.enterWork();
      $('#plTag', this.v).textContent = t('restT'); $('#plBig', this.v).innerHTML = ''; $('#plWord', this.v).textContent = '';
      $('#plDone', this.v).textContent = t('skip');
      if (announce) Voice.say(`${I18N.motiv('done', S.profile.name)} ${t('nextUp')}: ${nm(nx.e)}`);
      else Voice.say(I18N.motiv('rest', S.profile.name));
    }
    togglePause() {
      this.paused = !this.paused;
      const b = $('#plPause', this.v);
      if (this.paused) { this.pauseAt = this.now(); b.textContent = t('resume'); Music.stop(); Voice.stop(); }
      else {
        Music.start();
        // el reloj cambió al reiniciar la música: reanclamos
        const spent = this.pauseAt;
        if (this.state === 'work') { const el2 = spent - this.t0 - this.pausedTotal; this.t0 = this.now() - el2; this.pausedTotal = 0; }
        else { const left = this.tEnd - spent; this.tEnd = this.now() + left; }
        b.textContent = t('pause');
      }
    }
    async toggleCam() {
      setTimeout(() => this.stage._resize(), 50);
      const btn = $('#plCamBtn', this.v);
      if (this.cam) { this.cam = false; Cam.close(); $('#plCam', this.v).classList.remove('on'); this.v.classList.remove('camon'); btn.classList.remove('on'); this.manual = false; this.stage.opts.reserveTop = 150; return; }
      try {
        $('#plCam', this.v).classList.add('on'); this.v.classList.add('camon'); btn.classList.add('on');
        await Cam.open($('#plVid', this.v), $('#plCamC', this.v), 'user');
        this.cam = true; this.stage.opts.reserveTop = 90; this.stage._resize();
        const s = this.step(); Cam.setExercise(s.m.cam, nm(s.e));
        Cam.onRep = () => { if (this.state === 'work' && this.manual && this.step().mode === 'reps') this.addRep(true); };
        Cam.onFb = (k, good) => { Cam.hud.fb = t(k); if (!good && k !== 'formNoBody' && this.state === 'work') { Voice.say(t(k)); } };
        const note = $('#plCamNote', this.v); note.textContent = t('formLoading');
        const wait = setInterval(() => {
          if (!this.cam) return clearInterval(wait);
          if (Cam.landmarker) { clearInterval(wait); note.textContent = t('camHint'); setTimeout(() => note.classList.add('hidden'), 5000); const st = this.step(); this.manual = COUNTABLE.has(st.m.cam); }
          else if (Cam.offline) { clearInterval(wait); note.textContent = t('formOffline'); }
        }, 500);
      } catch (e) { toast(t('permCamNo')); $('#plCam', this.v).classList.remove('on'); this.v.classList.remove('camon'); btn.classList.remove('on'); }
    }
    async toggleRec() {
      const b = $('#plRec', this.v);
      if (Cam.rec && Cam.rec.state === 'recording') {
        const blob = await Cam.stopRec(); b.innerHTML = IC.rec;
        if (blob) { const ext = blob.type.includes('mp4') ? 'mp4' : 'webm'; this.videos.push({ url: URL.createObjectURL(blob), blob, name: `ascenso-${nm(this.step().e).replace(/[^\w\-áéíóúñ]+/gi, '_')}-${Game.dateKey()}.${ext}` }); toast('🎬 ' + t('saveVideo')); }
      } else if (Cam.startRec()) { b.innerHTML = IC.stop; toast('● ' + t('recording')); }
    }
    async finish() {
      this.state = 'done';
      if (Cam.rec && Cam.rec.state === 'recording') await this.toggleRec();
      const dur = Math.round((Date.now() - this.stats.t0) / 1000);
      const res = this.day.single ? Game.record({ day: -1, reps: this.stats.reps, secs: this.stats.secs, verified: this.stats.verified, dur, focus: 'single', combo: 0 })
        : Game.record({ day: this.day.idx, reps: this.stats.reps, secs: this.stats.secs, verified: this.stats.verified, dur, focus: this.day.focus, combo: this.stats.maxCombo });
      Voice.say(I18N.motiv('finish', S.profile.name), { interrupt: true });
      const videos = this.videos;
      this.exit(true);
      showSummary(res, this.stats, dur, videos);
    }
    exit(completed) {
      cancelAnimationFrame(this.raf);
      if (this.cam) Cam.close();
      Music.stop(); if (!completed) Voice.stop();
      this.stage.destroy(); this.v.remove(); this.v = null; player = null;
      this.onExit && this.onExit();
      if (!completed) renderMain();
    }
  }

  function showSummary(res, st, dur, videos) {
    const c = Game.cat(S.prog.xp);
    const v = el(`<div class="summary"><div style="font-size:60px">🏆</div><h1>${t('workoutDone')}</h1><p class="muted">${esc(I18N.motiv('finish', S.profile.name))}</p>
      <div class="tiny muted" style="margin-top:14px">${t('earned')}</div><div class="bigxp">+${res.xp} XP</div>
      <div class="stats3"><div class="stat"><div class="v">${st.reps}</div><div class="l">${t('totalReps')}</div></div><div class="stat"><div class="v">${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}</div><div class="l">${t('time')}</div></div><div class="stat"><div class="v">${IC.fire}${res.streak}</div><div class="l">${t('streak')}</div></div></div>
      ${st.verified ? `<p class="lime">📷 ${st.verified} ${t('verified')}</p>` : ''}
      <div class="catcard" style="text-align:left">${shield(c.i, 56)}<div style="flex:1"><div class="disp" style="font-size:28px">${c.name}</div><div class="prog"><b style="width:${Math.round(c.pct * 100)}%"></b></div><div class="small muted" style="margin-top:6px">${t('exig')} +${Math.round((Game.mult(S.prog.xp) - 1) * 100)}%</div></div></div>
      ${res.badges.length ? `<div class="sec-t"><h3>${t('badges')}</h3></div><p>${res.badges.map(b => '🏅 ' + t('badgeNames')[b]).join('<br>')}</p>` : ''}
      ${videos.length ? `<div class="sec-t"><h3>🎬 Video</h3></div><div class="vids">${videos.map((x, i) => `<a href="${x.url}" download="${esc(x.name)}" data-i="${i}">⬇ ${t('saveVideo')} ${i + 1}</a>`).join('')}</div>` : ''}
      <div class="sec-t"><h3>${t('rpeQ')}</h3></div><div class="rpe"><button data-r="1">😌 ${t('rpe1')}</button><button data-r="2">💪 ${t('rpe2')}</button><button data-r="3">🥵 ${t('rpe3')}</button></div><p class="small muted">${t('rpeHint')}</p>
      <div class="motto" style="margin:18px 0">${t('motto')}</div>
      <button class="btn" id="sumOk">${t('cont')}</button></div>`);
    document.body.appendChild(v);
    $$('.rpe button', v).forEach(b => b.onclick = () => { $$('.rpe button', v).forEach(x => x.classList.remove('on')); b.classList.add('on'); Game.setRPE(+b.dataset.r); });
    $('#sumOk', v).onclick = () => { v.remove(); S.plan = Planner.build(S.profile, S.prog.xp, S.prog.seed); Store.save(); tab = 'home'; renderMain(); };
    if (res.levelUp) setTimeout(() => levelUp(res.cat), 900);
  }

  function levelUp(i) {
    const v = el(`<div class="lvup">${shield(i, 150)}<h1>${t('levelUp')}</h1><div class="disp" style="font-size:44px">${t('catNames')[i]}</div><p class="motto" style="text-align:center">${t('motto')}</p><p class="muted">${t('exig')}: +${i * 7}%</p><button class="btn" style="max-width:320px;margin-top:20px">${t('cont')}</button><canvas class="confetti"></canvas></div>`);
    document.body.appendChild(v); tryBlip('level');
    Voice.say(I18N.motiv('level', S.profile.name), { interrupt: true });
    $('button', v).onclick = () => v.remove();
    const c = $('canvas', v), ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const P2 = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -Math.random() * c.height, vy: 2 + Math.random() * 4, vx: -1 + Math.random() * 2, r: Math.random() * 6.28, col: ['#c6ff3d', '#ffc23d', '#fff', '#5a8cff'][Math.floor(Math.random() * 4)] }));
    const loop = () => { if (!c.isConnected) return; ctx.clearRect(0, 0, c.width, c.height); P2.forEach(p => { p.y += p.vy; p.x += p.vx; p.r += 0.1; if (p.y > c.height) p.y = -10; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }); requestAnimationFrame(loop); };
    loop();
  }

  /* ================= Arranque ================= */
  function applySettings() {
    const st = S.settings;
    I18N.lang = (S.profile && S.profile.lang) || st.lang || ((navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es');
    Voice.on = st.voice; Voice.pick();
    Music.style = st.style || 'house'; Music.vol = st.vol; Music.on = st.music;
    document.documentElement.lang = I18N.lang;
  }

  function boot() {
    S = Store.load(); applySettings();
    if (!S.profile) startOnboarding(); else renderMain();
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  window.ASCENSO = { boot, get state() { return S; }, startWorkout };
  boot();
})();
