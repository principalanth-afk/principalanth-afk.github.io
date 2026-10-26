/* ASCENSO — Planificador de 7 días y sistema de categorías
   Ajusta la exigencia por edad, IMC, nivel físico, objetivo, molestias, equipo y categoría. */
(function (G) {
  'use strict';
  const KEY = 'ascenso.v1';
  const THRESH = [0, 250, 600, 1100, 1800, 2800, 4200, 6000, 8500, 12000];

  /* ---------------- Estado persistente ---------------- */
  const Store = {
    s: null,
    load() {
      try { this.s = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { this.s = null; }
      if (!this.s) this.s = { profile: null, settings: { voice: true, music: true, style: 'house', vol: 0.7, wake: true, units: 'metric' }, prog: { xp: 0, streak: 0, best: 0, last: null, reps: 0, secs: 0, verified: 0, hist: [], badges: [], weeks: {}, adj: 1, seed: 0 } };
      return this.s;
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { } },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { } this.s = null; this.load(); }
  };

  /* ---------------- Categorías (niveles) ---------------- */
  const Game = {
    THRESH,
    catIndex(xp) { let i = 0; THRESH.forEach((t, k) => { if (xp >= t) i = k; }); return i; },
    cat(xp) { const i = this.catIndex(xp); const next = THRESH[i + 1]; return { i, name: I18N.t('catNames')[i], next, prev: THRESH[i], pct: next ? (xp - THRESH[i]) / (next - THRESH[i]) : 1 }; },
    mult(xp) { return 1 + 0.07 * this.catIndex(xp); },
    dateKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    weekKey(d) { d = new Date(d || Date.now()); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return this.dateKey(d); },
    todayIdx() { return (new Date().getDay() + 6) % 7; },
    // registra un entreno terminado
    record(w) {
      const p = Store.s.prog; const before = this.catIndex(p.xp);
      const today = this.dateKey();
      if (p.last !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        p.streak = p.last === this.dateKey(y) ? p.streak + 1 : 1; p.last = today;
      }
      p.best = Math.max(p.best, p.streak);
      const streakBonus = Math.min(70, 10 * p.streak);
      const worked = w.reps + w.secs > 20;
      const xp = Math.round(w.reps + w.secs * 0.4 + w.verified * 0.5 + (worked ? 40 + streakBonus + (w.combo || 0) * 5 : 0));
      p.xp += xp; p.reps += w.reps; p.secs += w.secs; p.verified += w.verified;
      const wk = this.weekKey(); p.weeks[wk] = p.weeks[wk] || []; if (!p.weeks[wk].includes(w.day)) p.weeks[wk].push(w.day);
      p.hist.unshift({ date: today, day: w.day, xp, reps: w.reps, secs: w.secs, verified: w.verified, dur: w.dur, focus: w.focus });
      p.hist = p.hist.slice(0, 120);
      const after = this.catIndex(p.xp);
      const nb = this.checkBadges();
      Store.save();
      return { xp, levelUp: after > before, cat: after, badges: nb, streak: p.streak };
    },
    setRPE(r) { const p = Store.s.prog; p.adj = Math.max(0.7, Math.min(1.4, (p.adj || 1) * (r === 1 ? 1.06 : r === 3 ? 0.94 : 1.0))); Store.save(); },
    checkBadges() {
      const p = Store.s.prog, have = new Set(p.badges), nb = [];
      const wk = p.weeks[this.weekKey()] || [];
      const rules = { first: p.hist.length >= 1, streak3: p.streak >= 3, streak7: p.streak >= 7, reps500: p.reps >= 500, reps2000: p.reps >= 2000, cam: p.verified >= 20, week: wk.length >= 7, level5: this.catIndex(p.xp) >= 4, legend: this.catIndex(p.xp) >= 9 };
      for (const [k, ok] of Object.entries(rules)) if (ok && !have.has(k)) { p.badges.push(k); nb.push(k); }
      return nb;
    }
  };

  /* ---------------- Perfil derivado ---------------- */
  function derive(pr) {
    const h = (pr.height || 172) / 100, w = pr.weight || 72;
    const bmi = w / (h * h);
    const age = pr.age || ({ j: 15, '18': 24, '30': 35, '40': 45, '50': 56 })[pr.ageGroup] || 30;
    const bestB = { bs_1: 1, bs_2: 0.6, bs_3: 0.3, bs_never: 0 }[pr.best] || 0.3;
    const fit = Math.max(0, Math.min(1, (pr.push || 0) / 3 * 0.35 + (pr.squat || 0) / 3 * 0.22 + (pr.freq || 0) / 3 * 0.3 + bestB * 0.13));
    const userLv = fit < 0.34 ? 1 : fit < 0.68 ? 2 : 3;
    const levelF = 0.6 + 0.7 * fit;
    const ageF = age < 14 ? 0.7 : age < 18 ? 0.85 : age < 30 ? 1 : age < 40 ? 0.95 : age < 50 ? 0.86 : age < 60 ? 0.74 : 0.62;
    const bmiF = bmi < 18.5 ? 0.95 : bmi < 25 ? 1 : bmi < 30 ? 0.9 : bmi < 35 ? 0.78 : 0.66;
    const bodyF = pr.body === 'b_over' ? 0.88 : pr.body === 'b_chubby' ? 0.95 : 1;
    const probs = pr.probs || [];
    const football = pr.foot === 'fo_team' || pr.foot === 'fo_rec' || pr.ageGroup === 'j' || (age < 23 && pr.foot !== 'fo_no');
    const lowImpact = bmi >= 30 || age >= 55 || probs.includes('pr_knee') || pr.body === 'b_over';
    return { bmi, age, fit, userLv, levelF, ageF, bmiF, bodyF, probs, football, lowImpact, minor: age < 18 };
  }

  /* ---------------- RNG con semilla ---------------- */
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  const FOCUS = {
    stab: { secs: ['FA', 'FB', 'FF', 'FG'], int: 1 },
    push: { secs: ['MA', 'MB', 'MC'], int: 1 },
    rot: { secs: ['FC', 'FD', 'FE', 'FG'], int: 1 },
    full: { secs: ['ME', 'MD', 'MC'], int: 1.05 },
    ball: { secs: ['FH', 'FC', 'MD'], int: 1 },
    legs: { secs: ['MD', 'FF', 'FG', 'ME'], int: 1 },
    upper: { secs: ['MA', 'MB', 'FA', 'FE'], int: 1 },
    prt: { secs: ['MF'], int: 0.9 },
    rec: { secs: ['FA', 'FF', 'FG', 'MF'], int: 0.6, light: true },
    pre: { secs: ['FA', 'FH', 'FF'], int: 0.55, light: true },
    match: { secs: ['FH', 'FF'], int: 0.45, light: true },
    post: { secs: ['FF', 'FG', 'FA'], int: 0.5, light: true }
  };

  function weekTemplate(pr, d) {
    let t;
    if (d.football) t = ['stab', 'push', 'rot', 'rec', 'full', 'ball', 'prt'];
    else t = ['full', 'stab', 'legs', 'rec', 'upper', 'prt', 'rec'];
    if (pr.goal === 'g_lose' && !d.football) t[6] = 'full';
    if (pr.goal === 'g_muscle' && !d.football) t[6] = 'push';
    const md = pr.matchDay;
    if (d.football && md != null && md >= 0) {
      t = t.slice();
      t[md] = 'match'; t[(md + 6) % 7] = 'pre'; t[(md + 1) % 7] = 'post';
    }
    return t;
  }

  function allowed(e, pr, d, focus) {
    const eq = new Set(['none'].concat(pr.equip || []));
    if (!eq.has(e.equip)) return false;
    if (e.avoid.includes('back') && d.probs.includes('pr_back')) return false;
    if (e.avoid.includes('knee') && d.probs.includes('pr_knee')) return false;
    if (e.impact && d.lowImpact) return false;
    if (e.lv > d.userLv + (d.userLv === 1 ? 1 : 0)) return false;
    if (d.age >= 50 && e.lv >= 3) return false;
    if (d.minor && (e.equip === 'partner' || e.equip === 'pack')) return false;
    if (FOCUS[focus].light && (e.lv >= 2 || e.impact)) return false;
    if (e.motion === 'fifa11') return false;
    return true;
  }

  function dose(e, pr, d, focus, xp, rnd) {
    const F = d.levelF * d.ageF * d.bmiF * d.bodyF * Game.mult(xp) * (Store.s.prog.adj || 1) * FOCUS[focus].int;
    if (e.mode === 'time') { const s = Math.max(10, Math.round(e.base * F / 5) * 5); return { secs: Math.min(s, e.base * 3) }; }
    return { reps: Math.max(e.side ? 4 : 5, Math.round(e.base * F)) };
  }

  function nCount(pr) { return ({ d_15: 5, d_20: 6, d_25: 7, d_30: 9, d_x: 6 })[pr.dur] || 6; }

  function build(pr, xp, seedOff) {
    const d = derive(pr);
    const wk = Game.weekKey();
    const r = rng(hash(wk + ':' + (seedOff || 0) + ':' + (pr.name || '')));
    const tpl = weekTemplate(pr, d);
    const L = Exercises.LIST;
    const usedWeek = {};
    const zones = new Set(pr.zones || []);
    const goalLose = pr.goal === 'g_lose' || pr.goal === 'g_recomp';
    const sets = d.userLv === 1 ? 2 : 3;
    const days = tpl.map((focus, di) => {
      const fo = FOCUS[focus];
      const light = !!fo.light;
      // calentamiento
      const warmPool = L.filter(e => e.warm && e.motion !== 'fifa11' && allowed(e, pr, d, 'rec'));
      const warm = [];
      if (d.football && ['stab', 'rot', 'ball', 'match', 'pre', 'full'].includes(focus)) {
        const f = L.find(e => e.motion === 'fifa11'); warm.push({ id: f.id, secs: focus === 'match' ? 300 : 90, sets: 1, rest: 10 });
      } else {
        warm.push({ id: d.lowImpact ? 'ME7' : 'ME22', reps: 20, sets: 1, rest: 10 });
      }
      shuffle(warmPool, r).slice(0, focus === 'match' ? 1 : 2).forEach(e => warm.push({ id: e.id, reps: Math.max(6, Math.round(e.base * 0.8)), sets: 1, rest: 10 }));

      // bloque principal
      const pool = L.filter(e => fo.secs.includes(e.sec) && allowed(e, pr, d, focus) && !e.warm);
      const scored = pool.map(e => {
        let s = r() * 3;
        e.zones.forEach(z => { if (zones.has(z)) s += 1.6; });
        if (d.football && e.football) s += 2;
        if (e.lv === d.userLv) s += 1.2;
        if (usedWeek[e.id]) s -= 4;
        if (goalLose && (e.impact || e.type === 'full')) s += 1;
        if (pr.goal === 'g_muscle' && ['push', 'pull', 'legs'].includes(e.type)) s += 1;
        if (pr.pos === 'po_gk' && ['rotation', 'ball', 'push'].includes(e.type)) s += 0.8;
        if (pr.pos === 'po_def' && ['hip', 'posterior', 'antirot'].includes(e.type)) s += 0.8;
        if (pr.pos === 'po_mid' && ['stability', 'full', 'rotation'].includes(e.type)) s += 0.8;
        if (pr.pos === 'po_fw' && ['rotation', 'legs', 'posterior'].includes(e.type)) s += 0.8;
        if ((pr.more || []).includes('m_post') && ['posterior', 'stability', 'hip'].includes(e.type)) s += 0.6;
        if ((pr.more || []).includes('m_endur') && (e.type === 'full' || e.impact)) s += 0.6;
        return { e, s };
      }).sort((a, b) => b.s - a.s);
      const n = light ? Math.max(3, nCount(pr) - 2) : nCount(pr);
      const main = [], motions = new Set(), secCount = {};
      for (const { e } of scored) {
        if (main.length >= n) break;
        if (motions.has(e.motion)) continue;
        if ((secCount[e.sec] || 0) >= Math.ceil(n / Math.min(fo.secs.length, 3)) + 1) continue;
        motions.add(e.motion); secCount[e.sec] = (secCount[e.sec] || 0) + 1; usedWeek[e.id] = 1;
        main.push(Object.assign({ id: e.id, sets: light ? 1 + (d.userLv > 1 ? 1 : 0) : sets, rest: goalLose ? 20 : pr.goal === 'g_muscle' ? 45 : 30 }, dose(e, pr, d, focus, xp, r)));
      }
      // vuelta a la calma
      const coolIds = ['FA1', 'FE1', 'FF7', 'FG5', 'FA18'];
      const cool = shuffle(coolIds.filter(id => allowed(Exercises.byId(id), pr, d, 'rec') && !main.some(m => m.id === id)), r).slice(0, 2)
        .map(id => { const e = Exercises.byId(id); return Object.assign({ id, sets: 1, rest: 10 }, e.mode === 'time' ? { secs: 20 } : { reps: 10 }); });
      const day = { idx: di, focus, warm, main, cool };
      day.mins = Math.round(estimate(day) / 60);
      return day;
    });
    return { week: wk, seed: seedOff || 0, days, d, created: Date.now() };
  }

  function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function repSecs(e) { const m = Motions[e.motion]; const bpm = (G.Music && Music.bpm) || 124; return (m.b || 4) * 60 / bpm / (m.rpc || 1); }
  function itemSecs(it) {
    const e = Exercises.byId(it.id); const sides = e.side ? 2 : 1;
    const work = it.secs ? it.secs * sides : it.reps * repSecs(e) * sides;
    return it.sets * (work + it.rest) + 8;
  }
  function estimate(day) { return [...day.warm, ...day.main, ...day.cool].reduce((a, it) => a + itemSecs(it), 0); }

  G.Store = Store; G.Game = Game; G.Planner = { build, derive, estimate, itemSecs, repSecs, FOCUS };
})(window);
