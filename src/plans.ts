/**
 * Pricing — SINGLE SOURCE OF TRUTH for the marketing site.
 *
 * These four tiers must stay in sync with the app, which is the real authority:
 *   - prices          → apps/dashboard/app/shopify.server.ts (`billing`)
 *   - plan names      → apps/dashboard/app/lib/plans.ts
 *   - what's included → apps/api/src/lib/plan-features.ts (`DEFAULT_PLAN_FEATURES`)
 *   - spec + rationale → docs/PRICING.md  ← read this before changing anything here
 *
 * Two DIFFERENT trials exist; do not conflate them in copy:
 *   1. REVERSE_TRIAL_DAYS (10) — every new install runs on full Growth features,
 *      then auto-downgrades to Free. The app is never locked or turned off.
 *      This is the acquisition hook and belongs in the headline.
 *   2. Shopify's payment trial (10 days, see PAYMENT_TRIAL_DAYS) — only applies
 *      once a merchant picks a PAID plan; it's the window before the first
 *      charge. Billing detail, not a hook. This line said 7 for a while, which
 *      is what put a stale "7-day trial" into /terms — the app has always set
 *      `trialDays: 10`.
 */

/** Full-access window on install, before auto-downgrade to Free. */
export const REVERSE_TRIAL_DAYS = 10;
/**
 * Shopify Billing API trial on paid plans, before the first charge.
 *
 * Deliberately the SAME number as the reverse trial: the app sets
 * `trialDays: 10` on all three paid plans (apps/dashboard/app/shopify.server.ts)
 * so every merchant-facing surface quotes one figure. They still stack —
 * subscribing on day 10 of the reverse trial means free through day 20 — which
 * is why the two are separate constants rather than one.
 */
export const PAYMENT_TRIAL_DAYS = 10;

export interface Plan {
  /** Plan name as shown to merchants — matches ALL_PLAN_NAMES in the app. */
  name: string;
  /** Display price, USD/month. Free is a real $0 tier, not a trial. */
  price: string;
  /** Who it's for — one line, sits under the price. */
  desc: string;
  /**
   * Bullets. Keep to 8 max; anything longer belongs in the matrix.
   *
   * Track the App Store listing's "Top features" for the same plan — that's the
   * list a merchant most likely read first, and a site that says LESS than the
   * listing reads as an older, thinner version of the product. The quantified
   * lines (how many sort rules, how many upsells of a type) are the ones worth
   * carrying: they're what a merchant actually compares.
   *
   * ORDER MATTERS BEYOND READABILITY: the home-page teaser renders only the
   * first few (TEASER_BULLETS in pages/index.astro), so the leading bullets are
   * the ones most visitors ever see. Lead each tier with the thing that tier
   * adds, not with what it inherits.
   */
  features: string[];
  /** Ribbon text, or null. Only one plan should carry one. */
  badge?: string;
  /** true → render as the visually emphasised card. */
  feat?: boolean;
  /** CTA label. All four tiers are self-serve — nothing here needs a sales
   *  conversation, so every card installs rather than books. */
  cta: 'install' | 'demo';
}

export const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Real ranking, running forever. Not a trial.',
    features: [
      // Value first, allowance second — "1 managed collection" as the opening
      // line leads with the limit. Same phrasing as the listing.
      'Real-time best-sellers ranking, 1 collection',
      'Sold-out auto-demotion',
      'Keep paired products side by side',
      // The AOV surfaces start on Free deliberately: a merchant has to see an
      // upsell working before a tier that adds more of them means anything.
      'Cart upsell + free-shipping bar',
      'A/B testing + revenue attribution',
      // ─── below here: /pricing only, not the home teaser ───
      // A FLOOR, not a fixed window: `smart_sortby.minWindowDays: 7` on Free
      // (apps/api plan-features) stops a low-volume store picking a noisy
      // short window. Longer windows are fine on Free — don't write "7 days".
      '7-day minimum ranking window',
      // Ungated in the app: the Manual order tab and the before/after preview
      // carry no feature check, so they belong here rather than on Starter.
      'Manual order & before/after preview',
      'Shop-wide product exclusions',
    ],
    cta: 'install',
  },
  {
    name: 'Starter',
    price: '$29',
    desc: 'For stores ready to sort by more than one signal.',
    features: [
      'Everything in Free, 5 collections',
      'Personalized “For You” feed',
      'Bought-together + thank-you upsells',
      // Quantified limits, matching the listing. `personalize` grants
      // maxLogics: 3 / maxVisitorTypes: 5 on this plan — enforced, so it's safe
      // to print.
      '3 sort rules, 5 visitor types each',
      // ─── below here: /pricing only, not the home teaser ───
      '3 upsells of each type',
      'Per-category rankings',
      // No plan caps the window — the only entitlement is Free's 7-day FLOOR.
      // What Starter actually buys is the short end, plus calendar windows.
      'Short windows unlocked — from 1 hour',
      'Fixed windows — last week, a set month, any date range',
    ],
    cta: 'install',
  },
  {
    name: 'Pro',
    price: '$99',
    desc: 'For growing brands that want the numbers behind every sort.',
    features: [
      // Analytics and AI authoring are what Pro IS — they stay in the teaser's
      // four. The "unlimited …" lines are detail: they say more of the same
      // rather than something new, so they sit below the fold on /pricing.
      'Everything in Starter, unlimited',
      'Popup upsells + AND/OR display rules',
      'Customer events & analytics',
      'AI authoring — taxonomy + sort logic',
      // ─── below here: /pricing only, not the home teaser ───
      'Unlimited sort rules and visitor types',
      'Unlimited upsells of each type',
      'Config-version reporting — what each sort earned',
      // Was "Priority refresh & throughput" — nothing in the app schedules by
      // plan (cron interval is per-collection, 5 min floor for everyone). The
      // CSV export lives on the Analytics page, which is what `analytics`
      // gates, so it is a real Pro line.
      'Full report history & CSV export',
    ],
    badge: 'Most popular',
    feat: true,
    cta: 'install',
  },
  {
    name: 'Growth',
    price: '$199',
    desc: 'For stores that want a storefront tuned to each shopper.',
    features: [
      'Everything in Pro',
      'Live per-visitor personalization',
      // Says out loud that the AI reaches INTO the upsells. Without this line
      // Growth reads as "buy another AI feature" instead of "everything you
      // already run gets smarter".
      //
      // NAME THE FOUR. The re-rank is threaded through cart, popup, checkout
      // and thank-you only — the free-shipping bar picks on price band and FBT
      // on co-purchase pairs, so "every upsell" was wrong.
      'Personalized offers in cart, popup, checkout & thank-you',
      'In-checkout upsell (Shopify Plus)',
      // ─── below here: /pricing only, not the home teaser ───
      'Per-shopper real-time reranking',
      // The Intent tab: "When it peaks" (hour heatmap), "What shoppers came
      // for" (per-intent results) and the AI summary. Its journey section was
      // removed from the app — do not list it again.
      'Intent heatmap, per-intent results + AI summaries',
      // Was "Highest AI limits" — Pro and Growth carry IDENTICAL monthlyCalls /
      // dailyCalls (both unset). The real difference is that the session read
      // is applied rather than only logged.
      // NOT "every ranked surface": bought-together and the free-shipping bar
      // never re-rank by intent.
      'Intent reading applied, not only reported',
    ],
    badge: 'Most advanced',
    cta: 'install',
  },
];

/**
 * How many bullets the HOME-PAGE teaser shows per card. `/pricing` shows all of
 * them, so this number is the only thing that makes the two sections differ.
 *
 * It lives here rather than in pages/index.astro because it's a property of the
 * lists above: bullets 1..TEASER_BULLETS are the teaser, and every `features`
 * array is ordered with that boundary marked by a comment. Inserting a line
 * above the marker silently rewrites the home page — which is exactly what
 * happened when the quantified limits went in and pushed analytics and AI
 * authoring out of Pro's four.
 */
export const TEASER_BULLETS = 4;

// Build-time guard: every plan must have at least the teaser's worth of bullets,
// or a card renders short on the home page while looking complete on /pricing.
for (const p of PLANS) {
  if (p.features.length < TEASER_BULLETS) {
    throw new Error(
      `Plan "${p.name}" has ${p.features.length} bullets; the home teaser needs ${TEASER_BULLETS}.`,
    );
  }
}

/** Feature-comparison matrix. `cells` is [Free, Starter, Pro, Growth].
 *  '✓' / '—' render as yes/no marks; anything else renders as literal text. */
export const MATRIX: { label: string; cells: string[] }[] = [
  { label: 'Real-time best-sellers ranking', cells: ['✓', '✓', '✓', '✓'] },
  { label: 'Sold-out auto-demotion', cells: ['✓', '✓', '✓', '✓'] },
  { label: 'A/B testing + revenue attribution', cells: ['✓', '✓', '✓', '✓'] },
  { label: 'Klaviyo & Google Analytics', cells: ['✓', '✓', '✓', '✓'] },
  { label: 'Managed collections', cells: ['1', '5', 'Unlimited', 'Unlimited'] },
  // The ONLY window entitlement in the app is `smart_sortby.minWindowDays`, a
  // FLOOR, set to 7 on Free and unset everywhere else. There is no max-window
  // limit field at all, so no plan has a 30-day ceiling — the picker allows up
  // to 365 days on every tier. Don't reintroduce a range here.
  { label: 'Ranking window', cells: ['7 days min.', '1h – 365d', '1h – 365d', '1h – 365d'] },
  { label: 'Fixed / calendar windows', cells: ['—', '✓', '✓', '✓'] },
  { label: 'Personalized “For You” feed', cells: ['—', '✓', '✓', '✓'] },
  // The `personalize` caps (maxLogics / maxVisitorTypes in the app). These were
  // on the App Store listing but nowhere on the site, which made Starter look
  // thinner here than in the place most merchants read first.
  { label: 'Sort rules', cells: ['—', '3', 'Unlimited', 'Unlimited'] },
  { label: 'Visitor types per sort rule', cells: ['—', '5', 'Unlimited', 'Unlimited'] },
  { label: 'Per-category rankings', cells: ['—', '✓', '✓', '✓'] },
  // AOV surfaces. One surface is added per tier; the cap is on how many of ONE
  // kind you can run (a different cart offer in the drawer than on the cart
  // page). Keep in sync with DEFAULT_PLAN_FEATURES `upsell` in the app.
  //
  // CAREFUL with the "Upsells per type" row below: the app stores the cap PER
  // TYPE (`cart_max`, `fbt_max`, …), not as one shared number. Every type on a
  // given plan currently carries the same figure, which is the only reason a
  // single cell is honest here. If a plan is ever set to, say, 3 cart offers but
  // 1 bundle, this row starts lying and has to become one row per type.
  { label: 'Cart upsell + free-shipping bar', cells: ['✓', '✓', '✓', '✓'] },
  { label: 'Bought-together + thank-you upsells', cells: ['—', '✓', '✓', '✓'] },
  { label: 'Popup upsells (any page)', cells: ['—', '—', '✓', '✓'] },
  { label: 'Upsell display rules (AND/OR)', cells: ['—', '—', '✓', '✓'] },
  { label: 'In-checkout upsell (Shopify Plus)', cells: ['—', '—', '—', '✓'] },
  { label: 'Upsells per type', cells: ['1', '3', 'Unlimited', 'Unlimited'] },
  { label: 'Customer events & analytics', cells: ['—', '—', '✓', '✓'] },
  { label: 'AI authoring (taxonomy + logic)', cells: ['—', '—', '✓', '✓'] },
  { label: 'Intent mix — read-only', cells: ['—', '—', '✓', '✓'] },
  { label: 'Live per-shopper reranking', cells: ['—', '—', '—', '✓'] },
  { label: 'Personalized offers in cart / popup / checkout / thank-you', cells: ['—', '—', '—', '✓'] },
  { label: 'Intent insights — heatmap, per-intent results, AI summaries', cells: ['—', '—', '—', '✓'] },
  { label: 'Orders / month', cells: ['200*', '2,000*', 'Unlimited', 'Unlimited'] },
  // Nothing in the app tiers support, and /support promises email + a one
  // business-day reply + free setup help to EVERY plan. This row used to say
  // Free got docs only, which contradicted our own support page.
  { label: 'Support', cells: ['Email + docs', 'Email + docs', 'Priority email', 'Priority email'] },
  { label: 'Setup help', cells: ['✓', '✓', '✓', '✓'] },
];
