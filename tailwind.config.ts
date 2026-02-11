import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				heading: ['Space Grotesk', 'sans-serif'],
				body: ['Inter', 'sans-serif'],
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))', // Neon Purple #7C3AED
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				energy: {
					high: 'hsl(var(--energy-high))',
					medium: 'hsl(var(--energy-medium))',
					low: 'hsl(var(--energy-low))'
				},
				// Gamification Palette (Gaming Theme)
				hp: 'hsl(var(--hp-color))',     // Red
				mp: 'hsl(var(--mp-color))',     // Blue
				xp: 'hsl(var(--xp-color))',     // Purple
				gold: 'hsl(var(--gold-color))',   // Gold
				gems: 'hsl(var(--gems-color))',   // Magenta
				streak: 'hsl(var(--streak-color))', // Orange
				level: 'hsl(var(--level-color))',  // Cyan
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-warning': 'var(--gradient-warning)',
				'gradient-danger': 'var(--gradient-danger)',
				'gradient-xp': 'var(--gradient-xp)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-glass': 'var(--gradient-glass)'
			},
			boxShadow: {
				'glow': 'var(--shadow-glow)',
				'glow-sm': 'var(--shadow-glow-sm)',
				'card': 'var(--shadow-card)',
				'elevation': 'var(--shadow-elevation)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(12px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.92)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					from: { opacity: '0', transform: 'translateX(20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 15px hsl(var(--primary) / 0.2)' },
					'50%': { boxShadow: '0 0 30px hsl(var(--primary) / 0.4)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'streak-fire': {
					'0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.1)' }
				},
				'xp-gain': {
					'0%': { opacity: '0', transform: 'translateY(0) scale(0.5)' },
					'50%': { opacity: '1', transform: 'translateY(-20px) scale(1.2)' },
					'100%': { opacity: '0', transform: 'translateY(-40px) scale(0.8)' }
				},
				'hp-damage': {
					'0%, 100%': { transform: 'translateX(0)' },
					'20%': { transform: 'translateX(-4px)' },
					'40%': { transform: 'translateX(4px)' },
					'60%': { transform: 'translateX(-2px)' },
					'80%': { transform: 'translateX(2px)' }
				},
				'level-up': {
					'0%': { transform: 'scale(1)', boxShadow: '0 0 0 rgba(251, 191, 36, 0)' },
					'50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)' },
					'100%': { transform: 'scale(1)', boxShadow: '0 0 0 rgba(251, 191, 36, 0)' }
				},
				'count-up': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'scale-in': 'scale-in 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 1.5s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'streak-fire': 'streak-fire 1.5s ease-in-out infinite',
				'xp-gain': 'xp-gain 1s ease-out forwards',
				'hp-damage': 'hp-damage 0.4s ease-out',
				'level-up': 'level-up 0.8s ease-out',
				'count-up': 'count-up 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
