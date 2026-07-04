import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14161A",
        paper: "#F7F7F5",
        surface: "#FFFFFF",
        line: "#E5E4E0",
        muted: "#8A8B85",
        sidebar: {
          DEFAULT: "#0F1115",
          foreground: "#E7E7E5",
          muted: "#8B8D97",
          active: "#1B1E27",
        },
        accent: {
          DEFAULT: "#5B4FE8",
          foreground: "#FFFFFF",
          soft: "#EFEDFD",
        },
        success: {
          DEFAULT: "#17A672",
          soft: "#E6F6EF",
        },
        warning: {
          DEFAULT: "#C9861A",
          soft: "#FBF1DF",
        },
        danger: {
          DEFAULT: "#D64545",
          soft: "#FBEAEA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(20, 22, 26, 0.04)",
        card: "0 1px 3px 0 rgba(20, 22, 26, 0.06)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.8)", opacity: "0" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
