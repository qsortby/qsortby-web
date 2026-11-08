/**
 * QSortby — "Polaris Pro" design tokens.
 * 50% Shopify Polaris · 30% Linear · 20% Apple.
 * White ground, Shopify green accent, light borders, minimal shadow,
 * no decorative gradients. The product dashboard is the hero.
 *
 * Type: ONE family, Be Vietnam Pro (brand guidelines v1.0), named once in `--font-sans`
 * (src/styles/global.css) so a swap touches a single declaration. See the
 * switching note at the top of src/styles/fonts.css.
 */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        "bg-2": "#F6F7F6",
        surface: "#ffffff",
        ink: "#1E1E1A",
        "ink-2": "#3D3C37",
        muted: "#5E5C55",
        faint: "#9A978E",
        line: "#E7E9EC",
        "line-2": "#D6DADF",
        // primary = ink/near-black; emerald is the accent (kept under `green.*`)
        btn: { DEFAULT: "#1E1E1A", hover: "#3A3935" },
        green: {
          DEFAULT: "#00a36b",
          ink: "#067a55",
          bright: "#2bd996",
          soft: "#e9f6f0",
          line: "#cbe8da",
        },
        down: "#c4392f",
      },
      fontFamily: {
        // Every role resolves to the same token. `display` and `mono` are kept
        // as aliases so the existing utility classes across the pages keep
        // working, and `serif` is deliberately aliased too — a stray
        // `font-serif` should stay in family rather than falling back to Times.
        sans: ["var(--font-sans)"],
        display: ["var(--font-sans)"],
        serif: ["var(--font-sans)"],
        mono: ["var(--font-sans)"],
      },
      fontSize: {
        label: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.08em" }],
        stat: ["1.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h3: ["1.25rem", { lineHeight: "1.25", letterSpacing: "-0.018em" }],
        h2: [
          "clamp(1.75rem, 3.4vw, 2.6rem)",
          { lineHeight: "1.1", letterSpacing: "-0.028em" },
        ],
        h1: [
          "clamp(2.2rem, 4.8vw, 3.8rem)",
          { lineHeight: "1.05", letterSpacing: "-0.034em" },
        ],
        display: [
          "clamp(2.7rem, 5.6vw, 4.9rem)",
          { lineHeight: "1.0", letterSpacing: "-0.04em" },
        ],
      },
      letterSpacing: { tight2: "-0.018em", tightest: "-0.034em" },
      maxWidth: { wrap: "1080px", wide: "1480px" },
      borderRadius: {
        lg2: "0.625rem",
        xl2: "0.875rem",
        "2xl2": "1.25rem",
        "3xl2": "1.75rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16,24,40,.05)",
        sm: "0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)",
        lg: "0 1px 3px rgba(16,24,40,.06), 0 22px 44px -24px rgba(16,24,40,.22)",
        // soft, floating elevation for hero product mockup + bento cards (Apple/Vercel feel)
        float:
          "0 1px 1px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18), 0 40px 80px -36px rgba(16,24,40,.22)",
        glow: "0 0 0 1px rgba(0,163,107,.16), 0 18px 50px -20px rgba(0,163,107,.30)",
      },
    },
  },
  plugins: [],
};
