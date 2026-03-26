/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#2A9D8F',
        'brand-dark': '#264653',
        'brand-yellow': '#E9C46A',
        'brand-light': '#F4A261',
        'brand-red': '#E76F51',
      }
    },
  },
  plugins: [],
}