/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 主题色通过 CSS 变量注入，支持后台动态切换
        theme: {
          primary: 'rgb(var(--theme-primary) / <alpha-value>)',
          secondary: 'rgb(var(--theme-secondary) / <alpha-value>)',
          accent: 'rgb(var(--theme-accent) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'theme-gradient':
          'linear-gradient(135deg, rgb(var(--theme-primary)), rgb(var(--theme-secondary)))',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 38, 135, 0.08)',
        'glass-lg': '0 20px 50px rgba(31, 38, 135, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}
