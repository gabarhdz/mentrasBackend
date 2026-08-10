import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { translationCatalog } from '@/lib/ui-translations'
import sharedMessages from './shared'

export const supportedLanguages = ['es', 'en', 'pt', 'fr', 'de', 'it', 'nl'] as const
export type AppLanguage = (typeof supportedLanguages)[number]

export const LANGUAGE_STORAGE_KEY = 'mentras.language'
export const DEFAULT_LANGUAGE: AppLanguage = 'es'

const isSupportedLanguage = (value: string): value is AppLanguage =>
  (supportedLanguages as readonly string[]).includes(value)

export const getInitialLanguage = (): AppLanguage => {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (storedLanguage && isSupportedLanguage(storedLanguage)) return storedLanguage

  const browserLanguage = window.navigator.language.split('-')[0].toLowerCase()
  return isSupportedLanguage(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE
}

type CatalogEntry = Partial<Record<Exclude<AppLanguage, 'es'>, string>>

const createResources = () => {
  const resources = Object.fromEntries(
    supportedLanguages.map((language) => [language, { translation: {} as Record<string, string> }]),
  ) as Record<AppLanguage, { translation: Record<string, string> }>

  Object.entries(translationCatalog).forEach(([key, translations]) => {
    const entry = translations as CatalogEntry
    supportedLanguages.forEach((language) => {
      resources[language].translation[key] = language === 'es' ? key : entry[language] ?? entry.en ?? key
    })
  })

  supportedLanguages.forEach((language) => {
    Object.assign(resources[language].translation, sharedMessages[language])
  })

  Object.assign(resources.es.translation, {
    'pagination.page': 'Pagina {{current}} de {{total}}',
    'pymes.registeredSummary': 'Mostrando las primeras {{shown}} de {{total}} pymes registradas.',
    'pymes.teamSummary': 'Mostrando {{shown}} de {{total}} pymes de tu equipo.',
    'common.employees_one': '{{count}} empleado',
    'common.employees_other': '{{count}} empleados',
  })
  Object.assign(resources.en.translation, {
    'pagination.page': 'Page {{current}} of {{total}}',
    'pymes.registeredSummary': 'Showing the first {{shown}} of {{total}} registered businesses.',
    'pymes.teamSummary': 'Showing {{shown}} of {{total}} businesses from your team.',
    'common.employees_one': '{{count}} employee',
    'common.employees_other': '{{count}} employees',
  })

  return resources
}

void i18n.use(initReactI18next).init({
  resources: createResources(),
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  returnNull: false,
  keySeparator: false,
  nsSeparator: false,
})

export default i18n
