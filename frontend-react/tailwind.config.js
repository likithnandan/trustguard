/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070d18',
        panel: '#0d1726',
        'panel-2': '#111e33',
        border: '#16243a',
        accent: '#3ec9ff',
        'accent-2': '#38bdf8',
        green: '#2dd4a0',
        amber: '#ffb020',
        red: '#ff4d6a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
