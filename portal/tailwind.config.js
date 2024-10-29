/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        foo: 'var(--color-foo)',
      },
      fontSize: {
        h4: ['1.125rem', '1.75rem'] /* 18px, 28px */,
        h3: ['1.25rem', '2rem'] /* 20px, 32px */,
        h2: ['1.5rem', '2rem'] /* 24px, 32px */,
        h1: ['2rem', '2.5rem'] /* 32px, 40px */,
        d2: ['2.5rem', '2.75rem'] /* 40px, 48px */,
        d1: ['4rem', 1] /* 64px, 64px */,
      },
      spacing: {
        0.25: '0.0625rem',
        0.75: '0.1875rem',
        1.25: '0.3125rem',
        1.75: '0.4375rem',
        2.25: '0.5625rem',
        2.75: '0.6875rem',
        3.25: '0.8125rem',
        3.75: '0.9375rem',
        4.5: '1.125rem',
        5.5: '1.375rem',
        6.5: '1.525rem',
        7.5: '1.875rem',
      },
    },
  },
  plugins: [],
};
