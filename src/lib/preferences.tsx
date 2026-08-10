import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { startUiTranslationObserver } from '@/lib/ui-translations'

export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'ru' | 'zh' | 'ja' | 'ar' | 'hi' | 'nl'
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

const supportedLanguageValues = new Set<Language>(languageOptions.map((option) => option.value))

type PreferencesContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)
const LANGUAGE_KEY = 'mentras.language'
const THEME_KEY = 'mentras.theme'

const readLanguage = (): Language => {
  const storedLanguage = localStorage.getItem(LANGUAGE_KEY)
  return supportedLanguageValues.has(storedLanguage as Language) ? (storedLanguage as Language) : 'es'
}
const readTheme = (): Theme => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'

export const getLocalizedCopy = <CopyMap extends Partial<Record<Language, unknown>>>(
  copy: CopyMap,
  language: Language,
) => (copy[language] ?? copy.es ?? copy.en ?? Object.values(copy)[0]) as CopyMap[keyof CopyMap]

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => startUiTranslationObserver(language), [language])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext)
  if (!preferences) throw new Error('usePreferences must be used within PreferencesProvider')
  return preferences
}
