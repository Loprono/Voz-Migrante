/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8",
        accent: "#16A34A",
        warning: "#D97706",
        background: "#F9FAFB",
        card: "#FFFFFF",
        "text-primary": "#111827",
        "text-muted": "#6B7280",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
