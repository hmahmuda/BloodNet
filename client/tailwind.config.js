/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50:  '#fff1f1',
          100: '#ffd9d9',
          500: '#e53e3e',
          600: '#c53030',
          700: '#9b2c2c',
        }
      }
    },
  },
  plugins: [],
}