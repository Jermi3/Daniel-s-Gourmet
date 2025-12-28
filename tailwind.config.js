/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          850: '#1a1a1a',
          925: '#0f0f0f',
          950: '#0a0a0a',
        },
        daniels: {
          highlight: '#2a2a2a', // Dark Gray for subtle highlights
          dark: '#000000',      // Pure Black
          charcoal: '#333333',  // Charcoal
          light: '#f4f4f4',     // Off-white
          white: '#ffffff',     // Pure White
        }
      },
      fontFamily: {
        'script': ['"Great Vibes"', 'cursive'],
        'sans': ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glowPulse: {
          '0%, 100%': { borderColor: 'rgba(255, 255, 255, 0.2)' },
          '50%': { borderColor: 'rgba(255, 255, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'card-gradient': 'linear-gradient(145deg, #131313 0%, #0a0a0a 100%)',
      }
    },
  },
  plugins: [],
};