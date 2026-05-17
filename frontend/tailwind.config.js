/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zerostate-dark': '#0F1115',
        'zerostate-green': '#00FF00',
      }
    },
  },
  plugins: [],
}