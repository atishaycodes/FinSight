/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        num:   ['"Cormorant Garamond"', "Georgia", "serif"],
        sans:  ['"DM Sans"', "sans-serif"],
      },
      colors: {
        cream:  { DEFAULT: "#f5f2ec", 2: "#edeae2", 3: "#e2ddd3" },
        ink:    { DEFAULT: "#0e0e0c", 2: "#3a3830", 3: "#7a7669", 4: "#b0ab9e" },
        border: "#d6d1c6",
        fgreen: { DEFAULT: "#1a6e3c", bg: "#eaf3ed", bd: "#b8ddc6" },
        fred:   { DEFAULT: "#c0382b", bg: "#fcecea", bd: "#f3b8b5" },
        fblue:  { DEFAULT: "#1a4d8f", bg: "#e8eff9" },
        famber: { DEFAULT: "#8f5a1a", bg: "#faf0e2" },
      },
    },
  },
  plugins: [],
};
