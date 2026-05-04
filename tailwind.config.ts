import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kriptex: {
          navy: "#0A1B33",
          "navy-deep": "#050E1F",
          "navy-mid": "#13294D",
          steel: "#1F3A5F",
          orange: "#FF8A2A",
          "orange-bright": "#FFB347",
          "orange-deep": "#C95A0F",
          ember: "#FF5A1F",
          cyan: "#34D8FF",
          "cyan-deep": "#0FA3C7",
          cream: "#E6F1FF",
          danger: "#FF3B5C",
          success: "#34FFB0",
        },
      },
      fontFamily: {
        display: ['"Audiowide"', '"Orbitron"', "sans-serif"],
        digital: ['"Orbitron"', "monospace"],
        sans: ['"Rajdhani"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [animate],
} satisfies Config;
