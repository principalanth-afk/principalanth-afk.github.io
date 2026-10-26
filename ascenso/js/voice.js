/* ASCENSO — Voz: conteo de repeticiones y ánimo (Web Speech API) */
(function (G) {
  'use strict';
  const S = window.speechSynthesis;
  const Voice = {
    on: true, voice: null, rate: 1.08,
    pick() {
      if (!S) return;
      const lang = I18N.lang === 'en' ? 'en' : 'es';
      const vs = S.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith(lang));
      const pref = lang === 'es' ? ['es-419', 'es-US', 'es-MX', 'es-VE', 'es-ES'] : ['en-US', 'en-GB'];
      this.voice = null;
      for (const p of pref) { const v = vs.find(x => x.lang.replace('_', '-').toLowerCase() === p.toLowerCase()); if (v) { this.voice = v; break; } }
      if (!this.voice) this.voice = vs.find(v => /google|natural|premium|enhanced/i.test(v.name)) || vs[0] || null;
    },
    say(text, opt) {
      if (!this.on || !S || !text) return;
      const o = opt || {};
      if (o.interrupt) S.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = I18N.lang === 'en' ? 'en-US' : 'es-ES';
      if (this.voice) { u.voice = this.voice; u.lang = this.voice.lang; }
      u.rate = o.rate || this.rate; u.pitch = o.pitch || 1; u.volume = 1;
      u.onstart = () => G.Music && Music.setDuck(0.35);
      u.onend = u.onerror = () => { if (!S.speaking) G.Music && Music.setDuck(1); };
      S.speak(u);
    },
    count(n) { this.say(String(n), { interrupt: true, rate: 1.25, pitch: 1.05 }); },
    stop() { S && S.cancel(); G.Music && Music.setDuck(1); },
    supported: !!S
  };
  if (S) { Voice.pick(); S.onvoiceschanged = () => Voice.pick(); }
  G.Voice = Voice;
})(window);
