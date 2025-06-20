/** @type {import('tailwindcss').Config} */
// Helper to read HSL values from CSS variables so Tailwind classes
// like bg-primary-600 respect the current theme color.
const withOpacityValue = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `hsl(var(${variable}) / ${opacityValue})`
    }
    return `hsl(var(${variable}))`
  }
}

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: withOpacityValue('--primary-50'),
          100: withOpacityValue('--primary-100'),
          200: withOpacityValue('--primary-200'),
          300: withOpacityValue('--primary-300'),
          400: withOpacityValue('--primary-400'),
          500: withOpacityValue('--primary-500'),
          600: withOpacityValue('--primary-600'),
          700: withOpacityValue('--primary-700'),
          800: withOpacityValue('--primary-800'),
          900: withOpacityValue('--primary-900'),
        },
        error: {
          DEFAULT: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#dcdcdc',
          200: '#d3d3d3',
          300: '#b3b3b3',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1a1b18',
          900: '#1e2019',
          950: '#0c0d0a',
        },
      },
      fontFamily: {
        bebas: 'var(--font-bebas)',
      },
    },
  },
  plugins: [],
}
