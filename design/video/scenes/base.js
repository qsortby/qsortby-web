// Shared scene runtime. render.mjs injects window.__SUB = { text, words:[{w,t}] } before
// load, then calls window.__start() once fonts are ready and the recording is rolling.
(function () {
  const ICONS = {
    collection: '<path d="M4 6h16M4 12h10M4 18h7"/>',
    bought: '<rect x="3" y="7" width="7" height="7" rx="1.5"/><rect x="14" y="7" width="7" height="7" rx="1.5"/><path d="M10 10.5h4"/>',
    cart: '<path d="M6 8h12l-1 11H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    popup: '<rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 20h8"/>',
    checkout: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    thankyou: '<path d="M20 7l-10 10-5-5"/>',
  };
  const STEPS = [['collection', 'Collection'], ['bought', 'Bought with'], ['cart', 'Cart'], ['popup', 'Popup'], ['checkout', 'Checkout'], ['thankyou', 'Thank you']];
  window.stepper = function (active, aov, plus) {
    const el = document.createElement('div'); el.className = 'stepper in d0';
    const check = '<path d="M20 7l-10 10-5-5"/>';
    const steps = STEPS.map(([k, l], i) => `<div class="s ${i < active ? 'done' : i === active ? 'on' : ''}"><span class="dot"><svg viewBox="0 0 24 24">${i < active ? check : ICONS[k]}</svg></span><span class="l">${l}</span></div>`).join('');
    // rail fill: from the first dot to the current one (the previous one at load, so it is seen advancing)
    const p = Math.max(0, Math.min(1, active / (STEPS.length - 1)));
    const p0 = Math.max(0, Math.min(1, (active - 1) / (STEPS.length - 1)));
    el.innerHTML = `<div class="rail" style="--p:${p0}">${steps}</div>` + (aov ? `<div class="aov"><i></i>${aov}${plus ? `<span class="plus">${plus}</span>` : ''}</div>` : '');
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.querySelector('.rail').style.setProperty('--p', p); }));
  };
  document.addEventListener('DOMContentLoaded', () => { const m = document.createElement('div'); m.id = 'qs-mark'; document.body.appendChild(m); });
  window.watermark = function () { const w = document.createElement('div'); w.className = 'wm'; w.innerHTML = '<i></i>QSORTBY'; document.body.appendChild(w); };

  // Subtitle: every word has a start time; words appear as they are spoken, the
  // newest one in green (the old cut's treatment). Breaks on sentence end so a
  // long line never runs past two rows.
  // Tempo: every CSS animation and every scene timer runs at __SPEED× (script.json
  // `speed`, per scene or global). Scenes are authored at 1×; the render decides
  // how brisk the cut is without touching nineteen files.
  window.after = (fn, ms) => setTimeout(fn, ms / (window.__SPEED || 1)); // setTimeout, at tempo
  window.__start = function () {
    document.body.classList.add('go');
    const t0 = performance.now();
    const S = window.__SPEED || 1;
    if (S !== 1) document.getAnimations().forEach((a) => { a.playbackRate = S; });
    if (typeof window.onStart === 'function') window.onStart();
    const sub = window.__SUB;
    if (!sub || !sub.words || !sub.words.length) return;
    const box = document.createElement('div'); box.className = 'sub';
    const t = document.createElement('div'); t.className = 't'; box.appendChild(t);
    const spans = sub.words.map((w) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w.w + ' '; t.appendChild(s); return s; });
    document.body.appendChild(box);
    let last = -1;
    (function tick() {
      const now = (performance.now() - t0) / 1000;
      let i = -1; while (i + 1 < sub.words.length && sub.words[i + 1].t <= now) i++;
      if (i !== last) { spans.forEach((s, j) => { s.classList.toggle('on', j <= i); s.classList.toggle('now', j === i); }); last = i; }
      requestAnimationFrame(tick);
    })();
  };
})();
