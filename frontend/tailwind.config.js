/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                floordecor: {
                    primary: '#3aabba',    // Hatchworks AI colors
                    secondary: '#2D2D2D',  // Hatchworks AI colors
                    accent: '#215f67ff',     // Hatchworks AI colors
                    muted: 'rgba(229, 62, 62, 0.5)',
                    border: 'rgba(229, 62, 62, 0.2)',
                },
                primary: {
                    DEFAULT: '#3aabba',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#2D2D2D',
                    foreground: '#ffffff',
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
                    DEFAULT: '#215f67ff',
                    foreground: '#ffffff',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Satoshi', 'Inter', 'sans-serif'],
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                'pulse-subtle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                },
                'glow': {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(155, 135, 245, 0.5)' },
                    '50%': { boxShadow: '0 0 15px rgba(155, 135, 245, 0.8)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'pulse-subtle': 'pulse-subtle 1.5s ease-in-out infinite',
                'glow': 'glow 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite'
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-subtle': 'linear-gradient(to bottom right, #f8fafc, #f5f9fc)',
                'gradient-vivid': 'linear-gradient(to bottom right, #3B5B6F, #2F4858)',
            },
            boxShadow: {
                'neon': '0 0 5px rgba(59, 91, 111, 0.5), 0 0 20px rgba(59, 91, 111, 0.3)',
                'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
            }
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}