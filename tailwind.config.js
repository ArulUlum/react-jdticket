/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulseShrink: {
          '0%, 80%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(0.8)', opacity: 0.7 },
        },
      },
      animation: {
        pulseShrink: 'pulseShrink 2s ease-in-out infinite',
      },
      colors: {
        strokesss: "#212121",
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
