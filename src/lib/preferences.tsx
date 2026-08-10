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
  { value: 'nl', flag: '🇳🇱', shortLabel: 'NL', label: 'Nederlands' },
] as const satisfies readonly { value: Language; flag: string; shortLabel: string; label: string }[]

type PreferencesContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  emailNotifications: boolean
  setEmailNotifications: (enabled: boolean) => void
  privateProfile: boolean
  setPrivateProfile: (enabled: boolean) => void
  compactMode: boolean
  setCompactMode: (enabled: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)
const THEME_KEY = 'mentras.theme'
const EMAIL_NOTIFICATIONS_KEY = 'mentras.email-notifications'
const PRIVATE_PROFILE_KEY = 'mentras.private-profile'
const COMPACT_MODE_KEY = 'mentras.compact-mode'
const readTheme = (): Theme => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
const readBoolean = (key: string, fallback: boolean) => {
  const value = localStorage.getItem(key)
  return value === null ? fallback : value === 'true'
}

export const getLocalizedCopy = <CopyMap extends Partial<Record<Language, unknown>>>(
  copy: CopyMap,
  language: Language,
) => (copy[language] ?? copy.es ?? copy.en ?? Object.values(copy)[0]) as CopyMap[keyof CopyMap]

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<Language>(i18n.language as Language)
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [emailNotifications, setEmailNotifications] = useState(() => readBoolean(EMAIL_NOTIFICATIONS_KEY, true))
  const [privateProfile, setPrivateProfile] = useState(() => readBoolean(PRIVATE_PROFILE_KEY, false))
  const [compactMode, setCompactMode] = useState(() => readBoolean(COMPACT_MODE_KEY, false))

  useEffect(() => {
    const syncLanguage = (nextLanguage: string) => setCurrentLanguage(nextLanguage as Language)
    i18n.on('languageChanged', syncLanguage)
    return () => i18n.off('languageChanged', syncLanguage)
  }, [])

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
    document.documentElement.dir = 'ltr'
  }, [language])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => localStorage.setItem(EMAIL_NOTIFICATIONS_KEY, String(emailNotifications)), [emailNotifications])
  useEffect(() => localStorage.setItem(PRIVATE_PROFILE_KEY, String(privateProfile)), [privateProfile])
  useEffect(() => {
    localStorage.setItem(COMPACT_MODE_KEY, String(compactMode))
    document.documentElement.classList.toggle('compact-mode', compactMode)
  }, [compactMode])

  return (
    <PreferencesContext.Provider value={{ language, setLanguage: (nextLanguage) => void i18n.changeLanguage(nextLanguage), theme, setTheme, emailNotifications, setEmailNotifications, privateProfile, setPrivateProfile, compactMode, setCompactMode }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext)
  if (!preferences) throw new Error('usePreferences must be used within PreferencesProvider')
  return preferences
}
