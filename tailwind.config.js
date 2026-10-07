/** @type {import('tailwindcss').Config} */

// Warm "workbench" ramps replace the cool slate/gray/blue defaults so every
// page inherits the same paper/ink palette and brand-green accents.
const paper = {
  50: '#FBFAF6',
  100: '#F3F1EA',
  200: '#E6E3D8',
  300: '#CECABB',
  400: '#A8A392',
  500: '#827E6F',
  600: '#605D51',
  700: '#48463D',
  800: '#2A2923',
  900: '#1C1B17',
  950: '#121108',
}

const ash = {
  50: '#F7F6F1',
  100: '#EDEBE3',
  200: '#DDDACF',
  300: '#C1BDB0',
  400: '#9C9789',
  500: '#787466',
  600: '#5A574C',
  700: '#3B3A35',
  800: '#242320',
  900: '#171613',
  950: '#0D0C0A',
}

const brand = {
  50: '#ECF7F2',
  100: '#D5EEE4',
  200: '#ACDCCA',
  300: '#7CC5AC',
  400: '#4AAB8C',
  500: '#229073',
  600: '#0B6E53',
  700: '#095942',
  800: '#074735',
  900: '#06382A',
  950: '#04241C',
}

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './assets/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        slate: paper,
        gray: ash,
        blue: brand,
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--accent-foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Instrument Sans"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
