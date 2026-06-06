import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "sans-serif"]
      },
      colors: {
        background: "#050505",
        foreground: "#ffffff",
        racing: {
          red: "#ff0000",
          dark: "#b30000",
          panel: "#151515",
          border: "#2a2a2a"
        }
      },
      boxShadow: {
        glow: "0 0 34px rgba(255, 0, 0, 0.24)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.45)"
      },
      backgroundImage: {
        "racing-grid":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "red-sweep":
          "radial-gradient(circle at 20% 20%, rgba(255,0,0,0.28), transparent 28%), radial-gradient(circle at 80% 0%, rgba(179,0,0,0.2), transparent 30%)"
      },
      keyframes: {
        "pulse-line": {
          "0%, 100%": { transform: "translateX(-40%)", opacity: "0.25" },
          "50%": { transform: "translateX(80%)", opacity: "0.8" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        "pulse-line": "pulse-line 3.4s ease-in-out infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
