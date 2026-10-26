/* ASCENSO — Música de gimnasio generada en vivo (Web Audio API)
   Sin archivos ni derechos de autor: cada estilo se sintetiza en tiempo real.
   El reloj de la música es el metrónomo del atleta animado y del conteo. */
(function (G) {
  'use strict';
  const STYLES = {
    house: { bpm: 124, es: 'Gym House', en: 'Gym House' },
    phonk: { bpm: 128, es: 'Phonk', en: 'Phonk' },
    techno: { bpm: 132, es: 'Hard Techno', en: 'Hard Techno' },
    drill: { bpm: 140, es: 'Drill / Trap', en: 'Drill / Trap' }
  };
  const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10] };
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  class Engine {
    constructor() {
      this.ctx = null; this.style = 'house'; this.on = true; this.vol = 0.7;
      this.playing = false; this.step = 0; this.nextT = 0; this.t0 = 0; this.timer = null; this.bar = 0;
      this.duck = 1; this.prog = 0;
    }
    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = this.on ? this.vol : 0;
      this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -14; this.comp.ratio.value = 4; this.comp.attack.value = 0.003; this.comp.release.value = 0.2;
      this.pump = c.createGain(); // sidechain
      this.pump.connect(this.comp); this.comp.connect(this.master); this.master.connect(c.destination);
      this.drums = c.createGain(); this.drums.connect(this.comp);
      try { this.recDest = c.createMediaStreamDestination(); this.master.connect(this.recDest); } catch (e) { this.recDest = null; }
      this.noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.dist = c.createWaveShaper(); const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 3.2); } this.dist.curve = curve;
      this.dist.connect(this.drums);
    }
    get bpm() { return STYLES[this.style].bpm; }
    resume() { this.init(); if (this.ctx.state === 'suspended') this.ctx.resume(); }
    setStyle(s) { if (STYLES[s]) { const b = this.beat(); this.style = s; if (this.playing) { this.t0 = this.ctx.currentTime - b * 60 / this.bpm; } } }
    setOn(v) { this.on = v; this._applyVol(); }
    setVol(v) { this.vol = v; this._applyVol(); }
    setDuck(d) { this.duck = d; this._applyVol(0.15); }
    _applyVol(tc) { if (!this.master) return; const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.setTargetAtTime(this.on ? this.vol * this.duck : 0, t, tc || 0.05); }
    start() {
      this.resume(); if (this.playing) return;
      this.playing = true; this.step = 0; this.bar = 0;
      this.t0 = this.ctx.currentTime + 0.08; this.nextT = this.t0;
      this.timer = setInterval(() => this._sched(), 25); this._sched();
    }
    stop() { this.playing = false; clearInterval(this.timer); this.timer = null; }
    now() { return this.ctx ? this.ctx.currentTime : performance.now() / 1000; }
    beat() { return this.playing ? (this.ctx.currentTime - this.t0) * this.bpm / 60 : 0; }
    _sched() {
      const c = this.ctx; const spb = 60 / this.bpm / 4;
      while (this.nextT < c.currentTime + 0.12) {
        this._play(this.step, this.nextT, spb);
        this.nextT += spb; this.step++;
        if (this.step % 16 === 0) this.bar++;
      }
    }
    // ---------- instrumentos ----------
    kick(t, dec, punch, toDist) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(punch || 150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(1.0, t); g.gain.exponentialRampToValueAtTime(0.001, t + (dec || 0.32));
      o.connect(g); g.connect(toDist ? this.dist : this.drums); o.start(t); o.stop(t + (dec || 0.32) + 0.05);
      // sidechain
      const p = this.pump.gain; p.cancelScheduledValues(t); p.setValueAtTime(0.25, t); p.linearRampToValueAtTime(1, t + 0.18);
    }
    noise(t, dur, freq, type, vol, q) {
      const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noiseBuf; f.type = type || 'highpass'; f.frequency.value = freq; if (q) f.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.drums); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    clap(t, v) { [0, 0.012, 0.024].forEach(d => this.noise(t + d, 0.12, 1400, 'bandpass', (v || 0.5), 1.2)); }
    snare(t, v) { this.noise(t, 0.18, 1800, 'bandpass', v || 0.6, 0.8); const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.1); g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.connect(g); g.connect(this.drums); o.start(t); o.stop(t + 0.15); }
    hat(t, open, v) { this.noise(t, open ? 0.18 : 0.04, 8000, 'highpass', v || 0.18); }
    tone(t, f, dur, type, vol, dest, cutoff, slideTo) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
      o.type = type; o.frequency.setValueAtTime(f, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur * 0.6);
      fl.type = 'lowpass'; fl.frequency.setValueAtTime(cutoff || 2000, t); fl.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(fl); fl.connect(g); g.connect(dest || this.pump); o.start(t); o.stop(t + dur + 0.05);
      return fl;
    }
    cowbell(t, f, v) {
      [1, 1.48].forEach(m => this.tone(t, f * m, 0.22, 'square', (v || 0.05), this.pump, 3200));
    }
    _chordRoot() { const prog = [0, -4, -2, -5]; return prog[Math.floor(this.bar / 2) % 4]; }
    _play(st, t, spb) {
      const s = st % 16, root = 45 + this._chordRoot(); // A minor family
      const sc = SCALES.minor;
      switch (this.style) {
        case 'house': {
          if (s % 4 === 0) this.kick(t, 0.3, 140);
          if (s % 4 === 2) this.hat(t, true, 0.14);
          if (s === 4 || s === 12) this.clap(t, 0.45);
          if (s % 2 === 1) this.hat(t, false, 0.06);
          if (s % 4 === 2) this.tone(t, midi(root + 12 * (s === 10 ? 1 : 0)), spb * 1.8, 'sawtooth', 0.16, this.pump, 700);
          if (s === 3 || s === 11) [0, 3, 7].forEach(i => this.tone(t, midi(root + 24 + i), spb * 1.5, 'sawtooth', 0.045, this.pump, 2600));
          if (this.bar % 4 === 3 && s >= 12) this.noise(t, spb, 3000 + (s - 12) * 1500, 'bandpass', 0.08, 2);
          break;
        }
        case 'phonk': {
          const k = [0, 3, 6, 10, 11];
          if (k.includes(s)) { this.kick(t, 0.5, 90, true); this.tone(t, midi(root - 12), spb * 3, 'sine', 0.55, this.dist, 400, s === 10 ? midi(root - 14) : null); }
          if (s === 8) this.snare(t, 0.55);
          this.hat(t, false, s % 2 ? 0.05 : 0.09);
          if (this.bar % 2 === 1 && s >= 13) this.hat(t + spb / 2, false, 0.06);
          const mel = [0, null, 3, null, 5, null, 3, 7, null, 5, null, 3, 0, null, 10, null];
          const n = mel[s]; if (n != null) this.cowbell(t, midi(root + 24 + n), 0.045);
          break;
        }
        case 'techno': {
          if (s % 4 === 0) { this.kick(t, 0.42, 120, true); }
          if (s % 4 !== 0) this.tone(t, midi(root - 12), spb * 0.9, 'sine', 0.18, this.dist, 300);
          this.hat(t, s % 4 === 2, s % 4 === 2 ? 0.12 : 0.05);
          if (s === 4 || s === 12) this.clap(t, 0.32);
          const acid = [0, 0, 12, 0, 3, 0, 15, 7, 0, 12, 0, 10, 0, 3, 12, 5];
          const fl = this.tone(t, midi(root + 12 + acid[s]), spb * 0.95, 'sawtooth', 0.07, this.pump, 600);
          fl.frequency.setValueAtTime(400 + 2200 * (0.5 + 0.5 * Math.sin(this.bar * 0.7 + s * 0.4)), t);
          break;
        }
        case 'drill': {
          if (s === 0 || s === 7 || s === 10) { this.kick(t, 0.6, 80, true); this.tone(t, midi(root - 12), spb * 4, 'sine', 0.5, this.dist, 300, s === 10 ? midi(root - 11) : null); }
          if (s === 4 || s === 12) this.snare(t, 0.5);
          const hp = [0, 2, 3, 4, 6, 8, 10, 11, 12, 14]; if (hp.includes(s)) this.hat(t, false, 0.07);
          if (s === 15) { this.hat(t, false, 0.05); this.hat(t + spb / 3, false, 0.05); this.hat(t + 2 * spb / 3, false, 0.05); }
          if (s % 4 === 0) { const n = [0, 3, 7, 3][(s / 4 + this.bar) % 4]; this.tone(t, midi(root + 24 + n), spb * 3.5, 'triangle', 0.05, this.pump, 3000); }
          break;
        }
      }
      // pequeño "riser" cada 8 compases
      if (this.bar % 8 === 7 && s === 0) {
        const c = this.ctx, o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(1600, t + spb * 16);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + spb * 15); g.gain.linearRampToValueAtTime(0.0001, t + spb * 16);
        o.connect(g); g.connect(this.pump); o.start(t); o.stop(t + spb * 16);
      }
    }
    // efectos de UI
    blip(kind) {
      this.resume(); const c = this.ctx, t = c.currentTime;
      const map = { rep: [880, 0.06], done: [1320, 0.25], level: [660, 0.5], go: [990, 0.15], tick: [1500, 0.03] };
      const [f, d] = map[kind] || map.tick;
      const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle';
      o.frequency.setValueAtTime(f, t); if (kind === 'level' || kind === 'done') o.frequency.exponentialRampToValueAtTime(f * 2, t + d);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(c.destination); if (this.recDest) g.connect(this.recDest); o.start(t); o.stop(t + d + 0.05);
    }
  }

  G.Music = new Engine();
  G.Music.STYLES = STYLES;
})(window);
