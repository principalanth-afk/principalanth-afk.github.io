/* ASCENSO — Biblioteca de movimientos (poses clave por ejercicio)
   Ángulos absolutos: 0 = abajo, 90 = adelante, 180 = arriba, -90 = atrás.
   {to:[x,y], b} = cinemática inversa hacia un punto; {r:[u,l]} = relativo al torso. */
(function (G) {
  'use strict';
  const F = 0.06, H = 0.035, BAR = 2.3;
  const C = o => JSON.parse(JSON.stringify(o));
  const ov = (base, o) => Object.assign(C(base), o || {});
  const D = G.Figure.dir;
  const fromKnee = (knee, thigh) => { const d = D(thigh); return [knee[0] - d[0] * 0.44, knee[1] - d[1] * 0.44]; };

  // ---------- Poses base ----------
  const ST = { hip: [0, 0.92], t: 180, A1: [-3, -6], L1: { to: [0.03, F] }, L2: { to: [-0.03, F] } };
  const STF = { view: 'front', hip: [0, 0.92], t: 180, A1: [8, 4], L1: { to: [0.11, F], b: 1 } };
  const HANDS_HIPS = { to: [0.04, 0.95], b: -1 };
  const BEHIND_HEAD = { r: [158, -102] };
  const CROSS_CHEST = { r: [29, -156] };
  const SQ = d => ({ hip: [-0.17 * d, 0.92 - 0.44 * d], t: 180 - 42 * d, A1: [8 + 82 * d, 10 + 80 * d], L1: { to: [0.04, F] }, L2: { to: [0.01, F] } });
  const PH = { hip: [0, 0.47], t: 112, A1: { to: [0.44, H] }, L1: { to: [-0.78, F] }, L2: { to: [-0.78, F] } };
  const PF = { hip: [0, 0.3], t: 98, A1: [2, 92], L1: { to: [-0.82, F] }, L2: { to: [-0.82, F] } };
  const PL = { hip: [0.05, 0.2], t: 96, A1: { to: [0.44, H] }, L1: { to: [-0.78, F] }, L2: { to: [-0.78, F] } };
  const SUP = { hip: [0, 0.12], t: -90, A1: [92, 92], L1: [90, 90], L2: [90, 90] };
  const SUPK = ov(SUP, { L1: { to: [0.4, F] }, L2: { to: [0.37, F] } });
  const PRN = { hip: [0, 0.12], t: 90, A1: [88, 90], L1: [-90, -90], L2: [-90, -90] };
  const QD = { hip: [0, 0.5], t: 104, A1: { to: [0.45, H] }, L1: [0, -90], L2: [2, -88] };
  const HANG = { hip: [0, 1.27], t: 180, A1: { to: [0.04, BAR], b: -1 }, A2: { to: [0.0, BAR], b: -1 }, L1: [10, -14], L2: [14, -10] };
  const PULL = ov(HANG, { hip: [0, 1.66], L1: [30, -26], L2: [34, -22] });
  const barP = [{ type: 'bar', y: BAR, x: 0.02 }];
  const SPF = { view: 'front', hip: [0, 0.34], t: 106, A1: [0, 92], A2: [168, 172], L1: [-74, -74], L2: [-70, -70] }; // plancha lateral (frontal)
  const SPH = ov(SPF, { hip: [0, 0.5], t: 118, A1: [0, 0] });

  // Deep-ish merge for poses with alternation
  const alt = (a, b) => [a, b];
  const M = {};
  const def = (name, o) => { M[name] = o; return o; };
  const alias = (name, src, extra) => { M[name] = Object.assign({}, M[src], { _k: undefined, _b: undefined }, extra || {}); if (M[name].k) M[name].k = C(M[src].k); };

  // ================= PLANCHAS =================
  def('plank', { k: [PF, ov(PF, { hip: [0, 0.31] })], b: 4, hold: 1, fam: 'plank', cam: 'plank' });
  def('plank_high', { k: [PH, ov(PH, { hip: [0, 0.48] })], b: 4, hold: 1, fam: 'plank', cam: 'plank' });
  def('plank_rkc', { k: [ov(PF, { hip: [0, 0.31], t: 99 }), ov(PF, { hip: [0, 0.305], t: 98 })], b: 1, hold: 1, fam: 'plank', cam: 'plank' });
  def('plank_leg', { k: [PF, ov(PF, { L1: [-102, -100] }), PF, ov(PF, { L2: [-102, -100] })], b: 4, rpc: 2, fam: 'plank', cam: 'plank' });
  def('plank_arm', { k: [PH, ov(PH, { A1: [96, 96] }), PH, ov(PH, { A2: [96, 96] })], b: 4, rpc: 2, fam: 'plank', cam: 'plank' });
  def('plank_cross', { k: [PH, ov(PH, { A1: [98, 98], L2: [-108, -106] }), PH, ov(PH, { A2: [98, 98], L1: [-108, -106] })], b: 6, rpc: 2, fam: 'plank', cam: 'plank' });
  def('shoulder_tap', { k: [PH, ov(PH, { A1: { to: [0.36, 0.56], b: -1 } }), PH, ov(PH, { A2: { to: [0.33, 0.56], b: -1 } })], b: 3, rpc: 2, fam: 'plank', cam: 'plank' });
  def('plank_updown', { k: [PF, ov(PF, { hip: [0, 0.38], t: 104, A1: { to: [0.46, H] } }), PH, ov(PF, { hip: [0, 0.38], t: 104, A2: { to: [0.43, H] } })], b: 6, fam: 'plank', cam: 'plank' });
  def('plank_feet_up', { k: [{ hip: [0, 0.64], t: 92, A1: { to: [0.45, H] }, L1: { to: [-0.84, 0.52] }, L2: { to: [-0.84, 0.52] } }, { hip: [0, 0.65], t: 92, A1: { to: [0.45, H] }, L1: { to: [-0.84, 0.52] }, L2: { to: [-0.84, 0.52] } }], b: 4, hold: 1, props: [{ type: 'bench', at: 'ank1', w: 0.4 }], fam: 'plank', cam: 'plank' });
  def('body_saw', { k: [ov(PF, { A1: { to: [0.76, H], b: -1 } }), ov(PF, { hip: [-0.16, 0.3], t: 100, A1: { to: [0.76, H], b: -1 }, L1: { to: [-0.98, F] }, L2: { to: [-0.98, F] } })], b: 4, fam: 'plank', cam: 'plank' });
  {
    const kn = [0, 0.05];
    const r0 = { hip: fromKnee(kn, 0 + 180 - 180 + 8), t: 150, A1: { to: [0.38, 0.1], b: -1 }, L1: [8, -90], L2: [10, -88] };
    r0.hip = fromKnee(kn, 8);
    const r1 = { hip: fromKnee(kn, 55), t: 100, A1: { to: [1.0, 0.1], b: -1 }, L1: [55, -90], L2: [57, -88] };
    def('rollout', { k: [r0, r1], b: 6, props: [{ type: 'wheel', at: 'hand1' }], fam: 'plank', cam: 'plank' });
    const rb0 = ov(r0, { t: 140, A1: [70, 95] }), rb1 = ov(r1, { t: 108, A1: [80, 95] });
    def('rollout_ball', { k: [rb0, rb1], b: 6, props: [{ type: 'fitball', at: 'elb1', layer: 'back' }], fam: 'plank', cam: 'plank' });
  }
  def('stir_pot', { k: [{ hip: [0, 0.62], t: 118, A1: [20, 95], L1: { to: [-0.72, F] }, L2: { to: [-0.72, F] } }, { hip: [0.06, 0.64], t: 116, A1: [10, 100], L1: { to: [-0.72, F] }, L2: { to: [-0.72, F] } }, { hip: [0, 0.66], t: 118, A1: [24, 90], L1: { to: [-0.72, F] }, L2: { to: [-0.72, F] } }], b: 4, props: [{ type: 'fitball', at: 'elb1', layer: 'back' }], fam: 'plank', cam: 'plank' });

  // ================= DEAD BUG / HOLLOW / BIRD DOG =================
  const DB = ov(SUP, { A1: [180, 180], A2: [176, 178], L1: [180, 90], L2: [178, 88] });
  def('dead_bug', { k: [DB, ov(DB, { A1: [-100, -96], L2: [96, 96] }), DB, ov(DB, { A2: [-100, -96], L1: [96, 96] })], b: 4, rpc: 2, fam: 'supine', cam: 'generic' });
  def('dead_bug_ball', { k: [ov(DB, { A1: { to: [0.22, 0.62], b: -1 }, A2: { to: [0.2, 0.62], b: -1 } }), ov(DB, { A1: { to: [0.22, 0.62], b: -1 }, L2: [96, 96] }), ov(DB, { A1: { to: [0.22, 0.62], b: -1 }, A2: { to: [0.2, 0.62], b: -1 } }), ov(DB, { A2: { to: [0.2, 0.62], b: -1 }, L1: [96, 96] })], b: 4, rpc: 2, props: [{ type: 'medball', at: 'hand1', dy: -0.02 }], fam: 'supine', cam: 'generic' });
  const HH = { hip: [0, 0.12], t: -104, h: -112, A1: [-112, -110], L1: [104, 104], L2: [102, 102] };
  def('hollow_hold', { k: [HH, ov(HH, { L1: [107, 107], L2: [105, 105] })], b: 4, hold: 1, fam: 'supine', cam: 'generic' });
  def('hollow_rock', { k: [ov(HH, { t: -112, L1: [98, 98], L2: [96, 96] }), ov(HH, { t: -96, L1: [114, 114], L2: [112, 112], A1: [-104, -102] })], b: 2, fam: 'supine', cam: 'generic' });
  def('hollow_volley', { k: [ov(HH, { A1: [-150, -150] }), ov(HH, { t: -120, A1: [150, 150], A2: [146, 146] })], b: 4, props: [{ type: 'ball', at: 'hand1', dy: 0.02 }], fam: 'supine', cam: 'generic' });
  def('dying_cockroach', { k: [ov(SUP, { A1: [176, 172], L1: [168, 130], L2: [172, 136] }), ov(SUP, { A1: [178, 176], L1: [170, 134], L2: [170, 132] })], b: 1, hold: 1, fam: 'supine', cam: 'generic' });
  def('bird_dog', { k: [QD, ov(QD, { A1: [100, 98], L2: [-94, -94] }), QD, ov(QD, { A2: [100, 98], L1: [-94, -94] })], b: 6, rpc: 2, fam: 'quad', cam: 'generic' });
  def('bird_dog_crunch', { k: [ov(QD, { A1: [100, 98], L2: [-94, -94] }), ov(QD, { t: 96, A1: [-20, 100], L2: [40, -60] })], b: 4, fam: 'quad', cam: 'generic' });
  def('fire_hydrant', { k: [QD, ov(QD, { L1: [-70, -150] })], b: 3, fam: 'quad', cam: 'generic' });
  def('bear_hold_reach', { k: [ov(QD, { hip: [0, 0.56], L1: [8, -70], L2: [10, -68] }), ov(QD, { hip: [0, 0.56], L1: [8, -70], L2: [10, -68], A1: [96, 96] })], b: 4, fam: 'quad', cam: 'generic' });

  // ================= ANTI-ROTACIÓN (de pie) =================
  const ATH = ov(ST, { hip: [-0.04, 0.86], t: 176, L1: { to: [0.08, F] }, L2: { to: [-0.12, F] } });
  const bandAnchor = [{ type: 'band', a: 'hand1', b: [-0.9, 1.25] }];
  def('pallof', { k: [ov(ATH, { A1: { to: [0.18, 1.22], b: -1 } }), ov(ATH, { A1: [92, 92] })], b: 4, props: bandAnchor, fam: 'stand', cam: 'generic' });
  def('pallof_hold', { k: [ov(ATH, { A1: [92, 92] }), ov(ATH, { A1: [93, 93], hip: [-0.04, 0.855] })], b: 4, hold: 1, props: bandAnchor, fam: 'stand', cam: 'generic' });
  {
    const kn = [0.0, 0.05];
    const HK = { hip: fromKnee(kn, 0), t: 180, L1: { to: [0.44, F] }, L2: [0, -90], A1: { to: [0.18, 0.92], b: -1 } };
    def('pallof_kneel', { k: [HK, ov(HK, { A1: [92, 92] })], b: 4, props: [{ type: 'band', a: 'hand1', b: [-0.9, 0.9] }], fam: 'stand', cam: 'generic' });
    def('rot_throw_kneel', { k: [ov(HK, { A1: { to: [-0.3, 0.6], b: -1 }, A2: { to: [-0.32, 0.6], b: -1 }, t: 176 }), ov(HK, { A1: [96, 96], A2: [100, 98], t: 182 })], b: 4, props: [{ type: 'medball', at: 'hand1' }, { type: 'wall', x: 1.25 }], fam: 'stand', cam: 'generic' });
  }
  alias('pallof_step', 'pallof');
  def('pull_through', { k: [PH, ov(PH, { A1: { to: [0.12, 0.05], b: -1 } }), PH, ov(PH, { A2: { to: [0.1, 0.05], b: -1 } })], b: 4, rpc: 2, props: [{ type: 'dumbbell', pos: [0.18, 0.06], layer: 'back' }], fam: 'plank', cam: 'plank' });
  def('renegade_row', { k: [ov(PH, { L1: { to: [-0.8, F] }, L2: { to: [-0.74, F] } }), ov(PH, { A1: { to: [0.18, 0.5], b: -1 } }), ov(PH, {}), ov(PH, { A2: { to: [0.15, 0.5], b: -1 } })], b: 4, rpc: 2, props: [{ type: 'dumbbell', at: 'hand1' }], fam: 'plank', cam: 'plank' });
  def('plank_ball_pass', { k: [PH, ov(PH, { A1: { to: [0.3, 0.12], b: -1 } }), PH, ov(PH, { A2: { to: [0.28, 0.12], b: -1 } })], b: 3, rpc: 2, props: [{ type: 'ball', at: 'hand1', dy: 0.02 }], fam: 'plank', cam: 'plank' });
  def('side_plank_row', { view: 'front', k: [ov(SPH, { A2: [100, 100] }), ov(SPH, { A2: [170, 40] })], b: 4, props: [{ type: 'band', a: 'hand2', b: [1.3, 0.9] }], fam: 'side', cam: 'generic' });

  // ================= ROTACIÓN =================
  {
    const RS = { view: 'front', hip: [0, 0.14], t: 180, L1: [150, 30], L2: [-150, -30] };
    def('russian_twist', { view: 'front', k: [ov(RS, { t: 170, A1: { to: [0.4, 0.42], b: 1 }, A2: { to: [0.32, 0.42], b: 1 } }), ov(RS, { t: 190, A1: { to: [-0.32, 0.42], b: -1 }, A2: { to: [-0.4, 0.42], b: -1 } })], b: 2, rpc: 2, props: [{ type: 'ball', at: 'hands', dy: 0.05 }], fam: 'seated', cam: 'generic' });
  }
  alias('ball_rotation', 'russian_twist');
  {
    const W = { view: 'front', hip: [0, 0.88], t: 180, L1: { to: [0.24, F], b: 1 } };
    const hi = ov(W, { t: 172, A1: { to: [0.52, 1.85], b: 1 }, A2: { to: [0.5, 1.85], b: 1 } });
    const lo = ov(W, { hip: [0, 0.68], t: 190, A1: { to: [-0.42, 0.55], b: -1 }, A2: { to: [-0.44, 0.55], b: -1 } });
    def('woodchop_hl', { view: 'front', k: [hi, lo], b: 4, props: [{ type: 'band', a: 'hands', b: [1.2, 2.1] }], fam: 'stand', cam: 'generic' });
    def('woodchop_lh', { view: 'front', k: [lo, hi], b: 4, props: [{ type: 'band', a: 'hands', b: [-1.2, 0.1] }], fam: 'stand', cam: 'generic' });
    def('band_rotation', { view: 'front', k: [ov(W, { t: 176, A1: { to: [0.62, 1.28], b: 1 }, A2: { to: [0.55, 1.26], b: 1 } }), ov(W, { t: 184, A1: { to: [-0.55, 1.26], b: -1 }, A2: { to: [-0.62, 1.28], b: -1 } })], b: 4, rpc: 2, props: [{ type: 'band', a: 'hands', b: [0, 1.3] }], fam: 'stand', cam: 'generic' });
    def('landmine', { view: 'front', k: [ov(W, { hip: [0, 0.8], t: 174, A1: { to: [0.5, 1.45], b: 1 }, A2: { to: [0.46, 1.45], b: 1 } }), ov(W, { t: 180, A1: { to: [0.03, 1.95], b: 1 }, A2: { to: [-0.03, 1.95], b: -1 } }), ov(W, { hip: [0, 0.8], t: 186, A1: { to: [-0.46, 1.45], b: -1 }, A2: { to: [-0.5, 1.45], b: -1 } }), ov(W, { t: 180, A1: { to: [0.03, 1.95], b: 1 }, A2: { to: [-0.03, 1.95], b: -1 } })], b: 6, rpc: 2, props: [{ type: 'stick', a: 'hands', b: [0, 0.05] }], fam: 'stand', cam: 'generic' });
    def('side_bend', { view: 'front', k: [ov(W, { t: 166, A1: [4, 2], A2: [-10, -6] }), ov(W, { t: 194, A1: [10, 6], A2: [-4, -2] })], b: 4, rpc: 2, props: [{ type: 'dumbbell', at: 'hand1' }], fam: 'stand', cam: 'generic' });
    def('band_adduction', { view: 'front', k: [ov(W, { L1: { to: [0.48, 0.14], b: 1 }, L2: { to: [-0.1, F], b: -1 }, A1: HANDS_HIPS }), ov(W, { L1: { to: [0.02, 0.1], b: 1 }, L2: { to: [-0.1, F], b: -1 } })], b: 3, props: [{ type: 'band', a: 'ank1', b: [1.1, 0.12] }], fam: 'stand', cam: 'generic' });
  }
  def('rot_throw', { k: [ov(ATH, { t: 172, A1: { to: [-0.32, 1.0], b: -1 }, A2: { to: [-0.35, 1.0], b: -1 } }), ov(ATH, { t: 184, A1: [96, 96], A2: [100, 98] })], b: 4, props: [{ type: 'medball', at: 'hand1' }, { type: 'wall', x: 1.3 }], fam: 'stand', cam: 'generic' });
  def('slam', { k: [ov(ST, { A1: [178, 178], A2: [176, 178], L1: { to: [0.06, 0.13] }, L2: { to: [0.02, 0.13] }, F1: 30, F2: 30 }), ov(SQ(0.75), { t: 120, A1: { to: [0.38, 0.22], b: -1 }, A2: { to: [0.35, 0.22], b: -1 } })], b: 4, props: [{ type: 'medball', at: 'hand1' }], fam: 'stand', cam: 'squat' });
  {
    // vista cenital (tumbado boca arriba visto desde arriba)
    const OV = { view: 'front', hip: [0, 1.0], t: 180, h: 180, A1: [92, 92], L1: [4, 4], L2: [-4, -4] };
    def('windshield', { view: 'front', overhead: true, k: [ov(OV, { L1: [52, 52], L2: [44, 44] }), ov(OV, { L1: [-44, -44], L2: [-52, -52] })], b: 4, rpc: 2, fam: 'supine', cam: 'generic' });
    def('leg_twist', { view: 'front', overhead: true, k: [ov(OV, { L1: [70, 10], L2: [62, 4] }), ov(OV, { L1: [-62, -4], L2: [-70, -10] })], b: 4, rpc: 2, fam: 'supine', cam: 'generic' });
  }

  // ================= ABDOMINALES (flexión) =================
  def('crunch', { k: [ov(SUPK, { A1: BEHIND_HEAD }), ov(SUPK, { t: -122, h: -132, A1: BEHIND_HEAD })], b: 3, fam: 'supine', cam: 'situp' });
  alias('oblique_crunch', 'crunch');
  def('heel_taps', { k: [ov(SUPK, { t: -112, A1: [84, 84], A2: [96, 96] }), ov(SUPK, { t: -112, A1: [96, 96], A2: [84, 84] })], b: 2, rpc: 2, fam: 'supine', cam: 'generic' });
  def('reverse_crunch', { k: [ov(SUP, { L1: [180, 92], L2: [178, 90] }), ov(SUP, { L1: [-138, 118], L2: [-140, 116] })], b: 3, fam: 'supine', cam: 'generic' });
  def('bicycle', { k: [ov(SUP, { t: -122, h: -130, A1: BEHIND_HEAD, L1: [140, 72], L2: [104, 104] }), ov(SUP, { t: -122, h: -130, A1: BEHIND_HEAD, L1: [104, 104], L2: [140, 72] })], b: 2, rpc: 2, fam: 'supine', cam: 'generic' });
  def('v_up', { k: [ov(SUP, { A1: [-92, -92] }), ov(SUP, { t: -138, h: -144, A1: [124, 124], A2: [122, 122], L1: [130, 130], L2: [128, 128] })], b: 3, fam: 'supine', cam: 'situp' });
  def('tuck_up', { k: [{ hip: [0, 0.12], t: -142, A1: [70, 80], L1: [104, 104], L2: [102, 102] }, { hip: [0, 0.12], t: -166, A1: { to: [0.32, 0.5], b: -1 }, L1: [140, 50], L2: [138, 48] }], b: 3, fam: 'seated', cam: 'generic' });
  alias('tuck_twist', 'tuck_up');
  def('leg_raise', { k: [ov(SUP, { L1: [98, 98], L2: [96, 96] }), ov(SUP, { L1: [178, 178], L2: [176, 176] })], b: 4, fam: 'supine', cam: 'generic' });
  def('leg_raise_pause', { k: [ov(SUP, { L1: [100, 100], L2: [98, 98] }), ov(SUP, { L1: [100, 100], L2: [98, 98] }), ov(SUP, { L1: [178, 178], L2: [176, 176] })], times: [0, 0.35, 0.65], b: 6, fam: 'supine', cam: 'generic' });
  alias('leg_lever', 'leg_raise');
  def('leg_hold', { k: [ov(SUP, { t: -98, L1: [102, 102], L2: [100, 100] }), ov(SUP, { t: -98, L1: [103.5, 103.5], L2: [101.5, 101.5] })], b: 1, hold: 1, fam: 'supine', cam: 'generic' });
  def('flutter', { k: [ov(SUP, { t: -100, L1: [112, 112], L2: [98, 98] }), ov(SUP, { t: -100, L1: [98, 98], L2: [112, 112] })], b: 1, rpc: 2, fam: 'supine', cam: 'generic' });
  def('scissor', { k: [ov(SUP, { t: -100, L1: [120, 120], L2: [102, 102] }), ov(SUP, { t: -100, L1: [102, 102], L2: [120, 120] })], b: 1, rpc: 2, fam: 'supine', cam: 'generic' });
  alias('hello_dolly', 'scissor');
  def('situp', { k: [ov(SUPK, { A1: CROSS_CHEST }), ov(SUPK, { t: -172, h: -176, A1: CROSS_CHEST })], b: 4, props: [{ type: 'anchor', at: 'ank1', layer: 'front' }], fam: 'supine', cam: 'situp' });
  def('situp_twist', { k: [ov(SUPK, { A1: BEHIND_HEAD }), ov(SUPK, { t: -168, h: -170, A1: { r: [120, -60] }, A2: { r: [150, -110] } })], b: 4, fam: 'supine', cam: 'situp' });
  def('situp_throw', { k: [ov(SUPK, { A1: { r: [176, 176] }, A2: { r: [172, 174] } }), ov(SUPK, { t: -165, A1: { r: [96, 104] }, A2: { r: [92, 100] } })], b: 4, props: [{ type: 'ball', at: 'hands', dy: 0.06 }], fam: 'supine', cam: 'situp' });
  def('rower', { k: [ov(SUP, { A1: [-92, -92] }), ov(SUP, { t: -150, A1: [92, 92], A2: [90, 90], L1: { to: [0.36, F] }, L2: { to: [0.33, F] } })], b: 4, fam: 'supine', cam: 'situp' });

  // ================= COLGADO =================
  def('hang_leg_raise', { k: [HANG, ov(HANG, { hip: [0.02, 1.27], L1: [96, 96], L2: [94, 94] })], b: 4, g: false, props: barP, fam: 'hang', cam: 'generic' });
  def('toes_to_bar', { k: [HANG, ov(HANG, { hip: [0.12, 1.3], t: 196, L1: [172, 172], L2: [170, 170] })], b: 4, g: false, props: barP, fam: 'hang', cam: 'generic' });
  def('hang_knee_raise', { k: [HANG, ov(HANG, { L1: [112, -6], L2: [110, -8] })], b: 3, g: false, props: barP, fam: 'hang', cam: 'generic' });
  alias('hang_oblique', 'hang_knee_raise');
  alias('hang_leg_tuck', 'hang_knee_raise');
  {
    const DS = { hip: [0, 1.16], t: 180, A1: { to: [0.02, 1.0], b: -1 }, L1: [12, -40], L2: [16, -36] };
    def('dip_knee_raise', { k: [DS, ov(DS, { L1: [110, 0], L2: [108, -2] })], b: 3, g: false, props: [{ type: 'parallels', y: 1.0, x: 0.02 }], fam: 'hang', cam: 'generic' });
    def('dips', { k: [DS, ov(DS, { hip: [-0.05, 0.9], t: 164 })], b: 4, g: false, props: [{ type: 'parallels', y: 1.0, x: 0.02 }], fam: 'push', cam: 'generic' });
  }
  def('jackknife', { k: [{ hip: [0, 0.66], t: 92, A1: { to: [0.45, H] }, L1: { to: [-0.84, 0.74] }, L2: { to: [-0.84, 0.74] } }, { hip: [-0.02, 0.86], t: 70, A1: { to: [0.45, H] }, L1: { to: [-0.32, 0.74] }, L2: { to: [-0.32, 0.74] } }], b: 4, props: [{ type: 'fitball', at: 'ank1', layer: 'back' }], fam: 'plank', cam: 'generic' });
  def('pike_ball', { k: [{ hip: [0, 0.66], t: 92, A1: { to: [0.45, H] }, L1: { to: [-0.84, 0.74] }, L2: { to: [-0.84, 0.74] } }, { hip: [0.12, 1.2], t: 24, A1: { to: [0.45, H] }, L1: { to: [-0.5, 0.74] }, L2: { to: [-0.5, 0.74] } }], b: 4, props: [{ type: 'fitball', at: 'ank1', layer: 'back' }], fam: 'plank', cam: 'generic' });

  // ================= PLANCHA LATERAL =================
  def('side_plank', { view: 'front', k: [SPF, ov(SPF, { hip: [0, 0.35] })], b: 4, hold: 1, fam: 'side', cam: 'generic' });
  def('side_plank_star', { view: 'front', k: [ov(SPF, { L2: [-30, -30] }), ov(SPF, { L2: [-28, -28], hip: [0, 0.35] })], b: 4, hold: 1, fam: 'side', cam: 'generic' });
  def('side_plank_dip', { view: 'front', k: [ov(SPF, { hip: [0, 0.38] }), ov(SPF, { hip: [0, 0.2], t: 96 })], b: 3, fam: 'side', cam: 'generic' });
  def('side_plank_thread', { view: 'front', k: [SPF, ov(SPF, { A2: [10, 30], t: 102 })], b: 4, fam: 'side', cam: 'generic' });
  def('side_plank_abd', { view: 'front', k: [SPF, ov(SPF, { L2: [-34, -34] })], b: 3, fam: 'side', cam: 'generic' });
  def('copenhagen_short', { view: 'front', k: [ov(SPF, { hip: [0, 0.42], L2: [-72, -150], L1: [-50, -20] }), ov(SPF, { hip: [0, 0.43], L2: [-72, -150], L1: [-52, -22] })], b: 4, hold: 1, props: [{ type: 'bench', at: 'knee2', w: 0.45 }], fam: 'side', cam: 'generic' });
  def('copenhagen_long', { view: 'front', k: [ov(SPF, { hip: [0, 0.46], L2: [-76, -76], L1: [-40, -30] }), ov(SPF, { hip: [0, 0.47], L2: [-76, -76], L1: [-70, -70] })], b: 4, props: [{ type: 'bench', at: 'ank2', w: 0.4 }], fam: 'side', cam: 'generic' });
  def('clamshell', { view: 'front', k: [{ view: 'front', hip: [0, 0.2], t: -90, h: -96, A1: [70, 100], A2: [-150, -20], L1: [84, 104], L2: [86, 106] }, { view: 'front', hip: [0, 0.2], t: -90, h: -96, A1: [70, 100], A2: [-150, -20], L1: [124, 120], L2: [86, 106] }], b: 3, props: [{ type: 'band', a: 'knee1', b: 'knee2' }], fam: 'side', cam: 'generic' });

  // ================= CADERA / GLÚTEO =================
  const BR = { hip: [0, 0.4], t: -55, h: -90, A1: [92, 92], L1: { to: [0.38, F] }, L2: { to: [0.35, F] } };
  def('glute_bridge', { k: [SUPK, BR], b: 3, fam: 'supine', cam: 'bridge' });
  def('glute_bridge_single', { k: [ov(SUPK, { L2: [104, 104] }), ov(BR, { L2: [124, 124] })], b: 3, fam: 'supine', cam: 'bridge' });
  def('hip_thrust', { g: false, k: [{ hip: [0, 0.18], t: -128, h: -150, A1: [60, 90], L1: { to: [0.42, F] }, L2: { to: [0.39, F] } }, { hip: [0.02, 0.5], t: -92, h: -110, A1: [80, 92], L1: { to: [0.42, F] }, L2: { to: [0.39, F] } }], b: 3, props: [{ type: 'bench', x: -0.55, w: 0.5, h: 0.42 }], fam: 'supine', cam: 'bridge' });
  def('bridge_ball', { k: [ov(SUP, { L1: { to: [0.66, 0.72] }, L2: { to: [0.63, 0.72] } }), ov(SUP, { hip: [0, 0.5], t: -60, h: -90, L1: { to: [0.7, 0.72] }, L2: { to: [0.67, 0.72] } })], b: 3, props: [{ type: 'fitball', pos: [0.72, 0.72], layer: 'back' }], fam: 'supine', cam: 'bridge' });
  def('ham_curl_ball', { k: [ov(SUP, { hip: [0, 0.44], t: -72, h: -90, L1: { to: [0.86, 0.72] }, L2: { to: [0.83, 0.72] } }), ov(SUP, { hip: [0, 0.56], t: -60, h: -90, L1: { to: [0.44, 0.72] }, L2: { to: [0.41, 0.72] } })], b: 4, props: [{ type: 'fitball', at: 'ank1', layer: 'back' }], fam: 'supine', cam: 'bridge' });
  def('adductor_squeeze', { k: [SUPK, ov(SUPK, { L1: { to: [0.41, F] } })], b: 4, props: [{ type: 'ball', at: 'knee1', dy: 0.0 }], fam: 'supine', cam: 'generic' });
  {
    const MW = { view: 'front', hip: [0, 0.78], t: 180, A1: HANDS_HIPS, L1: { to: [0.2, F], b: 1 }, L2: { to: [-0.2, F], b: -1 } };
    def('monster_walk', { view: 'front', k: [MW, ov(MW, { hip: [0.08, 0.8], L1: { to: [0.44, 0.14], b: 1 } }), ov(MW, { hip: [0.16, 0.78], L1: { to: [0.44, F], b: 1 }, L2: { to: [0.0, F], b: -1 } }), ov(MW, { hip: [0.08, 0.8], L1: { to: [0.32, F], b: 1 }, L2: { to: [-0.1, 0.14], b: -1 } })], b: 4, rpc: 2, props: [{ type: 'band', a: 'knee1', b: 'knee2' }], fam: 'stand', cam: 'generic' });
    alias('lateral_walk', 'monster_walk');
    M.lateral_walk.props = [{ type: 'band', a: 'ank1', b: 'ank2' }];
  }

  // ================= CADENA POSTERIOR =================
  {
    const kn = [0, 0.05];
    const NK = { hip: fromKnee(kn, 180), t: 180, A1: [10, 20], L1: [180, -90], L2: [178, -88] };
    const n1 = fromKnee(kn, 125);
    def('nordic', { k: [NK, { hip: n1, t: 125, A1: [70, 80], L1: [125, -90], L2: [123, -88] }], times: [0, 0.75], b: 6, props: [{ type: 'anchor', at: 'ank1', layer: 'front' }], fam: 'quad', cam: 'generic' });
  }
  def('single_rdl', { k: [ov(ST, { L2: { to: [-0.12, 0.12] } }), { hip: [0, 0.88], t: 96, A1: [0, 0], L1: { to: [0.02, F] }, L2: [-96, -96] }], b: 4, fam: 'stand', cam: 'generic' });
  def('good_morning', { k: [ov(ST, { A1: BEHIND_HEAD, L1: { to: [0.05, F] } }), { hip: [-0.16, 0.88], t: 100, A1: BEHIND_HEAD, L1: { to: [0.04, F] }, L2: { to: [0.01, F] } }], b: 4, props: [{ type: 'band', a: 'neck', b: 'ank1' }], fam: 'stand', cam: 'generic' });
  def('superman', { k: [PRN, ov(PRN, { t: 100, h: 108, A1: [104, 104], A2: [102, 102], L1: [-102, -102], L2: [-100, -100] })], b: 4, fam: 'prone', cam: 'generic' });
  def('swimmer', { k: [ov(PRN, { t: 98, A1: [106, 106], L2: [-104, -104] }), ov(PRN, { t: 98, A2: [106, 106], L1: [-104, -104] })], b: 2, rpc: 2, fam: 'prone', cam: 'generic' });
  def('prone_row', { k: [ov(PRN, { t: 100, A1: [104, 104] }), ov(PRN, { t: 102, A1: [-120, 90], A2: [-116, 92] })], b: 4, fam: 'prone', cam: 'generic' });
  def('hyperextension', { k: [{ hip: [0, 0.6], t: 15, A1: { r: [29, -156] }, L1: [-94, -94], L2: [-92, -92] }, { hip: [0, 0.6], t: 96, A1: { r: [29, -156] }, L1: [-94, -94], L2: [-92, -92] }], b: 4, props: [{ type: 'bench', at: 'hip', w: 0.5 }], fam: 'prone', cam: 'generic' });

  // ================= FÚTBOL CON BALÓN =================
  def('balance_juggle', { k: [ov(ST, { A1: [20, 40], A2: [-20, 20], L2: { to: [0.0, 0.2] } }), ov(ST, { A1: [24, 44], A2: [-24, 20], L2: [60, 2], F2: 80 })], b: 2, props: [{ type: 'ball', at: 'foot2', dy: 0.25 }], fam: 'stand', cam: 'generic' });
  def('land_hold', { k: [ov(SQ(0.5), { A1: [-50, -40] }), ov(ST, { lift: 0.32, A1: [160, 170], L1: { to: [0.06, 0.04] }, L2: { to: [0.0, 0.04] }, F1: 20, F2: 20 }), ov(SQ(0.35), { A1: [80, 80], A2: [70, 70], L2: [-20, -110] }), ov(SQ(0.2), { A1: [86, 86], A2: [74, 74], L2: [-20, -110] })], b: 6, fam: 'stand', cam: 'squat' });
  {
    const SK = s => ({ view: 'front', hip: [0.42 * s, 0.74], t: 180 - 12 * s, A1: s > 0 ? [-30, -20] : [60, 60], A2: s > 0 ? [-60, -60] : [30, 20], L1: s > 0 ? { to: [0.5, F], b: 1 } : { to: [-0.18, 0.24], b: 1 }, L2: s > 0 ? { to: [0.18, 0.24], b: -1 } : { to: [-0.5, F], b: -1 } });
    def('skater', { view: 'front', k: [SK(1), ov(STF, { lift: 0.18, hip: [0, 0.92] }), SK(-1), ov(STF, { lift: 0.18 })], b: 3, rpc: 2, fam: 'jump', cam: 'generic' });
  }

  // ================= LOCOMOCIÓN =================
  const WK = (side, o) => {
    const up = side > 0 ? 'L1' : 'L2', dn = side > 0 ? 'L2' : 'L1';
    const p = ov(ST, o);
    p[up] = (o && o.up) || [42, -12]; p[dn] = (o && o.dn) || { to: [side > 0 ? -0.06 : -0.03, F] };
    p.A1 = side > 0 ? [-25, -10] : [25, 40]; p.A2 = side > 0 ? [25, 40] : [-25, -10];
    delete p.up; delete p.dn; return p;
  };
  def('march', { k: [WK(1), ov(ST), WK(-1), ov(ST)], b: 2, rpc: 2, props: [{ type: 'pack' }], fam: 'stand', cam: 'generic' });
  def('jog', { k: [ov(WK(1), { lift: 0.04, A1: [-40, 30], A2: [40, 110] }), ov(ST, { A1: [0, 70], A2: [0, 70] }), ov(WK(-1), { lift: 0.04, A1: [40, 110], A2: [-40, 30] }), ov(ST, { A1: [0, 70], A2: [0, 70] })], b: 2, rpc: 2, fam: 'stand', cam: 'generic' });
  def('run', { k: [{ hip: [0, 0.94], t: 172, A1: [-50, 20], A2: [55, 130], L1: [70, -20], L2: [-30, -100], lift: 0.06 }, { hip: [0, 0.94], t: 172, A1: [55, 130], A2: [-50, 20], L1: [-30, -100], L2: [70, -20], lift: 0.06 }], b: 1, rpc: 2, ease: 'sin', fam: 'stand', cam: 'generic' });
  alias('shuttle', 'run');
  def('high_knees', { k: [{ hip: [0, 0.92], t: 182, A1: [-40, 40], A2: [60, 140], L1: [98, -6], L2: { to: [-0.02, F] }, lift: 0.04 }, { hip: [0, 0.92], t: 182, A1: [60, 140], A2: [-40, 40], L2: [98, -6], L1: { to: [-0.02, F] }, lift: 0.04 }], b: 1, rpc: 2, fam: 'stand', cam: 'generic' });
  def('butt_kicks', { k: [{ hip: [0, 0.92], t: 178, A1: [-30, 40], A2: [30, 100], L1: [-6, -160], L2: { to: [0.02, F] }, lift: 0.03 }, { hip: [0, 0.92], t: 178, A1: [30, 100], A2: [-30, 40], L2: [-6, -160], L1: { to: [0.02, F] }, lift: 0.03 }], b: 1, rpc: 2, fam: 'stand', cam: 'generic' });
  def('suitcase_carry', { k: [ov(WK(1), { A1: [6, 4] }), ov(ST, { A1: [6, 4] }), ov(WK(-1), { A1: [6, 4] }), ov(ST, { A1: [6, 4] })], b: 2, rpc: 2, props: [{ type: 'kettle', at: 'hand1' }], fam: 'stand', cam: 'generic' });
  def('fireman', { k: [ov(WK(1), { A1: [150, -150], A2: [154, -146] }), ov(ST, { A1: [150, -150], A2: [154, -146] }), ov(WK(-1), { A1: [150, -150], A2: [154, -146] }), ov(ST, { A1: [150, -150], A2: [154, -146] })], b: 2, rpc: 2, props: [{ type: 'sack', at: 'neck', dy: -0.12, layer: 'back' }], fam: 'stand', cam: 'generic' });
  def('drag', { k: [{ hip: [0, 0.82], t: 196, A1: [60, 70], A2: [64, 72], L1: { to: [-0.12, F] }, L2: [40, -30] }, { hip: [0, 0.82], t: 196, A1: [60, 70], A2: [64, 72], L2: { to: [-0.12, F] }, L1: [40, -30] }], b: 2, rpc: 2, props: [{ type: 'band', a: 'hands', b: [1.1, 0.12], color: '#c9a66b' }, { type: 'sack', pos: [1.15, 0.1] }], fam: 'stand', cam: 'generic' });
  {
    const BC = s => ov(QD, { hip: [0, 0.56], L1: s > 0 ? [24, -60] : [0, -76], L2: s > 0 ? [0, -76] : [24, -60], A1: s > 0 ? { to: [0.32, H] } : { to: [0.56, H] }, A2: s > 0 ? { to: [0.56, H] } : { to: [0.32, H] } });
    def('bear_crawl', { k: [BC(1), BC(-1)], b: 2, rpc: 2, fam: 'quad', cam: 'generic' });
    const CR = s => ({ hip: [0, 0.42], t: -112, h: -100, A1: { to: [-0.5, H], b: 1 }, A2: { to: [-0.53, H], b: 1 }, L1: { to: [s > 0 ? 0.52 : 0.38, s > 0 ? 0.12 : F] }, L2: { to: [s > 0 ? 0.36 : 0.5, s > 0 ? F : 0.12] } });
    def('crab_walk', { k: [CR(1), CR(-1)], b: 2, rpc: 2, fam: 'quad', cam: 'generic' });
    const LC = s => ov(PRN, { hip: [0, 0.12], t: 92, A1: s > 0 ? [80, 100] : [20, 92], A2: s > 0 ? [20, 92] : [80, 100], L1: s > 0 ? [-60, -100] : [-92, -92], L2: s > 0 ? [-92, -92] : [-60, -100] });
    def('low_crawl', { k: [LC(1), LC(-1)], b: 2, rpc: 2, fam: 'prone', cam: 'generic' });
    const HC = s => ov(PF, { hip: [0, 0.46], t: 100, A1: s > 0 ? [10, 96] : [-6, 90], A2: s > 0 ? [-6, 90] : [10, 96], L1: s > 0 ? [20, -90] : [-10, -90], L2: s > 0 ? [-10, -90] : [20, -90] });
    def('high_crawl', { k: [HC(1), HC(-1)], b: 2, rpc: 2, fam: 'quad', cam: 'generic' });
  }

  // ================= FLEXIONES =================
  def('pushup', { k: [PH, PL], b: 3, fam: 'push', cam: 'pushup' });
  alias('pushup_wide', 'pushup'); alias('pushup_diamond', 'pushup'); alias('pushup_archer', 'pushup');
  def('pushup_pause', { k: [PH, PL, PL], times: [0, 0.3, 0.75], b: 6, fam: 'push', cam: 'pushup' });
  def('pushup_hold', { k: [ov(PL, { hip: [0.04, 0.27], t: 100 }), ov(PL, { hip: [0.04, 0.265], t: 100 })], b: 1, hold: 1, fam: 'push', cam: 'plank' });
  def('pushup_release', { k: [PH, ov(PL, { hip: [0.06, 0.14], t: 93 }), ov(PL, { hip: [0.06, 0.13], t: 92, A1: [94, 96], A2: [96, 98] })], b: 4, fam: 'push', cam: 'pushup' });
  def('pushup_single_leg', { k: [ov(PH, { L2: [-112, -112] }), ov(PL, { L2: [-100, -100] })], b: 3, fam: 'push', cam: 'pushup' });
  def('pushup_one', { k: [ov(PH, { A2: { r: [-40, 70] }, L2: { to: [-0.84, F] } }), ov(PL, { hip: [0.05, 0.26], A2: { r: [-40, 70] } })], b: 4, fam: 'push', cam: 'pushup' });
  def('pushup_clap', { k: [PH, PL, ov(PH, { lift: 0.14, hip: [0.02, 0.5], A1: { to: [0.34, 0.3], b: -1 }, A2: { to: [0.32, 0.3], b: -1 } }), PH], times: [0, 0.35, 0.65, 0.85], b: 4, fam: 'push', cam: 'pushup' });
  def('pushup_decline', { k: [{ hip: [0, 0.66], t: 98, A1: { to: [0.44, H] }, L1: { to: [-0.82, 0.52] }, L2: { to: [-0.82, 0.52] } }, { hip: [0.04, 0.46], t: 80, A1: { to: [0.44, H] }, L1: { to: [-0.82, 0.52] }, L2: { to: [-0.82, 0.52] } }], b: 3, props: [{ type: 'bench', at: 'ank1', w: 0.4 }], fam: 'push', cam: 'pushup' });
  def('pushup_incline', { k: [{ hip: [0, 0.62], t: 118, A1: { to: [0.5, 0.5] }, L1: { to: [-0.74, F] }, L2: { to: [-0.74, F] } }, { hip: [0.06, 0.48], t: 110, A1: { to: [0.5, 0.5] }, L1: { to: [-0.74, F] }, L2: { to: [-0.74, F] } }], b: 3, props: [{ type: 'bench', x: 0.52, w: 0.4, h: 0.46 }], fam: 'push', cam: 'pushup' });
  def('pushup_spider', { k: [PH, ov(PL, { L1: [60, -40] }), PH, ov(PL, { L2: [60, -40] })], b: 3, rpc: 2, fam: 'push', cam: 'pushup' });
  def('pushup_t', { k: [PH, PL, PH, ov(PH, { A1: [180, 180], t: 116 })], b: 6, fam: 'push', cam: 'pushup' });
  def('dive_bomber', { k: [{ hip: [-0.05, 0.92], t: 48, A1: { to: [0.48, H] }, L1: { to: [-0.62, F] }, L2: { to: [-0.62, F] } }, { hip: [0.1, 0.28], t: 92, A1: { to: [0.48, H] }, L1: { to: [-0.72, F] }, L2: { to: [-0.72, F] } }, { hip: [0.3, 0.26], t: 132, h: 150, A1: { to: [0.48, H] }, L1: { to: [-0.56, F] }, L2: { to: [-0.56, F] } }], b: 6, fam: 'push', cam: 'generic' });
  def('pike_pushup', { k: [{ hip: [-0.04, 0.92], t: 48, A1: { to: [0.44, H] }, L1: { to: [-0.56, F] }, L2: { to: [-0.56, F] } }, { hip: [0.0, 0.76], t: 30, A1: { to: [0.44, H] }, L1: { to: [-0.56, F] }, L2: { to: [-0.56, F] } }], b: 3, fam: 'push', cam: 'generic' });
  def('hspu', { k: [{ hip: [0, 1.06], t: 2, h: 4, A1: { to: [0.0, H], b: 1 }, L1: [178, 178], L2: [-178, -178] }, { hip: [0, 0.82], t: 8, h: 10, A1: { to: [0.0, H], b: 1 }, L1: [178, 178], L2: [-178, -178] }], b: 4, props: [{ type: 'wall', x: -0.16 }], fam: 'push', cam: 'generic' });
  def('bench_dips', { g: false, k: [{ hip: [0.12, 0.62], t: 186, A1: { to: [-0.06, 0.46], b: -1 }, L1: { to: [0.92, F] }, L2: { to: [0.89, F] } }, { hip: [0.1, 0.36], t: 180, A1: { to: [-0.06, 0.46], b: -1 }, L1: { to: [0.92, F] }, L2: { to: [0.89, F] } }], b: 3, props: [{ type: 'bench', x: -0.2, w: 0.45, h: 0.42 }], fam: 'push', cam: 'generic' });

  // ================= DOMINADAS =================
  def('pullup', { k: [HANG, PULL], b: 4, g: false, props: barP, fam: 'pull', cam: 'pullup' });
  alias('chinup', 'pullup'); alias('pullup_wide', 'pullup'); alias('commando', 'pullup');
  def('pullup_lsit', { k: [ov(HANG, { L1: [90, 90], L2: [88, 88] }), ov(PULL, { L1: [90, 90], L2: [88, 88] })], b: 4, g: false, props: barP, fam: 'pull', cam: 'pullup' });
  def('pullup_negative', { k: [HANG, PULL], times: [0, 0.15], b: 6, g: false, props: barP, fam: 'pull', cam: 'pullup' });
  def('dead_hang', { k: [HANG, ov(HANG, { hip: [0.02, 1.27], L1: [6, -10], L2: [10, -8] })], b: 4, hold: 1, g: false, props: barP, fam: 'pull', cam: 'generic' });
  def('scap_pull', { k: [HANG, ov(HANG, { hip: [0, 1.33] })], b: 2, g: false, props: barP, fam: 'pull', cam: 'generic' });
  def('inverted_row', { k: [{ hip: [0, 0.34], t: 108, A1: { to: [0.44, 1.0], b: -1 }, L1: { to: [-0.84, F] }, L2: { to: [-0.84, F] } }, { hip: [0, 0.6], t: 98, A1: { to: [0.44, 1.0], b: -1 }, L1: { to: [-0.84, F] }, L2: { to: [-0.84, F] } }], b: 3, props: [{ type: 'bar', y: 1.0, x: 0.44 }], fam: 'pull', cam: 'generic' });
  def('rope_climb', { g: false, k: [{ hip: [0, 1.1], t: 182, A1: { to: [0.12, 2.0], b: -1 }, A2: { to: [0.12, 1.75], b: -1 }, L1: [70, -20], L2: [30, -50] }, { hip: [0, 1.45], t: 182, A1: { to: [0.12, 2.05], b: -1 }, A2: { to: [0.12, 2.35], b: -1 }, L1: [30, -50], L2: [70, -20] }, { hip: [0, 1.8], t: 182, A1: { to: [0.12, 2.7], b: -1 }, A2: { to: [0.12, 2.45], b: -1 }, L1: [70, -20], L2: [30, -50] }], b: 6, props: [{ type: 'rope', x: 0.12 }], fam: 'pull', cam: 'generic' });
  def('muscle_up', { g: false, k: [HANG, PULL, ov(PULL, { hip: [0.12, 1.92], t: 158, A1: { to: [0.04, BAR], b: -1 }, L1: [20, -30] }), { hip: [-0.02, 2.4], t: 178, A1: { to: [0.04, BAR], b: -1 }, A2: { to: [0.0, BAR], b: -1 }, L1: [10, -14], L2: [14, -10] }], b: 8, props: barP, fam: 'pull', cam: 'generic' });

  // ================= ESCALADORES =================
  def('mountain_climber', { k: [ov(PH, { L1: [74, -50] }), ov(PH, { L2: [74, -50] })], b: 1, rpc: 2, fam: 'plank', cam: 'climber' });
  alias('mountain_climber_cross', 'mountain_climber');
  def('mountain_climber_slow', { k: [PH, ov(PH, { L1: [80, -40] }), PH, ov(PH, { L2: [80, -40] })], b: 4, rpc: 2, fam: 'plank', cam: 'climber' });

  // ================= PIERNAS =================
  def('squat', { k: [ov(ST, { A1: [10, 30] }), SQ(1)], b: 4, fam: 'stand', cam: 'squat' });
  def('jump_squat', { k: [SQ(0.9), ov(ST, { lift: 0.3, A1: [-30, -20], L1: { to: [0.04, 0.02] }, L2: { to: [0.0, 0.02] }, F1: 20, F2: 20 }), SQ(0.4)], times: [0, 0.45, 0.75], b: 4, fam: 'jump', cam: 'squat' });
  def('sumo_squat', { view: 'front', k: [ov(STF, { L1: { to: [0.32, F], b: 1 }, A1: { to: [0.04, 1.18], b: 1 } }), ov(STF, { hip: [0, 0.56], L1: { to: [0.34, F], b: 1 }, A1: { to: [0.04, 1.0], b: 1 } })], b: 4, fam: 'stand', cam: 'squat' });
  def('bulgarian', { k: [{ hip: [0, 0.86], t: 180, A1: HANDS_HIPS, L1: { to: [0.32, F] }, L2: { to: [-0.62, 0.47] } }, { hip: [-0.06, 0.5], t: 172, A1: HANDS_HIPS, L1: { to: [0.32, F] }, L2: { to: [-0.62, 0.47] } }], b: 4, props: [{ type: 'bench', x: -0.68, w: 0.45, h: 0.42 }], g: false, fam: 'stand', cam: 'lunge' });
  def('pistol', { k: [ov(ST, { A1: [60, 70], L2: [30, 30] }), { hip: [-0.2, 0.38], t: 130, A1: [92, 92], L1: { to: [0.04, F] }, L2: [84, 86] }], b: 4, fam: 'stand', cam: 'squat' });
  def('wall_sit', { k: [{ hip: [0, 0.5], t: 180, A1: [90, 90], L1: { to: [0.46, F] }, L2: { to: [0.43, F] } }, { hip: [0, 0.495], t: 180, A1: [92, 92], L1: { to: [0.46, F] }, L2: { to: [0.43, F] } }], b: 4, hold: 1, g: false, props: [{ type: 'wall', x: -0.15, side: 1 }], fam: 'stand', cam: 'squat' });
  const LU = (s, d, o) => {
    const fr = s > 0 ? 'L1' : 'L2', bk = s > 0 ? 'L2' : 'L1';
    const p = { hip: [0, 0.92 - 0.38 * d], t: 180, A1: HANDS_HIPS };
    p[fr] = { to: [0.42 * d + 0.03 * (1 - d), F] }; p[bk] = { to: [-0.5 * d - 0.03 * (1 - d), F + 0.06 * d] };
    return Object.assign(p, o || {});
  };
  const STH = ov(ST, { A1: HANDS_HIPS });
  const STEPF = s => { const p = ov(STH, { hip: [0, 0.9] }); p[s > 0 ? 'L1' : 'L2'] = { to: [0.24, 0.22] }; return p; };
  def('lunge', { k: [STH, STEPF(1), LU(1, 1), STH, STEPF(-1), LU(-1, 1)], times: [0, 0.08, 0.2, 0.5, 0.58, 0.7], b: 8, rpc: 2, fam: 'stand', cam: 'lunge' });
  alias('walking_lunge', 'lunge');
  const STEPB = s => { const p = ov(STH, { hip: [0, 0.9] }); p[s > 0 ? 'L2' : 'L1'] = { to: [-0.26, 0.24] }; return p; };
  def('reverse_lunge', { k: [STH, STEPB(1), LU(1, 1), STH, STEPB(-1), LU(-1, 1)], times: [0, 0.08, 0.2, 0.5, 0.58, 0.7], b: 8, rpc: 2, fam: 'stand', cam: 'lunge' });
  def('jump_lunge', { k: [LU(1, 1), ov(LU(1, 0.4), { lift: 0.25, A1: [60, 60], A2: [-40, -30] }), LU(-1, 1), ov(LU(-1, 0.4), { lift: 0.25, A1: [-40, -30], A2: [60, 60] })], b: 3, rpc: 2, fam: 'jump', cam: 'lunge' });
  {
    const LL = (s, o) => Object.assign({ view: 'front', hip: [0.3 * s, 0.6], t: 180 - 8 * s, A1: { to: [0.3 * s + 0.04, 1.15], b: 1 }, A2: { to: [0.3 * s - 0.04, 1.15], b: -1 }, L1: { to: [s > 0 ? 0.62 : 0.2, F], b: 1 }, L2: { to: [s > 0 ? -0.2 : -0.62, F], b: -1 } }, o || {});
    const LW = ov(STF, { L1: { to: [0.2, F], b: 1 }, A1: { to: [0.04, 1.15], b: 1 } });
    def('lateral_lunge', { view: 'front', k: [LW, LL(1), LW, LL(-1)], b: 4, rpc: 2, fam: 'stand', cam: 'lunge' });
    def('turn_lunge', { view: 'front', k: [LW, LL(1, { A1: { to: [0.6, 0.3], b: 1 }, A2: { to: [0.58, 0.3], b: 1 }, t: 150 }), LW, LL(-1, { A1: { to: [-0.58, 0.3], b: -1 }, A2: { to: [-0.6, 0.3], b: -1 }, t: 210 })], b: 4, rpc: 2, fam: 'stand', cam: 'lunge' });
  }
  def('step_up', { g: false, k: [ov(ST, { A1: [-10, -4] }), ov(ST, { hip: [0.04, 0.95], L1: { to: [0.4, 0.5] }, A1: [30, 40], A2: [-30, -20] }), { hip: [0.36, 1.38], t: 180, A1: [-4, -2], L1: { to: [0.42, 0.5] }, L2: { to: [0.36, 0.5] } }, ov(ST, { hip: [0.04, 0.95], L1: { to: [0.4, 0.5] }, A1: [-30, -20], A2: [30, 40] })], b: 6, props: [{ type: 'box', x: 0.42, w: 0.46, h: 0.44 }], fam: 'stand', cam: 'generic' });
  def('calf_raise', { k: [ST, ov(ST, { hip: [0, 1.02], L1: { to: [0.03, 0.15] }, L2: { to: [-0.03, 0.15] }, F1: 24, F2: 24 })], b: 2, fam: 'stand', cam: 'generic' });
  def('frog_jump', { k: [ov(SQ(1.15), { t: 110, A1: { to: [0.32, H] }, A2: { to: [0.3, H] } }), ov(ST, { lift: 0.35, A1: [170, 176], L1: { to: [0.0, 0.02] }, L2: { to: [-0.04, 0.02] }, F1: 20, F2: 20 }), SQ(0.8)], times: [0, 0.45, 0.75], b: 4, fam: 'jump', cam: 'squat' });
  def('tuck_jump', { k: [SQ(0.6), ov(ST, { lift: 0.62, hip: [0, 0.92], t: 170, A1: [70, 70], A2: [74, 74], L1: [112, -16], L2: [110, -18] }), SQ(0.5)], times: [0, 0.45, 0.8], b: 4, fam: 'jump', cam: 'generic' });
  def('broad_jump', { k: [ov(SQ(0.7), { A1: [-60, -40] }), ov(ST, { hip: [0.35, 0.92], lift: 0.38, t: 150, A1: [140, 150], L1: [40, -60], L2: [44, -56] }), ov(SQ(0.7), { hip: [0.6, 0.6], L1: { to: [0.8, F] }, L2: { to: [0.77, F] } }), ov(ST, { hip: [0.6, 0.92], L1: { to: [0.63, F] }, L2: { to: [0.57, F] } })], times: [0, 0.3, 0.55, 0.75], b: 6, fam: 'jump', cam: 'generic' });

  // ================= CUERPO COMPLETO =================
  const CROUCH = { hip: [-0.1, 0.5], t: 92, A1: { to: [0.38, H] }, A2: { to: [0.35, H] }, L1: { to: [0.04, F] }, L2: { to: [0.01, F] } };
  const PLB = { hip: [0.05, 0.47], t: 112, A1: { to: [0.49, H] }, A2: { to: [0.46, H] }, L1: { to: [-0.74, F] }, L2: { to: [-0.74, F] } };
  const PLBD = ov(PLB, { hip: [0.1, 0.2], t: 96 });
  const JUMPUP = ov(ST, { lift: 0.28, A1: [178, 178], A2: [176, 176], L1: { to: [0.04, 0.02] }, L2: { to: [0.0, 0.02] }, F1: 20, F2: 20 });
  def('burpee', { k: [ST, CROUCH, PLB, CROUCH, JUMPUP], times: [0, 0.2, 0.4, 0.6, 0.8], b: 8, fam: 'full', cam: 'burpee' });
  def('burpee_pushup', { k: [ST, CROUCH, PLB, PLBD, PLB, CROUCH, JUMPUP], times: [0, 0.13, 0.27, 0.42, 0.56, 0.7, 0.85], b: 10, fam: 'full', cam: 'burpee' });
  alias('burpee_box', 'burpee'); M.burpee_box.props = [];
  alias('burpee_pullup', 'burpee');
  def('eight_count', { k: [ST, CROUCH, PLB, PLBD, PLB, CROUCH], times: [0, 0.15, 0.32, 0.5, 0.66, 0.82], b: 8, fam: 'full', cam: 'burpee' });
  def('sprawl', { k: [ov(ST, { A1: [20, 60] }), { hip: [0.0, 0.14], t: 96, h: 110, A1: { to: [0.44, H] }, A2: { to: [0.41, H] }, L1: { to: [-0.82, F] }, L2: { to: [-0.82, F] } }, CROUCH], times: [0, 0.35, 0.7], b: 4, fam: 'full', cam: 'burpee' });
  def('sprint_drop', { k: [M.run.k[0], M.run.k[1], M.run.k[0], M.run.k[1], CROUCH, PLB, PLBD, PLB, CROUCH], b: 10, fam: 'full', cam: 'burpee' });
  def('inchworm', { k: [ST, { hip: [-0.06, 0.88], t: 12, A1: { to: [0.24, H] }, A2: { to: [0.21, H] }, L1: { to: [0.02, F] }, L2: { to: [-0.01, F] } }, { hip: [0.2, 0.74], t: 64, A1: { to: [0.7, H] }, A2: { to: [0.67, H] }, L1: { to: [0.02, F] }, L2: { to: [-0.01, F] } }, { hip: [0.74, 0.44], t: 110, A1: { to: [1.18, H] }, A2: { to: [1.15, H] }, L1: { to: [0.02, F] }, L2: { to: [-0.01, F] } }], b: 8, fam: 'full', cam: 'generic' });
  def('thruster', { k: [ov(SQ(0.95), { A1: [100, -160], A2: [104, -156] }), ov(ST, { A1: [178, 178], A2: [176, 178] })], b: 4, props: [{ type: 'sack', at: 'hands' }], fam: 'stand', cam: 'squat' });
  def('power_jump', { k: [ov(SQ(1.1), { t: 96, A1: { to: [0.34, H] }, A2: { to: [0.31, H] } }), ov(JUMPUP, { lift: 0.32 }), SQ(0.5)], times: [0, 0.45, 0.75], b: 4, fam: 'jump', cam: 'squat' });
  def('high_jumper', { k: [ov(SQ(0.35), { A1: [-50, -40], A2: [-46, -36] }), ov(ST, { lift: 0.1, A1: [170, 172], A2: [168, 170], L1: { to: [0.04, 0.04] }, L2: { to: [0.0, 0.04] }, F1: 30, F2: 30 })], b: 2, fam: 'jump', cam: 'generic' });
  def('bend_reach', { k: [ov(ST, { t: 188, A1: [176, 178], A2: [174, 176], L1: { to: [0.18, F] }, L2: { to: [-0.12, F] } }), { hip: [-0.12, 0.66], t: 52, A1: [-24, -30], A2: [-20, -26], L1: { to: [0.18, F] }, L2: { to: [-0.12, F] } }], b: 4, fam: 'stand', cam: 'generic' });
  def('squat_bender', { k: [ST, ov(SQ(0.85), { A1: [90, 90] }), ST, { hip: [-0.08, 0.9], t: 70, A1: [0, 0], L1: { to: [0.03, F] }, L2: { to: [0.0, F] } }], b: 8, fam: 'stand', cam: 'squat' });
  {
    const WM = ov(STF, { L1: { to: [0.36, F], b: 1 }, A1: [90, 90] });
    def('windmill', { view: 'front', k: [WM, ov(WM, { t: 110, h: 100, A1: [178, 178], A2: { to: [0.36, 0.25], b: -1 } }), WM, ov(WM, { t: 250, h: 260, A2: [-178, -178], A1: { to: [-0.36, 0.25], b: 1 } })], b: 6, rpc: 2, fam: 'stand', cam: 'generic' });
    def('arms_cross_hold', { view: 'front', k: [ov(STF, { A1: [90, 90] }), ov(STF, { A1: [92, 92] })], b: 2, hold: 1, fam: 'stand', cam: 'generic' });
    const JJ0 = ov(STF, { A1: [8, 4] }), JJ1 = ov(STF, { lift: 0.02, A1: [168, 172], L1: { to: [0.36, F], b: 1 } });
    def('jumping_jack', { view: 'front', k: [JJ0, ov(JJ0, { lift: 0.08, A1: [90, 100] }), JJ1, ov(JJ0, { lift: 0.08, A1: [90, 100] })], b: 2, fam: 'jack', cam: 'jack' });
    def('half_jack', { view: 'front', k: [JJ0, ov(STF, { A1: [92, 94], L1: { to: [0.34, F], b: 1 } })], b: 2, fam: 'jack', cam: 'jack' });
    def('seal_jack', { view: 'front', k: [ov(STF, { A1: { to: [-0.08, 1.35], b: 1 } }), ov(STF, { lift: 0.06, A1: [92, 92], L1: { to: [0.36, F], b: 1 } })], b: 2, fam: 'jack', cam: 'jack' });
  }

  // Encadena FIFA 11+ y alias finales
  alias('fifa11', 'jog');
  alias('hello', 'jog');

  G.Motions = M;
})(window);
