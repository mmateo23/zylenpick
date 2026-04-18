import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        page: "var(--bg-page)",
        "page-alt": "var(--bg-page-alt)",
        surface: "var(--bg-surface)",
        "surface-strong": "var(--bg-surface-strong)",
        "surface-muted": "var(--bg-surface-muted)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-inverse": "var(--text-inverse)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        accent: "var(--brand-accent)",
        "accent-strong": "var(--brand-accent-strong)",
        "accent-bright": "var(--brand-accent-bright)",
        "accent-soft": "var(--brand-accent-soft)",
        "accent-border": "var(--brand-accent-border)",
        cta: {
          DEFAULT: "var(--cta-primary-bg)",
          hover: "var(--cta-primary-hover)",
          text: "var(--cta-primary-text)",
        },
        "icon-highlight": "var(--icon-highlight)",
        "focus-ring": "var(--focus-ring)",
        "price-highlight": "var(--price-highlight)",
        danger: "var(--status-danger)",
        warning: "var(--status-warning)",
      },
    },
  },
  plugins: [],
};
export default config;
