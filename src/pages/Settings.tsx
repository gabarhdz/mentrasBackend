import { Check, Globe2, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Header from '@/components/ui/Header'
import { languageOptions, type Theme, usePreferences } from '@/lib/preferences'

const Settings = () => {
  const { language, setLanguage, theme, setTheme } = usePreferences()
  const { t } = useTranslation()
  const optionClass = (active: boolean) =>
    `flex items-center justify-between rounded-2xl border p-4 text-left transition ${
      active
        ? 'border-primary bg-primary/10 text-foreground'
        : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/30'
    }`

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="rounded-[2rem] border border-border/70 bg-card/92 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Mentras</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t('settings.title')}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t('settings.description')}</p>

          <section className="mt-8">
            <div className="flex items-center gap-3">
              <Globe2 className="size-5 text-primary" />
              <div><h2 className="font-semibold">{t('nav.language')}</h2><p className="text-sm text-muted-foreground">{t('settings.languageDetail')}</p></div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {languageOptions.map(({ value, flag, label }) => (
                <button key={value} type="button" className={optionClass(language === value)} onClick={() => setLanguage(value)}>
                  <span className="flex items-center gap-3"><span className="text-xl" role="img" aria-label={label}>{flag}</span>{label}</span>
                  {language === value ? <Check className="size-5 text-primary" /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-border/70 pt-8">
            <div className="flex items-center gap-3">
              <Sun className="size-5 text-primary" />
              <div><h2 className="font-semibold">{t('settings.appearance')}</h2><p className="text-sm text-muted-foreground">{t('settings.appearanceDetail')}</p></div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([['light', 'theme.light', Sun], ['dark', 'theme.dark', Moon]] as [Theme, string, typeof Sun][]).map(([value, labelKey, Icon]) => (
                <button key={value} type="button" className={optionClass(theme === value)} onClick={() => setTheme(value)}>
                  <span className="flex items-center gap-2"><Icon className="size-4" />{t(labelKey)}</span>
                  {theme === value ? <Check className="size-5 text-primary" /> : null}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Settings
