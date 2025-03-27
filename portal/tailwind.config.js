/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      currentColor: 'currentColor',
      white: 'hsl(0, 0%, 100%)',
      black: 'hsl(0, 0%, 0%)',
      primary: {
        100: 'hsl(var(--primary-100))',
        200: 'hsl(var(--primary-200))',
        300: 'hsl(var(--primary-300))',
        400: 'hsl(var(--primary-400))',
        500: 'hsl(var(--primary-500))',
        900: 'hsl(var(--primary-900))',
      },
      secondary: {
        100: 'hsl(var(--secondary-100))',
        400: 'hsl(var(--secondary-400))',
        500: 'hsl(var(--secondary-500))',
      },
      gray: {
        100: 'hsl(var(--gray-100))',
        200: 'hsl(var(--gray-200))',
        500: 'hsl(var(--gray-500))',
        900: 'hsl(var(--gray-900))',
        950: 'hsl(var(--gray-950))',
      },
      warning: {
        200: 'hsl(var(--warning-200))',
        400: 'hsl(var(--warning-400))',
        500: 'hsl(var(--warning-500))',
      },
      success: {
        200: 'hsl(var(--success-200))',
        400: 'hsl(var(--success-400))',
        500: 'hsl(var(--success-500))',
      },
    },

    extend: {
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      boxShadow: {
        card: '-2px 8px 17px 4px rgba(123, 119, 119, 0.15)',
        'card-hover': '-2px 4px 8px 3px rgba(123, 119, 119, 0.15)',
        footer: '0px -5px 30px 0px rgba(54, 41, 183, 0.07)',
        icon: '0px 3.5px 21px 0px rgba(0, 0, 0, 0.05)',
        category: '4px 4px 22px 0 rgba(0, 0, 0, 0.13)',
        'category-hover': '25px 25px 11px -15px rgba(0, 0, 0, 0.13)',
      },
      dropShadow: {
        card: '-2px 13px 19px rgba(53, 51, 51, 0.14)',
        'card-hover': '-2px 6px 9px rgba(53, 51, 51, 0.14)',
      },
      fontFamily: {
        sans: ['"Mona Sans Expanded"'],
        sunrise: ['"Waiting for the Sunrise"'],
        grechen: ['"Grechen Fuemen"'],
        nothing: ['"Nothing You Could Do"'],
        mynerve: ['"Mynerve"'],
        condiment: ['"Condiment"'],
        comforter: ['"Comforter Brush"'],
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
      width: {
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
      },
    },
  },
  plugins: [],
  safelist: ['sr-only', 'embedded-core-form'],
};
