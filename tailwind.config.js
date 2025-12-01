/** @type {import('tailwindcss').Config} */
module.exports = {
  // Indique à Tailwind où chercher les classes utilisées pour générer le CSS
  content: [
    "./**/*.{html,js}", 
    "./pages/**/*.html",
    "./script/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ef4444",
        dark: "#020617",
        // J'ai harmonisé darkSoft sur la version catalogue (#0f0f0f) qui est plus logique pour une nuance
        darkSoft: "#0f0f0f", 
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}