/* ASCENSO — Motor del atleta animado
   Esqueleto 2D articulado (vista lateral y frontal) con cinemática inversa,
   interpolación de poses y dibujo en canvas. Sin imágenes externas. */
(function (G) {
  'use strict';
  const L = { torso: 0.47, neck: 0.08, headR: 0.105, ua: 0.29, fa: 0.31, th: 0.44, sh: 0.43, foot: 0.15, shW: 0.17, hipW: 0.085 };
  const R = { hip: 0.115, chest: 0.135, neck: 0.045, ua: [0.055, 0.045], fa: [0.045, 0.034], th: [0.085, 0.058], sh: [0.058, 0.044], foot: 0.04 };
  const D2R = Math.PI / 180;
  const dir = a => [Math.sin(a * D2R), -Math.cos(a * D2R)];
  const angOf = (dx, dy) => Math.atan2(dx, -dy) / D2R;
  const add = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k];
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpAng = (a, b, t) => a + ((((b - a) % 360) + 540) % 360 - 180) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function ik(root, target, l1, l2, bend) {
    const dx = target[0] - root[0], dy = target[1] - root[1];
    let d = Math.hypot(dx, dy);
    const base = angOf(dx, dy);
    d = clamp(d, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
    const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    const A = Math.acos(cosA) / D2R;
    const u = base + (bend || 1) * A;
    const j = add(root, dir(u), l1);
    const end = add(root, dir(base), d);
    return [u, angOf(end[0] - j[0], end[1] - j[1])];
  }

  const isIK = v => v && !Array.isArray(v) && v.to;
  const isRel = v => v && !Array.isArray(v) && v.r;

  // Normaliza una pose: completa extremidades faltantes
  function norm(p, view) {
    const q = Object.assign({ hip: [0, 0.92], t: 180 }, p);
    q.view = q.view || view || 'side';
    const front = q.view === 'front';
    const mirror = v => {
      if (!v) return v;
      if (Array.isArray(v)) return front ? [-v[0], -v[1]] : [v[0] + 4, v[1] + 3];
      if (v.r) return { r: front ? [-v.r[0], -v.r[1]] : [v.r[0] + 4, v.r[1] + 3] };
      if (v.to) return front ? { to: [2 * q.hip[0] - v.to[0], v.to[1]], b: -(v.b || 1) } : { to: [v.to[0] - 0.03, v.to[1]], b: v.b };
      return v;
    };
    if (!q.A1) q.A1 = front ? [8, 4] : [-3, -6];
    if (!q.L1) q.L1 = front ? { to: [q.hip[0] + 0.11, 0.06], b: 1 } : [0, 0];
    if (!q.A2) q.A2 = mirror(q.A1);
    if (!q.L2) q.L2 = mirror(q.L1);
    return q;
  }

  function roots(hip, t, front) {
    const td = dir(t);
    const sh0 = add(hip, td, L.torso - 0.04);
    if (!front) return { s1: sh0, s2: sh0, h1: hip, h2: hip };
    const sd = dir(t - 90);
    return { s1: add(sh0, sd, L.shW), s2: add(sh0, sd, -L.shW), h1: add(hip, sd, L.hipW), h2: add(hip, sd, -L.hipW) };
  }

  function limbAngles(v, root, l1, l2, t, defBend) {
    if (isIK(v)) return ik(root, v.to, l1, l2, v.b || defBend);
    if (isRel(v)) return [v.r[0] + (t - 180), v.r[1] + (t - 180)];
    return v;
  }

  // Interpola dos poses normalizadas y devuelve ángulos resueltos
  function blend(a, b, k) {
    const hip = [lerp(a.hip[0], b.hip[0], k), lerp(a.hip[1], b.hip[1], k)];
    const t = lerpAng(a.t, b.t, k);
    const ha = a.h == null ? a.t : a.h, hb = b.h == null ? b.t : b.h;
    const h = lerpAng(ha, hb, k);
    const front = (k < 0.5 ? a : b).view === 'front';
    const ra = roots(a.hip, a.t, a.view === 'front'), rb = roots(b.hip, b.t, b.view === 'front'), rr = roots(hip, t, front);
    const out = { hip, t, h, view: front ? 'front' : 'side', lift: lerp(a.lift || 0, b.lift || 0, k) };
    const spec = [['A1', 's1', L.ua, L.fa, -1], ['A2', 's2', L.ua, L.fa, -1], ['L1', 'h1', L.th, L.sh, 1], ['L2', 'h2', L.th, L.sh, 1]];
    for (const [key, rk, l1, l2, db] of spec) {
      const va = a[key], vb = b[key];
      if (isIK(va) && isIK(vb)) {
        const to = [lerp(va.to[0], vb.to[0], k), lerp(va.to[1], vb.to[1], k)];
        out[key] = ik(rr[rk], to, l1, l2, (k < 0.5 ? va.b : vb.b) || db);
      } else {
        const aa = limbAngles(va, ra[rk], l1, l2, a.t, db), bb = limbAngles(vb, rb[rk], l1, l2, b.t, db);
        out[key] = [lerpAng(aa[0], bb[0], k), lerpAng(aa[1], bb[1], k)];
      }
    }
    for (const f of ['F1', 'F2']) {
      if (a[f] != null || b[f] != null) {
        const fa = a[f] != null ? a[f] : null, fb = b[f] != null ? b[f] : null;
        out[f] = fa != null && fb != null ? lerpAng(fa, fb, k) : (k < 0.5 ? fa : fb);
      }
    }
    return out;
  }

  // Calcula posiciones de articulaciones
  function joints(r, opt) {
    const front = r.view === 'front';
    const rt = roots(r.hip, r.t, front);
    const neck = add(r.hip, dir(r.t), L.torso);
    const head = add(neck, dir(r.h), L.neck + L.headR);
    const limb = (root, an, l1, l2) => { const j = add(root, dir(an[0]), l1); return [root, j, add(j, dir(an[1]), l2)]; };
    const a1 = limb(rt.s1, r.A1, L.ua, L.fa), a2 = limb(rt.s2, r.A2, L.ua, L.fa);
    const l1 = limb(rt.h1, r.L1, L.th, L.sh), l2 = limb(rt.h2, r.L2, L.th, L.sh);
    const footAng = (leg, F, side) => F != null && F !== undefined ? F : front ? (side > 0 ? leg[1] + 70 : leg[1] - 70) : leg[1] + 90;
    const fl = front ? 0.08 : L.foot;
    const f1 = add(l1[2], dir(footAng(r.L1, r.F1, 1)), fl), f2 = add(l2[2], dir(footAng(r.L2, r.F2, -1)), fl);
    return { hip: r.hip, neck, head, sh1: rt.s1, sh2: rt.s2, a1, a2, l1, l2, f1, f2, front, t: r.t, h: r.h };
  }

  function shiftJ(J, dx, dy) {
    const s = p => { p[0] += dx; p[1] += dy; };
    const seen = new Set();
    const walk = o => {
      if (Array.isArray(o) && typeof o[0] === 'number') { if (!seen.has(o)) { seen.add(o); s(o); } return; }
      if (Array.isArray(o)) o.forEach(walk);
    };
    ['hip', 'neck', 'head', 'sh1', 'sh2', 'f1', 'f2'].forEach(k => walk(J[k]));
    ['a1', 'a2', 'l1', 'l2'].forEach(k => walk(J[k]));
  }

  function bottoms(J) {
    const pts = [[J.hip, R.hip], [J.sh1, R.chest * 0.9], [J.sh2, R.chest * 0.9], [J.head, L.headR], [J.l1[1], R.th[1]], [J.l2[1], R.th[1]],
      [J.a1[1], R.ua[1]], [J.a2[1], R.ua[1]], [J.a1[2], 0.035], [J.a2[2], 0.035], [J.l1[2], 0.05], [J.l2[2], 0.05], [J.f1, 0.025], [J.f2, 0.025]];
    // punto medio del torso
    pts.push([[(J.hip[0] + J.neck[0]) / 2, (J.hip[1] + J.neck[1]) / 2], R.chest]);
    return pts;
  }

  function jointByName(J, n) {
    return ({ hip: J.hip, neck: J.neck, head: J.head, hand1: J.a1[2], hand2: J.a2[2], elb1: J.a1[1], elb2: J.a2[1], knee1: J.l1[1], knee2: J.l2[1], ank1: J.l1[2], ank2: J.l2[2], foot1: J.f1, foot2: J.f2, sh: J.sh1,
      hands: [(J.a1[2][0] + J.a2[2][0]) / 2, (J.a1[2][1] + J.a2[2][1]) / 2] })[n];
  }

  function propBottom(pr, J) {
    if (pr.type === 'fitball') { const p = pr.pos || jointByName(J, pr.at); return p[1] - 0.05 - 0.66; }
    return Infinity;
  }

  // Resuelve el fotograma completo de un movimiento en la fase dada (0..1)
  function frame(motion, phase) {
    const ks = motion._k, n = ks.length;
    let times = motion.times;
    if (!times) times = ks.map((_, i) => i / n);
    let i = n - 1;
    for (let j = 0; j < n; j++) if (phase >= times[j]) i = j;
    const t0 = times[i], t1 = i + 1 < n ? times[i + 1] : 1;
    let k = t1 > t0 ? (phase - t0) / (t1 - t0) : 0;
    k = motion.ease === 'linear' ? k : 0.5 - 0.5 * Math.cos(Math.PI * clamp(k, 0, 1));
    const a = ks[i], b = ks[(i + 1) % n];
    const r = blend(a, b, k);
    const J = joints(r);
    const props = (motion.props || []).concat((k < 0.5 ? a : b).props || []);
    if (motion.pin) {
      const p = jointByName(J, motion.pin.j);
      shiftJ(J, motion.pin.x != null ? motion.pin.x - p[0] : 0, motion.pin.y - p[1]);
    } else if (motion.g !== false && !motion.overhead) {
      let m = Infinity;
      for (const [p, rad] of bottoms(J)) m = Math.min(m, p[1] - rad);
      for (const pr of props) m = Math.min(m, propBottom(pr, J));
      shiftJ(J, 0, -m);
    }
    if (r.lift) shiftJ(J, 0, r.lift);
    J.props = props;
    return J;
  }

  function prepare(motion) {
    if (motion._k) return motion;
    motion._k = motion.k.map(p => norm(p, motion.view));
    return motion;
  }

  // Caja que envuelve todo el ciclo (para encuadrar la cámara)
  function bounds(motion) {
    prepare(motion);
    if (motion._b) return motion._b;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const inc = (p, r) => { x0 = Math.min(x0, p[0] - r); x1 = Math.max(x1, p[0] + r); y0 = Math.min(y0, p[1] - r); y1 = Math.max(y1, p[1] + r); };
    for (let s = 0; s < 24; s++) {
      const J = frame(motion, s / 24);
      bottoms(J).forEach(([p, r]) => inc(p, r));
      inc(J.head, L.headR + 0.03);
      J.props.forEach(pr => { const bb = propBox(pr, J); if (bb) { inc([bb[0], bb[1]], 0); inc([bb[2], bb[3]], 0); } });
    }
    if (!motion.overhead) y0 = Math.min(y0, 0);
    motion._b = [x0, y0, x1, y1];
    return motion._b;
  }

  function propBox(pr, J) {
    const at = pr.at ? jointByName(J, pr.at) : null;
    switch (pr.type) {
      case 'bench': case 'box': { const x = pr.x != null ? pr.x : at[0]; const h = pr.h != null ? pr.h : at[1] - 0.05; const w = pr.w || 0.45; return [x - w / 2, 0, x + w / 2, h]; }
      case 'bar': return [(pr.x || 0) - 0.45, pr.y - 0.05, (pr.x || 0) + 0.45, pr.y + 0.25];
      case 'wall': return [pr.x - 0.06, 0, pr.x + 0.06, 2.2];
      case 'rope': return [pr.x - 0.03, 0, pr.x + 0.03, 3.1];
      case 'parallels': return [(pr.x || 0) - 0.35, 0, (pr.x || 0) + 0.35, pr.y];
      default: return null;
    }
  }

  /* ---------------- Dibujo ---------------- */
  const PAL = {
    skin: '#c88a5c', skinD: '#9c6640', hair: '#1c1410', jersey: '#c6ff3d', jerseyD: '#8fbf1e', num: '#0b0f0a',
    shorts: '#16181b', shortsD: '#0d0e10', trim: '#c6ff3d', shoe: '#f4f4f0', shoeD: '#b9bcb5', sole: '#c6ff3d'
  };

  function capsule(ctx, a, b, ra, rb, fill, stroke) {
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
    const an = Math.atan2(dy, dx);
    const off = Math.acos(clamp((ra - rb) / d, -1, 1));
    ctx.beginPath();
    ctx.arc(a[0], a[1], ra, an + off, an + 2 * Math.PI - off);
    ctx.arc(b[0], b[1], rb, an - off, an + off);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
  }

  function makeView(W, H, box, opts) {
    const pad = (opts && opts.pad) || 0.12;
    const bw = box[2] - box[0], bh = box[3] - box[1];
    const top = Math.min(H * 0.45, (opts && opts.reserveTop) || 0), Hh = H - top;
    const s = Math.min(W * (1 - 2 * pad) / bw, Hh * (1 - 2 * pad) / bh, (opts && opts.maxScale) || 1e9);
    const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    return { s, tx: x => W / 2 + (x - cx) * s, ty: y => top + Hh / 2 - (y - cy) * s + ((opts && opts.dropY) || 0) };
  }

  function drawStage(ctx, W, H, V, motion, theme) {
    const th = theme || {};
    if (!th.transparent) {
      const g = ctx.createRadialGradient(W / 2, H * 0.45, 10, W / 2, H * 0.5, Math.max(W, H) * 0.75);
      g.addColorStop(0, th.bg1 || '#1b2418'); g.addColorStop(1, th.bg2 || '#070907');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (motion && motion.overhead) {
      ctx.fillStyle = 'rgba(198,255,61,0.07)';
      const x0 = V.tx(-0.5), y0 = V.ty(1.2), w = 1.0 * V.s, h = 2.6 * V.s;
      roundRect(ctx, x0, y0, w, h, 14); ctx.fill();
      return;
    }
    const fy = V.ty(0);
    const lg = ctx.createLinearGradient(0, fy, 0, H);
    lg.addColorStop(0, 'rgba(198,255,61,0.10)'); lg.addColorStop(1, 'rgba(198,255,61,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, fy, W, H - fy);
    ctx.strokeStyle = 'rgba(198,255,61,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke();
    // marcas de cancha
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) { const y = fy + i * i * 4; if (y > H) break; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function soccerBall(ctx, x, y, r) {
    ctx.fillStyle = '#f7f7f2'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#111';
    const pent = (cx, cy, rr, rot) => { ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + i * 2 * Math.PI / 5; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
    pent(x, y, r * 0.38, -Math.PI / 2);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; pent(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, r * 0.22, a); }
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  }

  function drawProps(ctx, V, J, layer) {
    for (const pr of J.props) {
      const lay = pr.layer || (['ball', 'medball', 'dumbbell', 'wheel', 'sack', 'band', 'kettle', 'stick'].includes(pr.type) ? 'front' : 'back');
      if (lay !== layer) continue;
      const at = pr.at ? jointByName(J, pr.at) : null;
      const P = p => [V.tx(p[0]), V.ty(p[1])];
      ctx.save();
      switch (pr.type) {
        case 'bench': case 'box': {
          const b = propBox(pr, J); const x0 = V.tx(b[0]), x1 = V.tx(b[2]), y0 = V.ty(b[3]), y1 = V.ty(0);
          ctx.fillStyle = pr.type === 'box' ? '#3a3f45' : '#2b2f33'; roundRect(ctx, x0, y0, x1 - x0, Math.max(6, (y1 - y0) * 0.22), 4); ctx.fill();
          ctx.fillStyle = '#4d545b'; ctx.fillRect(x0, y0, x1 - x0, 3);
          ctx.fillStyle = '#1f2226';
          if (pr.type === 'box') { ctx.fillRect(x0 + 2, y0 + 4, x1 - x0 - 4, y1 - y0 - 4); }
          else { ctx.fillRect(x0 + 6, y0, 6, y1 - y0); ctx.fillRect(x1 - 12, y0, 6, y1 - y0); }
          break;
        }
        case 'wall': {
          const x = V.tx(pr.x); ctx.fillStyle = '#23282c'; ctx.fillRect(x - 8, V.ty(2.3), 16, V.ty(0) - V.ty(2.3));
          ctx.fillStyle = 'rgba(198,255,61,.25)'; ctx.fillRect(x + (pr.side || 1) * 6, V.ty(2.3), 2, V.ty(0) - V.ty(2.3)); break;
        }
        case 'bar': {
          const y = V.ty(pr.y), xa = V.tx((pr.x || 0) - 0.42), xb = V.tx((pr.x || 0) + 0.42);
          ctx.strokeStyle = '#9aa3ab'; ctx.lineWidth = Math.max(3, V.s * 0.035); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
          ctx.strokeStyle = '#3b4248'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa, V.ty(pr.y + 0.3)); ctx.moveTo(xb, y); ctx.lineTo(xb, V.ty(pr.y + 0.3)); ctx.stroke();
          break;
        }
        case 'parallels': {
          const y = V.ty(pr.y), x = V.tx(pr.x || 0);
          ctx.strokeStyle = '#9aa3ab'; ctx.lineWidth = Math.max(3, V.s * 0.03); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x - 0.32 * V.s, y); ctx.lineTo(x + 0.32 * V.s, y); ctx.stroke();
          ctx.strokeStyle = '#3b4248'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 0.25 * V.s, y); ctx.lineTo(x - 0.25 * V.s, V.ty(0)); ctx.moveTo(x + 0.25 * V.s, y); ctx.lineTo(x + 0.25 * V.s, V.ty(0)); ctx.stroke();
          break;
        }
        case 'rope': {
          const x = V.tx(pr.x); ctx.strokeStyle = '#c9a66b'; ctx.lineWidth = Math.max(3, V.s * 0.03);
          ctx.beginPath(); ctx.moveTo(x, V.ty(3.2)); ctx.lineTo(x, V.ty(0.05)); ctx.stroke(); break;
        }
        case 'ball': { const p = P(at || pr.pos); soccerBall(ctx, p[0] + (pr.dx || 0) * V.s, p[1] - (pr.dy != null ? pr.dy : 0.11) * V.s, 0.11 * V.s); break; }
        case 'medball': { const p = P(at || pr.pos); ctx.fillStyle = '#7a3b2e'; ctx.beginPath(); ctx.arc(p[0], p[1] - (pr.dy || 0) * V.s, 0.12 * V.s, 0, 7); ctx.fill(); ctx.strokeStyle = '#2b1610'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1] - (pr.dy || 0) * V.s, 0.12 * V.s, 0.3, 2.8); ctx.stroke(); break; }
        case 'fitball': { const p = at || pr.pos; const c = P([p[0], p[1] - 0.05 - 0.33]); ctx.fillStyle = '#5a63d8'; ctx.beginPath(); ctx.arc(c[0], c[1], 0.33 * V.s, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(c[0] - 0.1 * V.s, c[1] - 0.1 * V.s, 0.12 * V.s, 0, 7); ctx.fill(); break; }
        case 'wheel': { const p = P(at); ctx.strokeStyle = '#222'; ctx.lineWidth = 0.06 * V.s; ctx.beginPath(); ctx.arc(p[0], p[1], 0.09 * V.s, 0, 7); ctx.stroke(); ctx.strokeStyle = '#c6ff3d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], 0.09 * V.s, 0, 7); ctx.stroke(); break; }
        case 'dumbbell': case 'kettle': { const p = P(at || pr.pos); ctx.fillStyle = '#2d3136'; ctx.fillRect(p[0] - 0.09 * V.s, p[1] - 0.025 * V.s, 0.18 * V.s, 0.05 * V.s); ctx.fillStyle = '#111'; ctx.fillRect(p[0] - 0.12 * V.s, p[1] - 0.06 * V.s, 0.05 * V.s, 0.12 * V.s); ctx.fillRect(p[0] + 0.07 * V.s, p[1] - 0.06 * V.s, 0.05 * V.s, 0.12 * V.s); break; }
        case 'sack': { const p = P(at || pr.pos); ctx.fillStyle = '#4b5320'; roundRect(ctx, p[0] - 0.2 * V.s, p[1] - 0.1 * V.s + (pr.dy || 0) * V.s, 0.4 * V.s, 0.2 * V.s, 0.08 * V.s); ctx.fill(); ctx.strokeStyle = '#2a2f10'; ctx.lineWidth = 2; ctx.stroke(); break; }
        case 'pack': {
          const n = J.neck, h = J.hip; const td = dir(J.t), back = dir(J.t + 90);
          const c = [(n[0] + h[0]) / 2 + back[0] * 0.17 + td[0] * 0.05, (n[1] + h[1]) / 2 + back[1] * 0.17 + td[1] * 0.05];
          const p = P(c); ctx.translate(p[0], p[1]); ctx.rotate(-(J.t - 180) * D2R);
          ctx.fillStyle = '#4b5320'; roundRect(ctx, -0.08 * V.s, -0.2 * V.s, 0.16 * V.s, 0.38 * V.s, 0.05 * V.s); ctx.fill();
          ctx.strokeStyle = '#2a2f10'; ctx.lineWidth = 2; ctx.stroke(); break;
        }
        case 'band': {
          const a = P(jointByName(J, pr.a) || pr.a), b = P(pr.b && typeof pr.b === 'string' ? jointByName(J, pr.b) : pr.b);
          ctx.strokeStyle = pr.color || '#ff5a3c'; ctx.lineWidth = Math.max(2, V.s * 0.018); ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          if (pr.b && typeof pr.b !== 'string') { ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(b[0], b[1], 5, 0, 7); ctx.fill(); }
          break;
        }
        case 'stick': {
          const a = P(jointByName(J, pr.a)), b = P(pr.b); ctx.strokeStyle = '#9aa3ab'; ctx.lineWidth = Math.max(3, V.s * 0.03);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); break;
        }
        case 'anchor': { const p = P(at); ctx.fillStyle = '#3b4248'; roundRect(ctx, p[0] - 0.12 * V.s, p[1] - 0.04 * V.s, 0.24 * V.s, 0.12 * V.s, 6); ctx.fill(); break; }
      }
      ctx.restore();
    }
  }

  function drawFigure(ctx, V, J, look) {
    const lk = Object.assign({ build: 0, hair: PAL.hair, number: '10' }, look || {});
    const s = V.s, P = p => [V.tx(p[0]), V.ty(p[1])];
    const dk = (c, f) => shade(c, f);
    const skin = PAL.skin, skinF = J.front ? PAL.skin : PAL.skinD;
    const limb = (seg, r1, r2, col) => capsule(ctx, P(seg[0]), P(seg[1]), r1[0] * s, r1[1] * s, col) ;
    const drawLeg = (l, f, far) => {
      const c = far && !J.front ? PAL.skinD : PAL.skin;
      capsule(ctx, P(l[1]), P(l[2]), R.sh[0] * s, R.sh[1] * s, c);
      capsule(ctx, P(l[0]), P(l[1]), R.th[0] * s, R.th[1] * s, c);
      // rodilla
      ctx.fillStyle = c; ctx.beginPath(); const kp = P(l[1]); ctx.arc(kp[0], kp[1], R.th[1] * s, 0, 7); ctx.fill();
      // calcetín + zapatilla
      const sock = [l[1][0] + (l[2][0] - l[1][0]) * 0.8, l[1][1] + (l[2][1] - l[1][1]) * 0.8];
      capsule(ctx, P(sock), P(l[2]), R.sh[1] * s * 1.02, R.sh[1] * s, far && !J.front ? '#c9c9c2' : '#ffffff');
      capsule(ctx, P(l[2]), P(f), 0.05 * s, 0.036 * s, far && !J.front ? PAL.shoeD : PAL.shoe);
      const ft = P(f), an = P(l[2]);
      ctx.strokeStyle = PAL.sole; ctx.lineWidth = Math.max(2, 0.018 * s); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(an[0], an[1]); ctx.lineTo(ft[0], ft[1]); ctx.stroke();
      // short
      const sh = [l[0][0] + (l[1][0] - l[0][0]) * 0.45, l[0][1] + (l[1][1] - l[0][1]) * 0.45];
      capsule(ctx, P(l[0]), P(sh), (R.th[0] + 0.03) * s, (R.th[0] + 0.015) * s, far && !J.front ? PAL.shortsD : PAL.shorts);
      const trimP = P(sh); ctx.fillStyle = PAL.trim; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(trimP[0], trimP[1], 0.022 * s, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    };
    const drawArm = (a, far) => {
      const c = far && !J.front ? PAL.skinD : PAL.skin;
      capsule(ctx, P(a[1]), P(a[2]), R.fa[0] * s, R.fa[1] * s, c);
      capsule(ctx, P(a[0]), P(a[1]), R.ua[0] * s, R.ua[1] * s, c);
      const hp = P(a[2]); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hp[0], hp[1], 0.04 * s, 0, 7); ctx.fill();
      const slv = [a[0][0] + (a[1][0] - a[0][0]) * 0.35, a[0][1] + (a[1][1] - a[0][1]) * 0.35];
      capsule(ctx, P(a[0]), P(slv), (R.ua[0] + 0.022) * s, (R.ua[0] + 0.012) * s, far && !J.front ? PAL.jerseyD : PAL.jersey);
    };
    const drawHead = () => {
      const hc = P(J.head), nk = P(J.neck);
      capsule(ctx, nk, hc, R.neck * s, R.neck * s, PAL.skin);
      const hr = L.headR * s;
      ctx.fillStyle = PAL.skin; ctx.beginPath(); ctx.arc(hc[0], hc[1], hr, 0, 7); ctx.fill();
      const up = dir(J.h);
      if (J.front) {
        ctx.fillStyle = lk.hair; ctx.beginPath(); ctx.arc(hc[0], hc[1], hr * 1.04, Math.PI * 1.05 - (J.h - 180) * D2R, Math.PI * 1.95 - (J.h - 180) * D2R); ctx.fill();
        const side = dir(J.h - 90);
        ctx.fillStyle = '#1a120c';
        [1, -1].forEach(k => { const e = [J.head[0] + side[0] * 0.035 * k - up[0] * 0.005, J.head[1] + side[1] * 0.035 * k - up[1] * 0.005]; const ep = P(e); ctx.beginPath(); ctx.arc(ep[0], ep[1], 0.011 * s, 0, 7); ctx.fill(); });
      } else {
        const fwd = dir(J.h - 90);
        const hcW = [J.head[0] - fwd[0] * 0.018 + up[0] * 0.018, J.head[1] - fwd[1] * 0.018 + up[1] * 0.018];
        const hp = P(hcW);
        ctx.save(); ctx.beginPath(); ctx.arc(hc[0], hc[1], hr * 1.03, 0, 7); ctx.clip();
        ctx.fillStyle = lk.hair; ctx.beginPath(); ctx.arc(hp[0], hp[1], hr * 0.98, 0, 7); ctx.fill();
        const face = P([J.head[0] + fwd[0] * 0.03 - up[0] * 0.03, J.head[1] + fwd[1] * 0.03 - up[1] * 0.03]);
        ctx.fillStyle = PAL.skin; ctx.beginPath(); ctx.arc(face[0], face[1], hr * 0.9, 0, 7); ctx.fill();
        ctx.restore();
        const nose = [J.head[0] + fwd[0] * L.headR, J.head[1] + fwd[1] * L.headR];
        const n1 = P(nose), n2 = P([nose[0] + fwd[0] * 0.022 - up[0] * 0.03, nose[1] + fwd[1] * 0.022 - up[1] * 0.03]), n3 = P([nose[0] - up[0] * 0.045, nose[1] - up[1] * 0.045]);
        ctx.fillStyle = PAL.skin; ctx.beginPath(); ctx.moveTo(n1[0], n1[1]); ctx.lineTo(n2[0], n2[1]); ctx.lineTo(n3[0], n3[1]); ctx.fill();
        const eye = P([J.head[0] + fwd[0] * 0.06 + up[0] * 0.01, J.head[1] + fwd[1] * 0.06 + up[1] * 0.01]);
        ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.arc(eye[0], eye[1], 0.011 * s, 0, 7); ctx.fill();
        const ear = P([J.head[0] - fwd[0] * 0.01, J.head[1] - fwd[1] * 0.01]);
        ctx.fillStyle = PAL.skinD; ctx.beginPath(); ctx.arc(ear[0], ear[1], 0.022 * s, 0, 7); ctx.fill();
      }
    };
    const drawTorso = () => {
      const b = lk.build || 0;
      const hp = P(J.hip), sh = P(add(J.hip, dir(J.t), L.torso - 0.03));
      if (J.front) {
        const sd = dir(J.t - 90), td = dir(J.t);
        const wH = 0.15 + b * 0.045, wS = 0.21 + b * 0.015, wW = 0.15 + b * 0.075;
        const mid = add(J.hip, td, 0.2);
        const pts = [add(J.hip, sd, wH), add(mid, sd, wW), add(add(J.hip, td, L.torso - 0.06), sd, wS), add(add(J.hip, td, L.torso - 0.06), sd, -wS), add(mid, sd, -wW), add(J.hip, sd, -wH)].map(P);
        ctx.fillStyle = PAL.jersey; ctx.strokeStyle = PAL.jersey; ctx.lineJoin = 'round'; ctx.lineWidth = 0.08 * s;
        ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
        // cuello en V y número
        const nb = P(add(J.hip, td, L.torso - 0.02));
        ctx.fillStyle = PAL.skin; ctx.beginPath(); ctx.moveTo(nb[0] - 0.05 * s, nb[1] - 0.01 * s); ctx.lineTo(nb[0] + 0.05 * s, nb[1] - 0.01 * s); ctx.lineTo(nb[0], nb[1] + 0.07 * s); ctx.fill();
        ctx.fillStyle = PAL.num; ctx.font = `800 ${Math.round(0.15 * s)}px "Bebas Neue", Impact, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const np = P(add(J.hip, td, 0.26)); ctx.save(); ctx.translate(np[0], np[1]); ctx.rotate(-(J.t - 180) * D2R); ctx.fillText(lk.number, 0, 0); ctx.restore();
        // short
        ctx.fillStyle = PAL.shorts; const sp = [add(J.hip, sd, wH + 0.01), add(J.hip, sd, -wH - 0.01), add(add(J.hip, td, -0.1), sd, -wH - 0.02), add(add(J.hip, td, -0.1), sd, wH + 0.02)].map(P);
        ctx.beginPath(); sp.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill();
        ctx.fillStyle = PAL.trim; const wb = [add(J.hip, sd, wH + 0.01), add(J.hip, sd, -wH - 0.01)].map(P); ctx.fillRect(Math.min(wb[0][0], wb[1][0]), Math.min(wb[0][1], wb[1][1]) - 2, Math.abs(wb[0][0] - wb[1][0]), 3);
      } else {
        capsule(ctx, hp, sh, (R.hip + b * 0.02) * s, R.chest * s, PAL.jersey);
        if (b > 0) {
          const front = dir(J.t - 90); const bc = P(add(add(J.hip, dir(J.t), 0.17), front, 0.02 + b * 0.03));
          ctx.fillStyle = PAL.jersey; ctx.beginPath(); ctx.arc(bc[0], bc[1], (0.1 + b * 0.04) * s, 0, 7); ctx.fill();
        }
        // franja
        const back = dir(J.t + 90); const a = P(add(add(J.hip, dir(J.t), 0.08), back, R.hip * 0.6)), c = P(add(add(J.hip, dir(J.t), 0.4), back, R.chest * 0.6));
        ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.025 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
        ctx.fillStyle = PAL.shorts; ctx.beginPath(); ctx.arc(hp[0], hp[1], (R.hip + 0.025 + b * 0.02) * s, 0, 7); ctx.fill();
      }
    };

    // sombra
    if (!J.noShadow) {
      const sx = V.tx(J.hip[0]), sy = V.ty(0);
      const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, 0.6 * s);
      g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(sx, sy, 0.6 * s, 0.07 * s, 0, 0, 7); ctx.fill();
    }
    drawProps(ctx, V, J, 'back');
    if (J.front) {
      drawLeg(J.l2, J.f2, false); drawLeg(J.l1, J.f1, false);
      drawTorso(); drawArm(J.a2, false); drawArm(J.a1, false); drawHead();
    } else {
      drawArm(J.a2, true); drawLeg(J.l2, J.f2, true);
      drawTorso(); drawHead(); drawLeg(J.l1, J.f1, false); drawArm(J.a1, false);
    }
    drawProps(ctx, V, J, 'front');
  }

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  /* --------------- Reproductor en un canvas --------------- */
  class Stage {
    constructor(canvas, opts) {
      this.c = canvas; this.ctx = canvas.getContext('2d'); this.opts = opts || {};
      this.motion = null; this.phase = 0; this.look = this.opts.look || {};
      this._resize(); this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(canvas);
    }
    _resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = this.c.clientWidth || 300, h = this.c.clientHeight || 300;
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      this.W = w; this.H = h; this.dpr = dpr; this.view = null; this.draw();
    }
    set(motion) { this.motion = prepare(motion); this.view = null; this.draw(); }
    draw(phase) {
      if (phase != null) this.phase = phase;
      const ctx = this.ctx; if (!ctx) return;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.W, this.H);
      if (!this.motion) return;
      if (!this.view) this.view = makeView(this.W, this.H, bounds(this.motion), this.opts);
      drawStage(ctx, this.W, this.H, this.view, this.motion, this.opts.theme);
      const J = frame(this.motion, ((this.phase % 1) + 1) % 1);
      drawFigure(ctx, this.view, J, this.look);
    }
    destroy() { this._ro && this._ro.disconnect(); }
  }

  G.Figure = { L, dir, ik, frame, prepare, bounds, makeView, drawStage, drawFigure, Stage, PAL };
})(window);
