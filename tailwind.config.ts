import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        logo: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
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
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
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
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.35)" },
          "30%": { transform: "scale(0.9)" },
          "45%": { transform: "scale(1.1)" },
          "60%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "heart-burst": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "15%": { transform: "scale(1.3)", opacity: "1" },
          "30%": { transform: "scale(0.95)", opacity: "1" },
          "45%": { transform: "scale(1.1)", opacity: "1" },
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
        "zoom-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
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
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "snap-in": {
          "0%": { transform: "translateY(20px) scale(0.98)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "swipe-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        "swipe-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "jiggle": {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "heart-pop": "heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "heart-burst": "heart-burst 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "slide-up": "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-in": "zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "shake": "shake 0.3s ease-in-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "count-up": "count-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "snap-in": "snap-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "swipe-left": "swipe-left 0.3s ease-out forwards",
        "swipe-right": "swipe-right 0.3s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "jiggle": "jiggle 0.15s ease-in-out infinite",
      },
      boxShadow: {
        'glow': '0 0 40px -10px hsl(var(--primary) / 0.4)',
        'glow-lg': '0 0 60px -15px hsl(var(--primary) / 0.5)',
        'inner-glow': 'inset 0 1px 0 0 hsl(var(--foreground) / 0.05)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
