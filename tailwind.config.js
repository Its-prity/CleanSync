/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAFBFF',
        card: '#FFFFFF',
        ink: '#17233F',
        soft: '#5B6788',
        line: '#DDE3F3',
        blue: {
          DEFAULT: '#3A5BFF',
          dark: '#2540D6',
        },
        highlight: '#FFE45C',
        ok: {
          DEFAULT: '#12A874',
          bg: '#DDF6EA',
        },
        warn: {
          DEFAULT: '#B77A00',
          bg: '#FFF1C2',
        },
        bad: {
          DEFAULT: '#E5385B',
          bg: '#FFE1E7',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'hard-highlight': '8px 8px 0 #FFE45C',
      },
    },
  },
  plugins: [],
};
