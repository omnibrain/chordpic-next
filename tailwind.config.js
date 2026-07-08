/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Besley", "serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0c0c0e",
        },
      },
      maxWidth: {
        content: "64rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
