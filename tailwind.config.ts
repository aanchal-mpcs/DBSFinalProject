import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#800000",
          50: "#fdf2f2",
          100: "#fce4e4",
          600: "#991b1b",
          700: "#800000",
          800: "#6b0000",
          900: "#4a0000",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
