// tailwind.config.js
module.exports = {
  darkMode: 'class', // BẮT BUỘC
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // Nếu bạn để code trong src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
