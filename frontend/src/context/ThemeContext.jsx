import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { publicApi } from '../api/client'

const ThemeContext = createContext(null)
const DARK_KEY = 'cc_dark'

// 将 #RRGGBB 转为 "R G B" 空格分隔字符串，供 CSS 变量使用
export function hexToRgbTriplet(hex) {
  if (!hex) return null
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const int = parseInt(full, 16)
  if (Number.isNaN(int)) return null
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`
}

const RADIUS_MAP = {
  '直角 (0px)': '0px',
  '小圆角 (8px)': '0.5rem',
  '中圆角 (16px)': '1rem',
  '大圆角 (24px)': '1.5rem',
}

export function applyThemeVars(theme) {
  if (!theme) return
  const root = document.documentElement
  const primary = hexToRgbTriplet(theme.primary)
  const secondary = hexToRgbTriplet(theme.secondary)
  const accent = hexToRgbTriplet(theme.accent)
  if (primary) root.style.setProperty('--theme-primary', primary)
  if (secondary) root.style.setProperty('--theme-secondary', secondary)
  if (accent) root.style.setProperty('--theme-accent', accent)
  const radius = RADIUS_MAP[theme.radius] || '1rem'
  root.style.setProperty('--theme-radius', radius)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null)
  const [dark, setDark] = useState(() => localStorage.getItem(DARK_KEY) === '1')

  // 拉取后台主题配置并应用
  useEffect(() => {
    publicApi
      .theme()
      .then((data) => {
        setTheme(data)
        applyThemeVars(data)
      })
      .catch(() => {
        // 后端不可用时使用默认变量（index.css 已定义）
      })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem(DARK_KEY, dark ? '1' : '0')
  }, [dark])

  const value = useMemo(
    () => ({
      theme,
      dark,
      toggleDark: () => setDark((v) => !v),
      updateTheme: (t) => {
        setTheme(t)
        applyThemeVars(t)
      },
    }),
    [theme, dark]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return ctx
}
