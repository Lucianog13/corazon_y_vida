/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'elderly-blue': '#3b82f6',
        'elderly-green': '#22c55e',
        'elderly-red': '#ef4444',
      },
    },
  },
  plugins: [],
}
