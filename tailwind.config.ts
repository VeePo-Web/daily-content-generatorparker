import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      colors: {
        studio: {
          bg: "#0f172a",
          card: "#1e293b",
          "card-hover": "#263548",
          border: "#334155",
          accent: "#3b82f6",
          success: "#22c55e",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
