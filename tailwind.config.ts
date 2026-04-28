import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Instrument Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'Instrument Sans', 'system-ui', 'sans-serif'],
        logo: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Canonical 5-step type scale (see src/lib/scale.ts).
        // Per project decision: label/body are size-only so re-flowing
        // existing text-xs / text-sm callsites only changes font-size,
        // not letter-spacing or line-height. Tight variants opt-in.
        caption: ['11px', { lineHeight: '1.25', letterSpacing: '0.04em' }],
        label: ['12px', { lineHeight: '1.4' }],
        'label-tight': ['12px', { lineHeight: '1.25', letterSpacing: '0.02em' }],
        body: ['14px', { lineHeight: '1.5' }],
        'body-snug': ['14px', { lineHeight: '1.375' }],
        // title/headline are size+leading only (weight opt-in) to match
        // the same philosophy as label/body. Use the *-medium / *-semibold
        // / *-bold variants below when an explicit weight is required.
        title: ['16px', { lineHeight: '1.375' }],
        'title-medium': ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        'title-semibold': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        headline: ['20px', { lineHeight: '1.25' }],
        'headline-semibold': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-bold': ['20px', { lineHeight: '1.3', fontWeight: '700' }],
      },
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          muted: "hsl(var(--primary-muted))",
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
          elevated: "hsl(var(--card-elevated))",
          surface: "hsl(var(--card-surface))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        glass: {
          DEFAULT: "hsl(var(--glass))",
          border: "hsl(var(--glass-border))",
          highlight: "hsl(var(--glass-highlight))",
        },
        // SelfERA brand colors
        support: "hsl(var(--support))",
        informative: "hsl(var(--informative))",
        relatable: "hsl(var(--relatable))",
        crisis: {
          DEFAULT: "hsl(var(--crisis))",
          foreground: "hsl(var(--crisis-foreground))",
        },
        verified: "hsl(var(--verified))",
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
        "4xl": "2rem",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '800': '800ms',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.4)" },
          "30%": { transform: "scale(0.85)" },
          "45%": { transform: "scale(1.15)" },
          "60%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "heart-burst": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "15%": { transform: "scale(1.4)", opacity: "1" },
          "30%": { transform: "scale(0.9)", opacity: "1" },
          "45%": { transform: "scale(1.15)", opacity: "1" },
          "80%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.25)" },
          "50%": { boxShadow: "0 0 50px hsl(var(--primary) / 0.45)" },
        },
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "snap-in": {
          "0%": { transform: "translateY(30px) scale(0.96)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "ring-pulse": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "nav-slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "nav-slide-down": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(20px)" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "heart-pop": "heart-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "heart-burst": "heart-burst 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "slide-up": "slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-down": "slide-down 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-bottom": "slide-in-bottom 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-out": "fade-out 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "zoom-in": "zoom-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "shake": "shake 0.4s ease-in-out",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "count-up": "count-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "snap-in": "snap-in 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        "shimmer": "shimmer 2s linear infinite",
        "ring-pulse": "ring-pulse 1.5s ease-out infinite",
        "nav-slide-up": "nav-slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "nav-slide-down": "nav-slide-down 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-up": "scale-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "gradient-x": "gradient-x 4s linear infinite",
      },
      boxShadow: {
        'glow': '0 0 50px -12px hsl(var(--primary) / 0.5)',
        'glow-lg': '0 0 80px -20px hsl(var(--primary) / 0.6)',
        'glow-soft': '0 0 100px -30px hsl(var(--primary) / 0.3)',
        'glow-ambient': '0 0 60px -10px hsl(var(--primary) / 0.25), 0 0 100px -20px hsl(var(--accent) / 0.15)',
        'inner-glow': 'inset 0 1px 0 0 hsl(var(--foreground) / 0.05)',
        'cinematic': '0 4px 6px -1px hsl(0 0% 0% / 0.25), 0 2px 4px -2px hsl(0 0% 0% / 0.15)',
        'elevated': '0 25px 50px -12px hsl(0 0% 0% / 0.5), 0 12px 24px -8px hsl(0 0% 0% / 0.3)',
        'float': '0 30px 60px -15px hsl(0 0% 0% / 0.45), 0 15px 30px -10px hsl(0 0% 0% / 0.25)',
        'soft': '0 8px 30px -10px hsl(0 0% 0% / 0.3)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
