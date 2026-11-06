# QSortby — Marketing Website

Public marketing site for the **QSortby** Shopify app (real-time best-sellers / sales-velocity ranking). Built with **Astro + Tailwind**, deploys as static HTML to **Netlify**, and uses **Netlify Forms** for the support contact form.

This folder is standalone — it is **not** part of the qsortby pnpm/Turborepo workspace and has its own `package.json`.

## Stack

- [Astro](https://astro.build) 4 — static output, zero client framework
- Tailwind CSS 3 (design tokens in `tailwind.config.mjs`)
- Self-hosted fonts in `public/fonts/`: **Inter** (UI + display), **JetBrains Mono** (numerals/labels)
- Netlify Forms (the `support` form on `/support`)

## Design — "Polaris Pro · Ink + Emerald"

50% Shopify Polaris · 30% Linear · 20% Apple. White ground, **near-black primary**
(`#111418` buttons/brand) with **emerald** (`#00a36b`) reserved for live/links/data —
high-contrast and ownable rather than generic "Shopify green". Inter, light borders,
minimal shadow, no decorative page gradients, quiet/quick motion.

The hero centerpiece is a large **dark-mode** Shopify-admin dashboard mockup
(`AppShot.astro`) floating over a soft emerald glow; its **Best sellers** table reorders
its rows live as sales arrive (`public/assets/app.js` → `#js-board`). The final CTA is a
matching dark panel with an emerald button. Tokens live in `tailwind.config.mjs`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview
```

## Deploy to Netlify

1. New site → connect this repo.
2. The included `netlify.toml` sets the build command (`npm run build`) and publish directory (`dist`).
3. Deploy. Netlify auto-detects the static `support` form on `/support`; submissions appear under **Forms** in the Netlify dashboard. Configure email/Slack notifications there.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero flow (auto-sort → pair → personalize), intro video, "What you get" tabs (merchandising / personalization / upsell), "if you've said any of these", Intent AI teaser, CTA |
| `/features/merchandising` | Auto-sort: the 16 ranking signals, windows (rolling / period / snapshot), goes-with grouping, test mode + theme preview + restore, A/B proof |
| `/features/personalization` | Segment rules → per-visitor "For You" ranking, trace-this-shopper, apply to collection / block / upsell |
| `/features/upsell-blocks` | Six upsell surfaces (cart, free-shipping bar, bought-together, popup, thank-you, in-checkout on Plus), display rules, Intent suggest on Growth |
| `/features/intent-ai` | Intent AI end to end: five intents, where it acts, what is Live vs Testing, proof, guardrails |
| `/integrations` | Shopify-native surfaces (collections + 4 theme sections, metafields, order tags, checkout/thank-you extensions, pixel) + ecosystem (review apps, Klaviyo/GA4 connect, AI assistants via MCP) |
| `/use-cases` | Nine merchant situations, grouped in three bands |
| `/pricing` | Plans — Free / Starter $29 / Pro $99 / Growth $199, 10-day reverse trial on install + 7-day trial on the first paid plan (matches the Billing API) + comparison matrix + billing FAQ |
| `/faqs` | Categorised FAQ (also feeds the FAQPage JSON-LD in `Base.astro`) |
| `/support` | Contact form (Netlify) + support info |
| `/thank-you` | Post-submit page (no-JS form fallback target; `noindex`) |
| `/privacy` | Privacy Policy (required for App Store listing) |
| `/terms` | Terms of Service |

The user guide is a separate site at `guide.qsortby.com` (`GUIDE_URL` in `src/consts.ts`).

Shared components: `HeroFlow.astro` (home hero), `Offer.astro` (home tabs), the `*Hero.astro` / `*Features.astro` pairs per feature page, `IntentTeaser.astro` + `Intent*.astro`, `BookDemo.astro` (QOne Desk booking), `HelpLauncher.astro` (QOne Desk chat), `StickyCta.astro` (mobile install bar).

## Keeping the site honest

The app repo is the authority. Before changing a claim, check it there:

- Plans, prices, trial → `apps/shopify/app/lib/plans.ts`, `apps/shopify/app/shopify.server.ts`
- What each plan includes → `apps/api/src/lib/plan-features.ts` (`DEFAULT_PLAN_FEATURES`, `DEFAULT_PLAN_META`)
- Ranking signals, windows → `docs/RANKING.md`, the collection editor
- Storefront surfaces → `apps/shopify/extensions/*` (theme sections, pixel, checkout + thank-you extensions), `apps/shopify/app/routes/proxy/*`
- Integrations → `apps/shopify/app/lib/oauth/provider.ts` (Klaviyo, Google, Judge.me), `apps/shopify/app/routes/app/settings/ai-connections` (MCP)
- Retention figures in `/privacy` → `workers/events-retention/src/index.ts`

Features that exist in code but ship behind a server-side switch (MCP connector, Klaviyo/GA4 data flows, related-products metafields, popup/free-shipping "Look") are described as **rolling out / opening in stages**, never as live.

## Config

- **`src/consts.ts`** — `APP_STORE_URL`, `SUPPORT_EMAIL` (single inbox for every mailto, the form failure message and the Organization schema), `GUIDE_URL`, demo booking + support widget keys, analytics IDs.
- **Domain** → `astro.config.mjs` `site`, plus `qsortby.com` in `public/sitemap.xml`, `public/robots.txt` and the JSON-LD in `src/layouts/Base.astro`.
- **Share image** → `public/og-default.jpg` (source in `design/og-card.html`).
