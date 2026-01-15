/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './**/*.html',
    './**/*.js',
    './**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1489b4',
          600: '#1489b4',
          500: '#3da8d0',
          400: '#66c5e5',
          300: '#8ddcf0',
          200: '#b5e5f5',
          100: '#dceedf9',
          50: '#f0f8fb',
        },
        background: {
          DEFAULT: '#f4f5f8',
          light: '#fbfaf5',
          white: '#ffffff',
        },
        accent: {
          silver: {
            50: '#f8f9fa',
            100: '#e9ecef',
            200: '#dee2e6',
            300: '#ced4da',
            400: '#adb5bd',
            500: '#6c757d',
            600: '#495057',
          },
          copper: {
            DEFAULT: '#c2410c',
            500: '#c2410c',
            600: '#9a3412',
            700: '#7c2a0a',
          },
        },
        text: {
          DEFAULT: '#1e293b',
          light: '#475569',
          lighter: '#64748b',
        },
      },
      backgroundImage: {
        'gradient-silver': 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(20, 137, 180, 0.85) 0%, rgba(20, 137, 180, 0.65) 50%, rgba(30, 58, 95, 0.75) 100%)',
      },
    },
  },
  plugins: [],
}
