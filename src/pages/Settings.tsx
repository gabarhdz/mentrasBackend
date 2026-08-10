import { Bell, Check, Globe2, LockKeyhole, Moon, PanelTop, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Header from '@/components/ui/Header'
import { languageOptions, type Theme, usePreferences } from '@/lib/preferences'

const Settings = () => {
  const { language, setLanguage, theme, setTheme, emailNotifications, setEmailNotifications, privateProfile, setPrivateProfile, compactMode, setCompactMode } = usePreferences()
  const { t } = useTranslation()
  const optionClass = (active: boolean) =>
    `flex items-center justify-between rounded-2xl border p-4 text-left transition ${
      active
        ? 'border-primary bg-primary/10 text-foreground'
        : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/30'
    }`
  const toggleClass = (enabled: boolean) => `relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${enabled ? 'bg-primary' : 'bg-muted'}`

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

          <section className="mt-8 border-t border-border/70 pt-8">
            <div className="space-y-3">
              {[
                [Bell, 'Notificaciones por correo', 'Recibe avisos sobre actividad importante en tu cuenta.', emailNotifications, setEmailNotifications],
                [LockKeyhole, 'Perfil privado', 'Limita la visibilidad de la información de tu perfil.', privateProfile, setPrivateProfile],
                [PanelTop, 'Vista compacta', 'Reduce ligeramente el tamaño de la interfaz.', compactMode, setCompactMode],
              ].map(([Icon, title, description, enabled, setEnabled]) => {
                const PreferenceIcon = Icon as typeof Bell
                const isEnabled = enabled as boolean
                const update = setEnabled as (next: boolean) => void
                return <div key={title as string} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 p-4"><div className="flex gap-3"><PreferenceIcon className="mt-0.5 size-5 shrink-0 text-primary" /><div><h2 className="font-semibold">{title as string}</h2><p className="mt-1 text-sm text-muted-foreground">{description as string}</p></div></div><button type="button" role="switch" aria-checked={isEnabled} aria-label={title as string} onClick={() => update(!isEnabled)} className={toggleClass(isEnabled)}><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${isEnabled ? 'left-6' : 'left-1'}`} /></button></div>
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Settings
