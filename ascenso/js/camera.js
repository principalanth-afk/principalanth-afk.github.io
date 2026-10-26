/* ASCENSO — Cámara: grabación + verificación de técnica con detección de postura
   Usa MediaPipe Pose Landmarker (se descarga la primera vez, luego queda en caché).
   Todo se procesa en tu teléfono: el video no se sube a ningún servidor. */
(function (G) {
  'use strict';
  const MP_VER = '0.10.14';
  const MP_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}`;
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
  const EDGES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32]];

  const ang = (a, b, c) => {
    const v1 = [a.x - b.x, a.y - b.y], v2 = [c.x - b.x, c.y - b.y];
    const d = Math.hypot(...v1) * Math.hypot(...v2) || 1e-6;
    return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / d))) * 180 / Math.PI;
  };
  const vis = p => (p && (p.visibility == null ? 1 : p.visibility)) || 0;

  /* Analizadores: devuelven {rep:bool, fb:'clave', good:bool} */
  function makeAnalyzer(type) {
    const st = { phase: 'up', minA: 999, maxA: 0, side: null, last: 0, openSeen: false, knee: null };
    const pick = (lm, l, r) => (vis(lm[l]) >= vis(lm[r]) ? l : r);
    const S = lm => { const s = pick(lm, 11, 12) === 11 ? 0 : 1; return { sh: lm[11 + s], el: lm[13 + s], wr: lm[15 + s], hip: lm[23 + s], kn: lm[25 + s], an: lm[27 + s] }; };
    const out = (rep, fb, good) => ({ rep: !!rep, fb: fb || null, good: good !== false });
    const cycle = (a, downTh, upTh, minOK, fbBad) => {
      let rep = false, fb = null;
      if (st.phase === 'up') { if (a < downTh) { st.phase = 'down'; st.minA = a; } }
      else { st.minA = Math.min(st.minA, a); if (a > upTh) { st.phase = 'up'; rep = true; if (minOK != null && st.minA > minOK) fb = fbBad; } }
      return { rep, fb };
    };
    return function (lm) {
      if (!lm) return out(false, 'formNoBody', false);
      const p = S(lm);
      if (vis(p.sh) < 0.4 || vis(p.hip) < 0.4) return out(false, 'formNoBody', false);
      switch (type) {
        case 'squat': {
          if (vis(p.kn) < 0.4) return out(false, 'formNoBody', false);
          const a = ang(p.hip, p.kn, p.an);
          const torso = Math.abs(Math.atan2(p.sh.x - p.hip.x, p.hip.y - p.sh.y)) * 180 / Math.PI;
          const r = cycle(a, 115, 160, 100, 'formLow');
          return out(r.rep, r.fb || (torso > 60 ? 'formBack' : null), !r.fb);
        }
        case 'lunge': {
          const a = Math.min(ang(lm[23], lm[25], lm[27]), ang(lm[24], lm[26], lm[28]));
          const r = cycle(a, 120, 160, 105, 'formLow');
          return out(r.rep, r.fb, !r.fb);
        }
        case 'pushup': {
          const a = ang(p.sh, p.el, p.wr);
          const line = ang(p.sh, p.hip, p.an);
          const r = cycle(a, 110, 150, 100, 'formLow');
          const fb = r.fb || (line < 150 ? 'formHips' : null);
          return out(r.rep, fb, !fb);
        }
        case 'situp': {
          const a = ang(p.sh, p.hip, p.kn);
          let rep = false;
          if (st.phase === 'up') { if (a > 115) st.phase = 'down'; }
          else if (a < 80) { st.phase = 'up'; rep = true; }
          return out(rep, null);
        }
        case 'bridge': {
          const a = ang(p.sh, p.hip, p.kn);
          let rep = false, fb = null;
          if (st.phase === 'up') { if (a < 135) { st.phase = 'down'; } }
          else { st.maxA = Math.max(st.maxA, a); if (a > 160) { st.phase = 'up'; rep = true; st.maxA = 0; } }
          return out(rep, fb);
        }
        case 'jack': {
          const shw = Math.abs(lm[11].x - lm[12].x) || 0.1;
          const handsUp = lm[15].y < lm[0].y && lm[16].y < lm[0].y;
          const feetOpen = Math.abs(lm[27].x - lm[28].x) > shw * 1.4;
          let rep = false;
          if (handsUp && feetOpen) st.openSeen = true;
          const closed = lm[15].y > lm[11].y && lm[16].y > lm[12].y;
          if (st.openSeen && closed) { st.openSeen = false; rep = true; }
          return out(rep, null);
        }
        case 'pullup': {
          let rep = false;
          const up = lm[0].y < Math.min(lm[15].y, lm[16].y) + 0.02;
          const a = ang(p.sh, p.el, p.wr);
          if (st.phase === 'down' && up) { st.phase = 'up'; rep = true; }
          else if (st.phase === 'up' && a > 150) st.phase = 'down';
          if (!st.phase) st.phase = 'down';
          return out(rep, null);
        }
        case 'climber': {
          const l = ang(lm[11], lm[23], lm[25]), r = ang(lm[12], lm[24], lm[26]);
          let rep = false;
          const k = l < 110 ? 'L' : r < 110 ? 'R' : null;
          if (k && k !== st.knee) { st.knee = k; rep = true; }
          if (!k && l > 140 && r > 140) st.knee = st.knee;
          const line = ang(p.sh, p.hip, p.an);
          return out(rep, line < 140 ? 'formHips' : null);
        }
        case 'burpee': {
          const floor = Math.abs(p.sh.y - p.hip.y) < 0.12;
          const stand = p.sh.y < p.hip.y - 0.15 && p.hip.y < p.kn.y;
          let rep = false;
          if (floor) st.phase = 'floor';
          else if (stand && st.phase === 'floor') { st.phase = 'stand'; rep = true; }
          return out(rep, null);
        }
        case 'plank': {
          const line = ang(p.sh, p.hip, vis(p.an) > 0.3 ? p.an : p.kn);
          const good = line > 158;
          return out(false, good ? 'formGood' : 'formHips', good);
        }
        default: return out(false, null, true);
      }
    };
  }

  const Cam = {
    stream: null, video: null, canvas: null, ctx: null, lm: null, landmarker: null, loading: false, offline: false,
    running: false, analyzer: null, onRep: null, onFb: null, onHold: null, rec: null, chunks: [], facing: 'user',
    hud: { title: '', count: '', fb: '' }, lastFbKey: null, lastFbT: 0, goodSince: 0,
    supported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); },
    async request() {
      if (!this.supported()) return false;
      try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); s.getTracks().forEach(t => t.stop()); return true; } catch (e) { return false; }
    },
    async open(video, canvas, facing) {
      this.video = video; this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.facing = facing || this.facing;
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.facing, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      video.srcObject = this.stream; video.muted = true; video.playsInline = true; await video.play();
      this.running = true; this._loop();
      this.loadModel();
    },
    async flip() { this.facing = this.facing === 'user' ? 'environment' : 'user'; if (this.video) await this.open(this.video, this.canvas, this.facing); },
    async loadModel() {
      if (this.landmarker || this.loading) return;
      this.loading = true;
      try {
        const vision = await import(`${MP_URL}/vision_bundle.mjs`);
        const fs = await vision.FilesetResolver.forVisionTasks(`${MP_URL}/wasm`);
        const opts = d => ({ baseOptions: { modelAssetPath: MODEL, delegate: d }, runningMode: 'VIDEO', numPoses: 1, minPoseDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        try { this.landmarker = await vision.PoseLandmarker.createFromOptions(fs, opts('GPU')); }
        catch (e) { this.landmarker = await vision.PoseLandmarker.createFromOptions(fs, opts('CPU')); }
      } catch (e) { this.offline = true; console.warn('Pose model unavailable', e); }
      this.loading = false;
    },
    setExercise(camType, title) { this.analyzer = makeAnalyzer(camType || 'generic'); this.camType = camType; this.hud.title = title || ''; this.goodSince = 0; },
    _loop() {
      if (!this.running) return;
      const v = this.video, c = this.canvas, ctx = this.ctx;
      if (v.readyState >= 2) {
        const vw = v.videoWidth, vh = v.videoHeight;
        if (c.width !== vw) { c.width = vw; c.height = vh; }
        const mirror = this.facing === 'user';
        ctx.save(); if (mirror) { ctx.translate(vw, 0); ctx.scale(-1, 1); }
        ctx.drawImage(v, 0, 0, vw, vh); ctx.restore();
        let lm = null;
        if (this.landmarker) {
          try { const r = this.landmarker.detectForVideo(v, performance.now()); lm = r.landmarks && r.landmarks[0]; } catch (e) { }
        }
        this.lm = lm;
        if (lm) this._drawSkel(lm, vw, vh, mirror);
        if (this.analyzer && this.landmarker) {
          const r = this.analyzer(lm);
          const now = performance.now();
          if (r.rep && this.onRep) this.onRep(r);
          if (r.fb && (r.fb !== this.lastFbKey || now - this.lastFbT > 2500)) { this.lastFbKey = r.fb; this.lastFbT = now; this.onFb && this.onFb(r.fb, r.good); }
          if (this.camType === 'plank') { if (r.good) { if (!this.goodSince) this.goodSince = now; this.onHold && this.onHold(true); } else { this.goodSince = 0; this.onHold && this.onHold(false); } }
          this._good = r.good;
        }
        this._drawHud(vw, vh);
      }
      requestAnimationFrame(() => this._loop());
    },
    _drawSkel(lm, w, h, mirror) {
      const ctx = this.ctx, X = p => (mirror ? 1 - p.x : p.x) * w, Y = p => p.y * h;
      ctx.lineWidth = Math.max(3, w / 160); ctx.lineCap = 'round';
      ctx.strokeStyle = this._good === false ? '#ff5a3c' : '#c6ff3d';
      EDGES.forEach(([a, b]) => { if (vis(lm[a]) > 0.3 && vis(lm[b]) > 0.3) { ctx.beginPath(); ctx.moveTo(X(lm[a]), Y(lm[a])); ctx.lineTo(X(lm[b]), Y(lm[b])); ctx.stroke(); } });
      ctx.fillStyle = '#fff';
      [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(i => { if (vis(lm[i]) > 0.3) { ctx.beginPath(); ctx.arc(X(lm[i]), Y(lm[i]), Math.max(3, w / 140), 0, 7); ctx.fill(); } });
    },
    _drawHud(w, h) {
      const ctx = this.ctx, s = w / 640;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, w, 44 * s);
      ctx.fillStyle = '#c6ff3d'; ctx.font = `700 ${22 * s}px "Bebas Neue", Impact, sans-serif`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText('ASCENSO · ' + (this.hud.title || ''), 12 * s, 22 * s);
      if (this.hud.count) { ctx.textAlign = 'right'; ctx.font = `700 ${36 * s}px "Bebas Neue", Impact, sans-serif`; ctx.fillStyle = '#fff'; ctx.fillText(this.hud.count, w - 12 * s, 24 * s); }
      if (this.rec && this.rec.state === 'recording') { ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(w - 20 * s, h - 20 * s, 8 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.font = `600 ${16 * s}px sans-serif`; ctx.fillText('REC', w - 34 * s, h - 20 * s); }
      if (this.hud.fb) { ctx.textAlign = 'center'; ctx.font = `700 ${24 * s}px "Bebas Neue", Impact, sans-serif`; const tw = ctx.measureText(this.hud.fb).width + 24 * s; ctx.fillStyle = this._good === false ? 'rgba(255,90,60,.9)' : 'rgba(198,255,61,.9)'; ctx.fillRect(w / 2 - tw / 2, h - 52 * s, tw, 36 * s); ctx.fillStyle = '#0b0f0a'; ctx.fillText(this.hud.fb, w / 2, h - 34 * s); }
      ctx.textAlign = 'left'; ctx.font = `600 ${12 * s}px sans-serif`; ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fillText('SUBID DE CATEGORÍA · SUBID LA EXIGENCIA', 12 * s, h - 12 * s);
    },
    startRec() {
      if (!this.canvas || !window.MediaRecorder) return false;
      const vs = this.canvas.captureStream(30);
      const tracks = [...vs.getVideoTracks()];
      if (G.Music && Music.recDest) tracks.push(...Music.recDest.stream.getAudioTracks());
      const ms = new MediaStream(tracks);
      const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const type = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
      this.chunks = [];
      this.rec = new MediaRecorder(ms, type ? { mimeType: type, videoBitsPerSecond: 2500000 } : undefined);
      this.rec.ondataavailable = e => e.data.size && this.chunks.push(e.data);
      this.rec.start(1000);
      return true;
    },
    stopRec() {
      return new Promise(res => {
        if (!this.rec || this.rec.state !== 'recording') return res(null);
        this.rec.onstop = () => { const type = this.rec.mimeType || 'video/webm'; res(new Blob(this.chunks, { type })); };
        this.rec.stop();
      });
    },
    close() {
      this.running = false;
      if (this.rec && this.rec.state === 'recording') this.rec.stop();
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  };
  Cam._analyzer = makeAnalyzer;
  G.Cam = Cam;
})(window);
