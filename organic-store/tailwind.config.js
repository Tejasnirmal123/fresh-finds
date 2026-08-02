/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'fresh-green': {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce4ca',
          300: '#8fcea6',
          400: '#5cb07a',
          500: '#3a9158',
          600: '#2b7a3e',
          700: '#236132',
          800: '#1f4e2a',
          900: '#1a4124',
        },
      },
    },
  },
  plugins: [],
}

