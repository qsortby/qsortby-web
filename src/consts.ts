/** Shared site constants. */
export const SITE_NAME = "QSortby";
export const TAGLINE = "Every sort has to prove it made you money.";

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
  ["/features/upsell-blocks", "Upsell blocks"],
  ["/features/intent-ai", "Intent AI"],
] as const;

// Cloudflare Web Analytics — cookieless, free page-view analytics.
// Token comes from Cloudflare dashboard → Analytics & Logs → Web Analytics →
// Add a site → qsortby.com → "Manage site" → the JS snippet's `"token":"…"`.
// Empty string = the beacon is not rendered at all. Only loads in production
// builds, so `astro dev` and local previews don't pollute the numbers.
export const CF_ANALYTICS_TOKEN = "030c6ca788604ff09ba075e968f569d4";
