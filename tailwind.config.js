/** @type {import('tailwindcss').Config} */
// Tailwind scans index.html and everything under src for class names.
//
// "Ledger & hangtag" design tokens -- this app is a small bags/accessories
// business's bookkeeping tool, so the palette and type system are drawn
// from that world: brass hardware, canvas/leather goods, and a paper ledger
// book. Kept in one place instead of scattered magic hex values across
// pages. See docs/ in stock-business-analyst for the design rationale.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep pine-charcoal -- primary text and the nav's dark surface.
        // Named "ink" (ledger-book ink) rather than a generic "gray-900".
        ink: {
          DEFAULT: "#1C2321",
          soft: "#2A332F", // one step lighter, for raised dark surfaces (e.g. hover on the dark sidebar)
        },
        // Warm paper background -- the app's base surface (a ledger page).
        canvas: "#F6F3EA",
        // Brass hardware accent -- primary actions, active nav, focus rings,
        // the logo mark. Used deliberately sparingly (one accent, per spec).
        brass: {
          DEFAULT: "#A9782E",
          dark: "#8A6224",
          light: "#EFE3C8",
        },
        // Moss -- positive figures (income, stock-in, profit).
        moss: {
          DEFAULT: "#4B6350",
          dark: "#374A3C",
        },
        // Rust -- negative figures (expenses, stock-out, COGS, errors).
        rust: {
          DEFAULT: "#A6432E",
          dark: "#832F1D",
        },
        // Stone -- muted text and borders on the warm paper base, instead of
        // the cool default grays that would clash with `canvas`.
        stone: {
          DEFAULT: "#83786A",
          light: "#DAD3C3",
          dark: "#5C5346",
        },
      },
      fontFamily: {
        // Stamped-tag-style headings/labels/nav -- set uppercase with
        // tracking wherever it's used, evoking the lettering on a product
        // hang-tag ("[Black] Croco Nocturne Bag").
        display: ["'Barlow Semi Condensed'", "system-ui", "sans-serif"],
        // Body copy, forms, buttons -- optimized for legibility, not personality.
        sans: ["Inter", "system-ui", "sans-serif"],
        // Every money amount, quantity, and stock count renders in this
        // face with tabular figures, so columns of numbers line up like a
        // real ledger book -- the app's one signature typographic move.
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Warm-tinted shadow (a hint of ink, not neutral gray) so cards lift
        // off the canvas background convincingly instead of looking hazy.
        card: "0 1px 2px rgba(28, 35, 33, 0.06), 0 4px 12px rgba(28, 35, 33, 0.05)",
      },
      // 768px is the spec's explicit desktop breakpoint ("Desktop viewport
      // (>=768px) progressively enhances the same screens"), so we name it
      // "md" to match Tailwind's default and avoid a bespoke breakpoint name
      // that future contributors would have to look up.
      spacing: {
        tap: "44px", // minimum tap target size called out in the spec
      },
    },
  },
  plugins: [],
};
