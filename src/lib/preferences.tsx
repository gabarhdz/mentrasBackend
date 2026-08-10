import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

import i18n, { LANGUAGE_STORAGE_KEY, type AppLanguage } from '@/i18n'

export type Language = AppLanguage
export type Theme = 'light' | 'dark'

export const languageOptions = [
  { value: 'es', flag: '🇪🇸', shortLabel: 'ES', label: 'Español' },
  { value: 'en', flag: '🇺🇸', shortLabel: 'EN', label: 'English' },
  { value: 'pt', flag: '🇧🇷', shortLabel: 'PT', label: 'Português' },
  { value: 'fr', flag: '🇫🇷', shortLabel: 'FR', label: 'Français' },
  { value: 'de', flag: '🇩🇪', shortLabel: 'DE', label: 'Deutsch' },
  { value: 'it', flag: '🇮🇹', shortLabel: 'IT', label: 'Italiano' },
  { value: 'ru', flag: '🇷🇺', shortLabel: 'RU', label: 'Русский' },
  { value: 'zh', flag: '🇨🇳', shortLabel: 'ZH', label: '中文' },
  { value: 'ja', flag: '🇯🇵', shortLabel: 'JA', label: '日本語' },
  { value: 'ar', flag: '🇸🇦', shortLabel: 'AR', label: 'العربية' },
  { value: 'hi', flag: '🇮🇳', shortLabel: 'HI', label: 'हिन्दी' },
  { value: 'nl', flag: '🇳🇱', shortLabel: 'NL', label: 'Nederlands' },
] as const satisfies readonly { value: Language; flag: string; shortLabel: string; label: string }[]

type PreferencesContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)
const THEME_KEY = 'mentras.theme'
const readTheme = (): Theme => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'

export const getLocalizedCopy = <CopyMap extends Partial<Record<Language, unknown>>>(
  copy: CopyMap,
  language: Language,
) => (copy[language] ?? copy.es ?? copy.en ?? Object.values(copy)[0]) as CopyMap[keyof CopyMap]

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<Language>(i18n.language as Language)
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const syncLanguage = (nextLanguage: string) => setCurrentLanguage(nextLanguage as Language)
    i18n.on('languageChanged', syncLanguage)
    return () => i18n.off('languageChanged', syncLanguage)
  }, [])

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <PreferencesContext.Provider value={{ language, setLanguage: (nextLanguage) => void i18n.changeLanguage(nextLanguage), theme, setTheme }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext)
  if (!preferences) throw new Error('usePreferences must be used within PreferencesProvider')
  return preferences
}
