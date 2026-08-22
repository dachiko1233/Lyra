/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Intentional palette — "ink & moss". Not default Tailwind blue.
        moss: {
          50: "#eef5f0",
          100: "#d7e8dd",
          200: "#aecfba",
          300: "#7fb79a",
          400: "#4f9673",
          500: "#3c6e57",
          600: "#2c5442",
          700: "#234433",
          800: "#1a3327",
          900: "#12261d",
        },
        clay: {
          400: "#d68e6c",
          500: "#b5623c",
          600: "#8f4c2e",
        },
        ink: {
          DEFAULT: "#1a1f1b",
          soft: "#454b45",
          muted: "#6b716a",
        },
        paper: {
          DEFAULT: "#f5f4ef",
          alt: "#edebe2",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
