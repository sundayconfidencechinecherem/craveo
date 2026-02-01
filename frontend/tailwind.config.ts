// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#1B9F20',
          hover: '#158518',
          light: '#E8F5E9',
          dark: '#0D6A11',
          
        },
        
        // Background Colors
        'app-bg': '#FFFDF9',
        background: '#FFFDF9',
        surface: '#FFFFFF',
        'surface-hover': '#F7F7F7',
        
        // Text Colors
        text: {
          primary: '#1A1A1A',
          secondary: '#6B6B6B',
          tertiary: '#A1A1A1',
          inverse: '#FFFFFF',
        },
        
        // UI Colors
        border: '#E0E0E0',
        divider: '#F0F0F0',
        error: '#DC2626',
        success: '#059669',
        warning: '#D97706',
        info: '#2563EB',
      },
      
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
      },
      
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'scale-in': 'scale-in 0.8s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      
      backdropBlur: {
        'xs': '2px',
      },
      
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'large': '0 15px 50px rgba(0, 0, 0, 0.15)',
      },
      
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}
export default config