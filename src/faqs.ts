/**
 * FAQ — SINGLE SOURCE for both the categorized <details> list on /faqs and
 * the FAQPage structured data in Base.astro.
 *
 * `a` is HTML (bold, links). Base.astro strips tags before writing the
 * schema, because FAQPage acceptedAnswer.text must be plain prose.
 */

import { SUPPORT_EMAIL } from './consts';
import { REVERSE_TRIAL_DAYS, PAYMENT_TRIAL_DAYS } from './plans';

export interface FaqItem {
  /** The question, exactly as a merchant would ask it. */
  q: string;
  /** The answer as HTML — kept short enough to read without expanding twice. */
  a: string;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'What does QSortby do?',
        a: 'QSortby is a Shopify app that uses data and algorithms to automatically reorder products inside your collections and personalizes product display per shopper. It pushes bestsellers to the front and demotes sold-out products automatically.',
      },
      {
        q: 'How does QSortby work?',
        a: 'You pick or create a collection, attach a sorting strategy (based on sales, inventory, shopper behavior...), and QSortby continuously updates product order and personalizes the display for each visitor.',
      },
      {
        q: 'Does QSortby require theme code changes?',
        a: 'No code edits. QSortby writes the order to your own Shopify collections, and anything shown on the page — the Best Sellers, For You, Bought With and Goes With sections, the cart upsell, the free-shipping bar — comes from the QSortby app embed and sections you switch on in the theme editor. Nothing to paste, nothing to maintain when the theme updates.',
      },
      {
        q: 'What kind of store is QSortby for?',
        a: 'Stores that want their collection pages to stay aligned with real-time inventory, sales trends, and shopper behavior.',
      },
      {
        q: 'How long does setup take?',
        a: 'Two steps: switch the QSortby app embed on in your theme editor, then sort one collection from a starter recipe — Best selling, Trending now or New & selling. The in-app guide has 33 short walkthrough videos, one per screen, and setup help is free on every plan.',
      },
    ],
  },
  {
    title: 'Plans & Pricing',
    items: [
      {
        q: 'Does QSortby have a free plan?',
        a: `Yes. Every install gets ${REVERSE_TRIAL_DAYS} days of every feature (the Growth plan) with no card, then settles on the Free plan and keeps running: one collection ranked in real time, sold-out demotion, the cart upsell and free-shipping bar, A/B testing and revenue attribution. Free is a real $0 plan, not a trial. When you pick your first paid plan, it starts with its own ${PAYMENT_TRIAL_DAYS}-day free trial.`,
      },
      {
        q: 'How much do paid plans cost?',
        a: 'Check our <a href="/pricing">pricing page</a> for full details.',
      },
    ],
  },
  {
    title: 'Sorting & Personalization',
    items: [
      {
        q: 'How often does QSortby resort my collections?',
        a: 'Every order and stock change is scored within seconds. Each collection is then re-published on the schedule you pick — every 5, 15, 30 or 60 minutes, every 6 hours, or a custom interval — on every plan, including Free. Change the rule any time and the next run uses it.',
      },
      {
        q: 'What signals does QSortby sort on?',
        a: 'Sales, inventory, trending products, and shopper behavior — plus more.',
      },
      {
        q: 'What does per-shopper personalization mean?',
        a: 'Different visitors can see a different product order in the same collection, based on their browsing/purchase behavior — instead of one fixed order for everyone.',
      },
      {
        q: 'How does QSortby handle sold-out products?',
        a: "It automatically pushes sold-out or out-of-stock variants down so they don't occupy prime real estate shoppers can't actually buy.",
      },
      {
        q: 'Can I keep related products grouped together?',
        a: "Yes. Goes-with rules keep the products you choose — by vendor, type or tag — side by side through every re-sort, while the collection still follows its ranking rule. Drafting rules is free; publishing them to your storefront starts on the Starter plan.",
      },
    ],
  },
  {
    title: 'Integrations & AI',
    items: [
      {
        q: 'Which review apps does QSortby read?',
        a: 'Judge.me connects in one click and syncs reviews into QSortby. Fera, REVIEWS.io and Stamped are read from the metafields they already write — nothing to connect. Either way, review score becomes a ranking signal (“Top rated”) straight away.',
      },
      {
        q: 'Does QSortby work with Klaviyo or Google Analytics?',
        a: 'Both connect from Settings → Integrations today; the data flows that use those connections are rolling out in stages. Attribution already reaches those tools another way: influenced orders are tagged in your Shopify admin, so any tool that reads order tags can segment on them.',
      },
      {
        q: 'Can I connect Claude or ChatGPT to my QSortby data?',
        a: 'Yes — AI connections, on Pro and Growth, rolling out in stages. QSortby exposes an MCP endpoint for your store, so an assistant like Claude or ChatGPT can read your collections, why a product ranks where it does, influenced revenue, product movers, experiments and the intent mix. Connections read by default; the store owner decides who may connect and whether an assistant may set up drafts (test-mode collections, unpublished logic, switched-off upsells) or ask for an A/B test that a person then approves in the app. Nothing goes live without you, and no shopper personal data is exposed.',
      },
    ],
  },
  {
    title: 'Analytics & Support',
    items: [
      {
        q: 'Does QSortby provide analytics?',
        a: 'Yes. The app gives you analytics to track the impact QSortby has on your store, along with insights into customer behavior.',
      },
      {
        q: 'How do I contact QSortby support?',
        a: `Use the chat in the app or on this site, or email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. We reply within one business day, and setup help is free on every plan.`,
      },
      {
        q: 'Can I change or cancel my plan anytime?',
        a: 'Billing is handled through Shopify — you can upgrade, downgrade, or cancel from your Shopify admin.',
      },
    ],
  },
];

// Flat list — what Base.astro's FAQPage structured data reads.
export const FAQS: FaqItem[] = FAQ_CATEGORIES.flatMap((c) => c.items);
