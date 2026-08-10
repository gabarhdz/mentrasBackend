import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

export type Language = 'es' | 'en'
export type Theme = 'light' | 'dark'

type PreferencesContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)
const LANGUAGE_KEY = 'mentras.language'
const THEME_KEY = 'mentras.theme'

const readLanguage = (): Language => localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'es'
const readTheme = (): Theme => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

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
