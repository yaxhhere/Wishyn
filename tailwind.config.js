/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        'background-sec': 'hsl(var(--background-sec))',
        foreground: 'hsl(var(--foreground))',

        muted: 'hsl(var(--muted))',

        'pseudo-background': 'hsl(var(--pseudo-background))',
        'pseudo-foreground': 'hsl(var(--pseudo-foreground))',

        primary: 'hsl(var(--primary))',
        'primary-fg': 'hsl(var(--primary-fg))',

        secondary: 'hsl(var(--secondary))',
        'secondary-fg': 'hsl(var(--secondary-fg))',

        accent: 'hsl(var(--accent))',
        'accent-fg': 'hsl(var(--accent-fg))',

        highlight: 'hsl(var(--highlight))',
        'highlight-fg': 'hsl(var(--highlight-fg))',

        success: 'hsl(var(--success))',
        'success-fg': 'hsl(var(--success-fg))',

        info: 'hsl(var(--info))',
        'info-fg': 'hsl(var(--info-fg))',

        danger: 'hsl(var(--danger))',
        'danger-fg': 'hsl(var(--danger-fg))',

        warning: 'hsl(var(--warning))',
        'warning-fg': 'hsl(var(--warning-fg))',

        grey1: 'hsl(var(--grey-1))',
        'grey1-fg': 'hsl(var(--grey-1-fg))',
      },

      spacing: {
        100: 'var(--spacing-100)',
        200: 'var(--spacing-200)',
        300: 'var(--spacing-300)',
        350: 'var(--spacing-350)',
        375: 'var(--spacing-375)',
        400: 'var(--spacing-400)',
        500: 'var(--spacing-500)',
        600: 'var(--spacing-600)',
        700: 'var(--spacing-700)',
        800: 'var(--spacing-800)',
        900: 'var(--spacing-900)',

        'intra-sm': 'var(--spacing-intra-section-sm)',
        'intra-md': 'var(--spacing-intra-section-md)',
        'intra-lg': 'var(--spacing-intra-section-lg)',
        'intra-xl': 'var(--spacing-intra-section-xl)',

        'inter-sm': 'var(--spacing-inter-section-sm)',
        'inter-md': 'var(--spacing-inter-section-md)',
        'inter-lg': 'var(--spacing-inter-section-lg)',
        'inter-xl': 'var(--spacing-inter-section-xl)',
      },

      borderRadius: {
        100: 'var(--radius-100)',
        200: 'var(--radius-200)',
        300: 'var(--radius-300)',
        400: 'var(--radius-400)',
        500: 'var(--radius-500)',
        600: 'var(--radius-600)',
        full: 'var(--radius-full)',
      },

      zIndex: {
        10: 'var(--z-10)',
        20: 'var(--z-20)',
        100: 'var(--z-100)',
        nav: 'var(--z-nav)',
        'modal-overlay': 'var(--z-modal-overlay)',
        modal: 'var(--z-modal)',
        popup: 'var(--z-popup)',
      },

      fontSize: {
        100: 'var(--font-100)',
        200: 'var(--font-200)',
        300: 'var(--font-300)',
        400: 'var(--font-400)',
        500: 'var(--font-500)',
        600: 'var(--font-600)',
        700: 'var(--font-700)',
        800: 'var(--font-800)',
        900: 'var(--font-900)',
      },
    },
  },
  plugins: [],
};
