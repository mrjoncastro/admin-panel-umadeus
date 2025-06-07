/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6", // roxo vibrante
          600: "#7c3aed", // principal
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        error: {
          DEFAULT: "#dc2626",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#dcdcdc",
          200: "#d3d3d3",
          300: "#b3b3b3",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1a1b18",
          900: "#1e2019",
          950: "#0c0d0a",
        },
      },
      fontFamily: {
        bebas: 'var(--font-bebas)',
      },
    },
  },
  plugins: [],
};
