/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3EBAAD',
          50: '#E8F7F6',
          100: '#D1EFED',
          200: '#A4DFD9',
          300: '#76D0C6',
          400: '#49C0B3',
          500: '#3EBAAD',
          600: '#329588',
          700: '#267064',
          800: '#1A4A40',
          900: '#0D251C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}