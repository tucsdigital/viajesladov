import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#19123C',
        'brand-accent': '#B2F432',
      },
      fontFamily: {
        'triester-vector': ['var(--font-triester-vector)', 'serif'],
      },
    },
    fontFamily: {
      sans: ['var(--font-norms-pro-bold)', 'system-ui', '-apple-system', 'sans-serif'],
    },
  },
  plugins: [],
};
export default config;

