/** Shared site constants. */
export const SITE_NAME = "QSortby";
// The brand tagline (brand guideline 2026-11, p.02/13): the header and hero
// use it verbatim, the closing dot is always brand green, and it is never
// translated. The old line — "Every sort has to prove it made you money." —
// was an outcome claim; it is also why docs/APP_STORE_LISTING.md in the app
// repo forbade reusing the site's tagline in the listing. This one is a
// capability, so the same sentence can open the listing's intro.
// 2026-11-07, owner's call: the guideline's "Auto-sort, then upsell." said
// nothing about the AI the product is sold on, and "Sort by sales. Upsell by
// AI." read as someone else's line. "Sort smarter. Sell more." is the tail of
// the hero the site ran with for months, kept because it is already the
// product's own voice, with the AI named in the second clause. Both dots are
// brand green. Update the guideline (p.02/13) to match.
export const TAGLINE = "Sort smarter. Sell more with AI.";

// Live App Store listing. Every primary CTA on the site points here.
export const APP_STORE_URL = "https://apps.shopify.com/qsortby";

// Booking runs on our own QOne Desk embed, loaded once in Base.astro. Every
// "Book a demo" is a plain link that the widget intercepts to open the calendar
// in a modal — see components/BookDemo.astro.
//
// DEMO_URL is therefore both the no-JS fallback and what a cmd-click or a
// copied link resolves to, so it has to stay a real page: it's the server-
// rendered booking page for the same event, not a marketing URL.
export const DEMO_URL = "https://qdn.qone.work/desk/qsortby/book/demo";
export const DEMO_SCRIPT_URL = "https://qdn.qone.work/book.js";
// Test mode swaps in the product's test key, which books against the same
// event without touching the real calendar. On automatically in `astro dev`;
// PUBLIC_DEMO_TEST=1 forces it on for a production build, so `npm run preview`
// can be clicked through safely (it serves on the same port dev does, and the
// live key is allow-listed there — without this it would book for real).
const DEMO_TEST_MODE =
  import.meta.env.DEV || import.meta.env.PUBLIC_DEMO_TEST === "1";
export const DEMO_PRODUCT_KEY = DEMO_TEST_MODE
  ? "pk_test_890b77deb4f206bde3e28fc1"
  : "fp_ab49994270d17cd686485bfd";
export const DEMO_EVENT = "demo";

// Support chat — the same QOne Desk product (and the same key above), loaded
// once in Base.astro with its own launcher hidden; components/HelpLauncher is
// the button that opens it. Which corner the chat panel opens in is a Desk
// setting: keep it bottom-right, above our launcher. The 20px offset is pinned
// on the script tag. Same host as book.js: the widget takes its API origin
// from its own src, so it has to stay on qdn.
export const SUPPORT_WIDGET_URL = "https://qdn.qone.work/widget.js";

// User guide — canonical page lives at /guide; also served on the guide.qsortby.com
// subdomain (same Netlify site, see netlify.toml). Point links at the subdomain.
export const GUIDE_URL = "https://guide.qsortby.com";

// Single inbox for support, demo and contact. Every mailto:, the
// Organization schema in Base.astro and the contact-form failure message
// all read from HERE — never hard-code an address anywhere else.
export const SUPPORT_EMAIL = "hello@qdn.vn";

// Primary nav.
export const NAV = [
  ["/integrations", "Integrations"],
  ["/pricing", "Pricing"],
  ["/faqs", "FAQs"],
  [GUIDE_URL, "Guide"],
] as const;

// "Features" nav dropdown — one page per pillar, same three jobs the "What
// you get" tabs on the homepage (components/Offer.astro) already describe.
// Order matches the buying journey those tabs use: merchandise the
// collection, personalize it per shopper, then upsell around the purchase.
// Intent AI comes last: it is not a fourth job but the reading the last two
// act on, explained end to end on its own page.
export const FEATURES_NAV = [
  ["/features/merchandising", "Merchandising"],
  ["/features/personalization", "Personalization"],
  ["/features/upsell-blocks", "Upsell AI"],
  ["/features/intent-ai", "Intent AI"],
] as const;

// Cloudflare Web Analytics — cookieless, free page-view analytics.
// Token comes from Cloudflare dashboard → Analytics & Logs → Web Analytics →
// Add a site → qsortby.com → "Manage site" → the JS snippet's `"token":"…"`.
// Empty string = the beacon is not rendered at all. Only loads in production
// builds, so `astro dev` and local previews don't pollute the numbers.
export const CF_ANALYTICS_TOKEN = "030c6ca788604ff09ba075e968f569d4";

// Home-page intro video on YouTube (components/IntroVideo.astro). Just the ID —
// the part after `watch?v=`. Changing the video? Also re-download its poster;
// the command is in the component's header comment.
export const INTRO_VIDEO_ID = "9XvEiozgzcY";

// Google Analytics 4 — property "QSortby", web stream qsortby.com.
// Loaded only in production builds (Base.astro), with Consent Mode v2:
// cookies stay off for EU/EEA/UK/CH visitors until they accept the banner.
// Click tracking (install_click, demo_open, demo_booked, video_play) lives in
// public/assets/analytics.js. Empty string = GA is not loaded at all.
export const GA_MEASUREMENT_ID = "G-TRN9BZGJ5R";
