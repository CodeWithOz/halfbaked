/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'full': '0 0px 30px 10px rgb(0 0 0 / 1)',
        'inner-2': 'inset 0 var(--shadow-panel-height) var(--shadow-panel-blur) 0 var(--shadow-color,rgb(0 0 0 / 0.05));'
      },
    },
  },
  plugins: [],
}
