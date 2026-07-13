import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createTranslator } from '../i18n'

const LangContext = createContext(null)
const LANG_KEY = 'cc_lang'

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'zh')

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const value = useMemo(() => {
    const t = createTranslator(lang)
    return {
      lang,
      setLang,
      toggleLang: () => setLang((prev) => (prev === 'zh' ? 'en' : 'zh')),
      t,
    }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang 必须在 LangProvider 内使用')
  return ctx
}
