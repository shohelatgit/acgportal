const fs = require('fs');
const path = require('path');

const files = [
  ...fs.readdirSync('services').filter(f => f.endsWith('.html')).map(f => path.join('services', f)),
  ...fs.readdirSync('portfolio').filter(f => f.endsWith('.html')).map(f => path.join('portfolio', f)),
  'materials.html',
  'about.html',
  'index.html'
];

const newConfig = `            tailwind.config = {
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
                            'gradient-primary': 'linear-gradient(135deg, #1489b4 0%, #3da8d0 100%)',
                            'gradient-primary-light': 'linear-gradient(135deg, #3da8d0 0%, #66c5e5 100%)',
                        },
                        fontFamily: {
                            sans: ["Inter", "system-ui", "sans-serif"],
                            display: ["Playfair Display", "Georgia", "serif"],
                        },
                    },
                },
            };`;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const configStart = content.indexOf('tailwind.config');
  const configEnd = content.indexOf('};', configStart) + 3;

  if (configStart !== -1 && configEnd !== -1) {
    const beforeConfig = content.substring(0, configStart);
    const afterConfig = content.substring(configEnd);

    const scriptStart = content.lastIndexOf('<script>', configStart);
    const newContent = beforeConfig.substring(0, scriptStart) + '<script>\n' + newConfig + '\n' + afterConfig;
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`✓ Updated config in ${path.basename(file)}`);
  }
});

console.log('\n✅ All Tailwind configs updated with gradient-primary!');
