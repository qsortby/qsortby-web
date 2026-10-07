/* QSortby — marketing site · analytics
 *
 * 1. Click tracking (GA4 events), by one delegated listener so no CTA markup
 *    has to carry tracking attributes:
 *      install_click  any link to the Shopify App Store listing
 *      demo_open      any "Book a demo" trigger ([data-qone-book])
 *      demo_booked    the QOne Desk widget confirms a booking
 *      video_play     the home-page intro video is started (IntroVideo.astro
 *                     calls window.qsTrack)
 *    Each click carries `cta_location` (header, hero, pricing_plan, final_cta,
 *    sticky_bar, footer, section) and, on pricing cards, `cta_plan`.
 *    To report on these in GA: Admin → Custom definitions → create
 *    event-scoped dimensions `cta_location` and `cta_plan`.
 *
 * 2. UTM tags on every App Store link, so the listing's own analytics (and GA4
 *    on the listing) know which page and which button sent the visitor.
 *
 * 3. Cookie banner for visitors whose time zone is in Europe. GA itself uses
 *    Consent Mode (Base.astro): in the EEA/UK/CH, analytics cookies stay off
 *    until "Accept". The choice is kept in localStorage `qs-consent`; the
 *    footer's "Cookie settings" link reopens the banner.
 *
 * Every event call is a no-op when gtag is absent (dev builds, GA disabled).
 */
(function () {
  var STORE = 'https://apps.shopify.com/qsortby';

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  window.qsTrack = track;

  function locate(el) {
    if (el.closest('header.site')) return { cta_location: 'header' };
    if (el.closest('.stickycta')) return { cta_location: 'sticky_bar' };
    if (el.closest('footer.site')) return { cta_location: 'footer' };
    var plan = el.closest('.plan');
    if (plan) {
      var tag = plan.querySelector('.ptag');
      return { cta_location: 'pricing_plan', cta_plan: tag ? tag.textContent.trim() : '' };
    }
    if (el.closest('.cta')) return { cta_location: 'final_cta' };
    if (el.closest('.hero, .phero')) return { cta_location: 'hero' };
    return { cta_location: 'section' };
  }

  function isStore(a) {
    return a && a.href && a.href.indexOf(STORE) === 0;
  }

  /* UTM tags. Rewritten at load rather than baked into 28 call sites; without
     JS the plain listing URL still works. */
  function tagLinks() {
    var page = location.pathname.replace(/\/+$/, '') || '/';
    document.querySelectorAll('a[href^="' + STORE + '"]').forEach(function (a) {
      try {
        var u = new URL(a.href);
        if (u.searchParams.has('utm_source')) return;
        var loc = locate(a);
        u.searchParams.set('utm_source', 'qsortby.com');
        u.searchParams.set('utm_medium', 'website');
        u.searchParams.set('utm_campaign', page === '/' ? 'home' : page.slice(1).replace(/\//g, '_'));
        u.searchParams.set('utm_content', loc.cta_location + (loc.cta_plan ? '_' + loc.cta_plan.toLowerCase() : ''));
        a.href = u.toString();
      } catch (e) {}
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-qone-book')) {
      track('demo_open', locate(a));
    } else if (isStore(a)) {
      var p = locate(a);
      p.link_text = (a.textContent || '').trim().slice(0, 40);
      track('install_click', p);
    }
  }, true);

  /* QOne Desk confirms bookings through its own event API. book.js loads
     async; async scripts finish before window `load`, so hook there. */
  function hookBooking() {
    if (window.QOneBook && typeof window.QOneBook.on === 'function') {
      window.QOneBook.on('booked', function () { track('demo_booked'); });
      return true;
    }
    return false;
  }
  if (!hookBooking()) window.addEventListener('load', hookBooking);

  /* ── cookie banner ─────────────────────────────────────────── */
  var KEY = 'qs-consent';
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function inEurope() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return /^Europe\//.test(tz) || /^Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)$/.test(tz);
    } catch (e) { return false; }
  }
  function decide(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: v });
    var b = document.getElementById('qs-consent');
    if (b) b.remove();
  }
  function banner() {
    if (document.getElementById('qs-consent')) return;
    var b = document.createElement('div');
    b.id = 'qs-consent';
    b.className = 'consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML =
      '<p>We use cookies to measure how this site is used, never for ads. ' +
      '<a href="/privacy">Privacy</a></p>' +
      '<div class="consent-btns">' +
      '<button type="button" class="btn btn-line" data-v="denied">Decline</button>' +
      '<button type="button" class="btn btn-accent" data-v="granted">Accept</button>' +
      '</div>';
    b.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (v) decide(v);
    });
    document.body.appendChild(b);
  }
  window.qsConsent = { open: banner };

  function init() {
    tagLinks();
    if (!stored() && inEurope()) banner();
    document.querySelectorAll('[data-consent-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); banner(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
