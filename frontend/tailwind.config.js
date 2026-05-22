/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0a0b0e',
          1: '#12141a',
          2: '#1a1d26',
          3: '#222533',
        },
        accent: {
          DEFAULT: '#4f8ef7',
          dim: '#2d5cb8',
          glow: 'rgba(79,142,247,0.15)',
        },
        highlight: '#f7c34f',
        success: '#4fca8e',
        warning: '#f79d4f',
        danger: '#f7524f',
      },
      fontFamily: {
        display: ['"DM Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
