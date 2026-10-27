import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6D5BFF",
        secondary: "#8B5CF6",
        accent: "#00D4FF",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        ink: "#111827",
        muted: "#6B7280"
      },
      borderRadius: {
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px"
      },
      boxShadow: {
        glass: "0 20px 70px rgba(109, 91, 255, 0.12)",
        soft: "0 10px 35px rgba(17, 24, 39, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
