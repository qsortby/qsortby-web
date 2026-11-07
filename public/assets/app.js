/* QSortby — marketing site · shared scripts */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* reveal-on-scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .14 });
  document.querySelectorAll('.rv').forEach(function (el, i) { el.style.transitionDelay = ((i % 3) * 70) + 'ms'; io.observe(el); });

  /* sticky header hairline on scroll */
  var hdr = document.querySelector('header.site');
  if (hdr) {
    var scrolled = false, ticking = false;
    var apply = function () { ticking = false; var s = window.scrollY > 16; if (s !== scrolled) { scrolled = s; hdr.classList.toggle('scrolled', s); } };
    var onS = function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
    requestAnimationFrame(apply);
    addEventListener('scroll', onS, { passive: true });
  }

  /* mobile menu — class toggle only, with overlay + a11y */
  var mb = document.querySelector('.menu-btn');
  var ov = document.querySelector('.nav-overlay');
  var links = document.querySelector('.nav-links');
  if (mb && links) {
    var setMenu = function (open) {
      document.body.classList.toggle('nav-open', open);
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    mb.addEventListener('click', function () { setMenu(!document.body.classList.contains('nav-open')); });
    if (ov) ov.addEventListener('click', function () { setMenu(false); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    var mq = window.matchMedia('(min-width:1024px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (e) { if (e.matches) setMenu(false); });
  }

  /* "Features" nav dropdown — click to toggle, same on every breakpoint;
     closes on an outside click or Escape. */
  document.querySelectorAll('.nav-menu').forEach(function (menu) {
    var trg = menu.querySelector('.nav-menu-btn');
    if (!trg) return;
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      trg.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    trg.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!menu.classList.contains('open'));
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  });

  /* help launcher (components/HelpLauncher.astro) — our button in place of
     the QOne widget's, which Base.astro loads with data-hidden. The widget
     arrives async and mounts only once its config has loaded, so poll for it
     (every 0.5s, up to 20s) and show the chat item once it has mounted. */
  var help = document.querySelector('.help');
  if (help) {
    var hb = help.querySelector('.help-btn');
    var badge = help.querySelector('.help-badge');
    var hint = help.querySelector('.help-hint');
    var hint0 = hint.textContent;
    var setHelp = function (open) {
      help.classList.toggle('open', open);
      hb.setAttribute('aria-expanded', open ? 'true' : 'false');
      hb.setAttribute('aria-label', open ? 'Close help menu' : 'Help and support');
    };
    help.hidden = false;
    hb.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !help.classList.contains('open');
      // The chat panel opens right above this button, so a click here while
      // it is up means "back to the menu": close the chat first. The widget
      // reports no open/close state to track, and close() on a panel that is
      // already closed changes nothing.
      if (open && window.QOneDesk) window.QOneDesk.close();
      setHelp(open);
    });
    document.addEventListener('click', function (e) { if (!help.contains(e.target)) setHelp(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && help.classList.contains('open')) { setHelp(false); hb.focus(); }
    });
    help.querySelector('.help-item').addEventListener('click', function () {
      setHelp(false);
      if (window.QOneDesk) window.QOneDesk.open();
    });
    var tries = 0, hooked = false;
    var poll = setInterval(function () {
      var desk = window.QOneDesk;
      if (desk && !hooked) {
        hooked = true;
        desk.on('unread', function (n) {
          n = typeof n === 'number' ? n : 0;
          badge.hidden = !n;
          badge.textContent = n > 9 ? '9+' : n;
          hint.textContent = n ? 'a reply is waiting for you' : hint0;
        });
      }
      // The host is display:none when a visitor has switched the widget off
      // (?qone-feedback=off), and then the chat cannot open.
      var host = document.querySelector('[data-qone-feedback]');
      if (host && host.style.display !== 'none') help.classList.add('ready');
      if (help.classList.contains('ready') || ++tries > 40) clearInterval(poll);
    }, 500);
  }

  /* ============ LIVE RANKING TABLE ============
     Rows are absolutely positioned inside #js-board; we translateY each to its
     rank slot so a reorder slides rows past one another (Linear-quiet motion). */
  var board = document.getElementById('js-board');
  var shot = document.getElementById('appshot');
  if (board) {
    var rowEls = Array.prototype.slice.call(board.querySelectorAll('.lrow'));
    var ROW_H = rowEls.length ? Math.round(rowEls[0].getBoundingClientRect().height) || 56 : 56;
    var model = rowEls.map(function (el) {
      return { el: el, sold: parseInt(el.getAttribute('data-sold'), 10), rate: parseFloat(el.getAttribute('data-rate')), rank: 0 };
    });
    board.style.height = (model.length * ROW_H) + 'px';

    var layout = function (isInit) {
      var maxSold = Math.max.apply(null, model.map(function (m) { return m.sold; })) || 1;
      var order = model.slice().sort(function (a, b) { return b.sold - a.sold; });
      order.forEach(function (m, i) {
        var newRank = i + 1, prev = m.rank || newRank;
        m.el.style.transform = 'translateY(' + (i * ROW_H) + 'px)';
        m.el.classList.toggle('lead', i === 0);
        var rk = m.el.querySelector('.lr-rank'); if (rk) rk.textContent = (newRank < 10 ? '0' : '') + newRank;
        var sold = m.el.querySelector('.lr-sold'); if (sold) sold.textContent = m.sold;
        var sub = m.el.querySelector('.lr-sub'); if (sub && m.sold > 0) sub.textContent = m.sold + ' sold · 24h';
        var bar = m.el.querySelector('.lr-bar i'); if (bar) bar.style.width = Math.round((m.sold / maxSold) * 100) + '%';
        if (!isInit) {
          var d = prev - newRank, de = m.el.querySelector('.lr-delta');
          if (de && m.rate > 0) {
            if (d > 0) { de.className = 'lr-delta up flash'; de.textContent = '▲' + d; }
            else if (d < 0) { de.className = 'lr-delta dn flash'; de.textContent = '▼' + (-d); }
            else { de.className = 'lr-delta flat'; de.textContent = '–'; }
            if (d !== 0) setTimeout(function () { de.classList.remove('flash'); }, 950);
          }
        }
        m.rank = newRank;
      });
    };

    layout(true); /* paint authored order; keep the HTML-authored deltas + bars */

    var tick = function () {
      model.forEach(function (m) { m.sold += Math.round(m.rate * (0.6 + Math.random() * 0.9)); });
      layout(false);
    };

    var started = false;
    var lo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (shot) shot.classList.add('in');
          if (!started && !reduce) { started = true; setInterval(tick, 2400); }
          lo.unobserve(e.target);
        }
      });
    }, { threshold: .25 });
    lo.observe(shot || board);
  }

  /* contact form — AJAX submit to Netlify (no reload). Native POST to
     action="/thank-you" stays the no-JS fallback. */
  var cf = document.getElementById('brief-form');
  if (cf) {
    var st = document.getElementById('form-status');
    var msg = {
      sending: cf.getAttribute('data-msg-sending') || 'Sending…',
      ok: cf.getAttribute('data-msg-ok') || 'Thanks — we got your message.',
      err: cf.getAttribute('data-msg-err') || 'Could not send right now — email hello@qdn.vn.'
    };
    var say = function (m, cls) { if (st) { st.textContent = m; st.className = 'form-status' + (cls ? ' ' + cls : ''); } };
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(cf);
      var btn = cf.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      say(msg.sending);
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); cf.reset(); say(msg.ok, 'ok'); })
        .catch(function () { say(msg.err, 'err'); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  }

  })();
