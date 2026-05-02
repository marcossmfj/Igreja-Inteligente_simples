/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#100E26", // Azul Índigo Ultra Profundo
        accent: "#F59E0B", // Âmbar
      }
    },
  },
  plugins: [],
}
