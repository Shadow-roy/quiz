/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New User Theme (Default)
        'background': '#f8fafc',
        'sidebar': '#ffffff',
        'card': '#ffffff',
        'primary': '#4f46e5',
        'secondary': '#64748b',
        'success': '#16a34a',
        'danger': '#dc2626',
        'text-primary': '#1e293b',
        'text-secondary': '#475569',
        'border': '#e2e8f0',
        
        // Admin Theme
        'admin-background': '#f8f9fa',
        'admin-sidebar': '#212529',
        'admin-primary': '#0d6efd',
      },
      fontFamily: {
        'sans': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}