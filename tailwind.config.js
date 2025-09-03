import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Jewel Tone Colors
        emerald: {
          DEFAULT: "hsl(var(--emerald))",
          light: "hsl(var(--emerald-light))",
          dark: "hsl(var(--emerald-dark))",
        },
        sapphire: {
          DEFAULT: "hsl(var(--sapphire))",
          light: "hsl(var(--sapphire-light))",
          dark: "hsl(var(--sapphire-dark))",
        },
        amethyst: {
          DEFAULT: "hsl(var(--amethyst))",
          light: "hsl(var(--amethyst-light))",
          dark: "hsl(var(--amethyst-dark))",
        },
        amber: {
          DEFAULT: "hsl(var(--amber))",
          light: "hsl(var(--amber-light))",
          dark: "hsl(var(--amber-dark))",
        },
        ruby: {
          DEFAULT: "hsl(var(--ruby))",
          light: "hsl(var(--ruby-light))",
          dark: "hsl(var(--ruby-dark))",
        },
        pearl: "hsl(var(--pearl))",
        slate: "hsl(var(--slate))",
        charcoal: "hsl(var(--charcoal))",
        // Brand colors
        "brand-orange": "hsl(var(--brand-primary))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      spacing: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
      },
      padding: {
        'safe-area-pb': 'env(safe-area-inset-bottom)',
      },
      height: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    forms,
  ],
}