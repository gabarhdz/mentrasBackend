import Header from '@/components/ui/Header'
import { Check, Globe2, Moon, Sun } from 'lucide-react'
import { type Language, type Theme, usePreferences } from '@/lib/preferences'

const copy = {
  es: {
    title: 'Opciones', description: 'Personaliza cómo se muestra Mentras en todos tus dispositivos.',
    language: 'Idioma', languageDetail: 'Define el idioma de navegación y de las pantallas compartidas.',
    appearance: 'Apariencia', appearanceDetail: 'El tema seleccionado se aplica a toda la web.',
    spanish: 'Español', english: 'English', light: 'Modo claro', dark: 'Modo oscuro', active: 'Activo',
  },
  en: {
    title: 'Settings', description: 'Customize how Mentras is displayed across the entire website.',
    language: 'Language', languageDetail: 'Set the language used in navigation and shared screens.',
    appearance: 'Appearance', appearanceDetail: 'Your selected theme applies across the entire website.',
    spanish: 'Español', english: 'English', light: 'Light mode', dark: 'Dark mode', active: 'Active',
  },
  pt: {
    title: 'Opções', description: 'Personalize como o Mentras é exibido em todo o site.',
    language: 'Idioma', languageDetail: 'Defina o idioma usado na navegação e nas telas compartilhadas.',
    appearance: 'Aparência', appearanceDetail: 'O tema selecionado é aplicado em todo o site.',
    spanish: 'Español', english: 'English', light: 'Modo claro', dark: 'Modo escuro', active: 'Ativo',
  },
  fr: {
    title: 'Paramètres', description: 'Personnalisez l’affichage de Mentras sur l’ensemble du site.',
    language: 'Langue', languageDetail: 'Définissez la langue utilisée dans la navigation et les écrans partagés.',
    appearance: 'Apparence', appearanceDetail: 'Le thème sélectionné s’applique à l’ensemble du site.',
    spanish: 'Español', english: 'English', light: 'Mode clair', dark: 'Mode sombre', active: 'Actif',
  },
}

const Settings = () => {
  const { language, setLanguage, theme, setTheme } = usePreferences()
  const t = copy[language]
  const optionClass = (active: boolean) => `flex items-center justify-between rounded-2xl border p-4 text-left transition ${active ? 'border-primary bg-primary/10 text-foreground' : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/30'}`

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="rounded-[2rem] border border-border/70 bg-card/92 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Mentras</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t.description}</p>

          <section className="mt-8">
            <div className="flex items-center gap-3"><Globe2 className="size-5 text-primary" /><div><h2 className="font-semibold">{t.language}</h2><p className="text-sm text-muted-foreground">{t.languageDetail}</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([['es', '🇪🇸', t.spanish], ['en', '🇺🇸', t.english], ['pt', '🇧🇷', 'Português'], ['fr', '🇫🇷', 'Français']] as [Language, string, string][]).map(([value, flag, label]) => <button key={value} type="button" className={optionClass(language === value)} onClick={() => setLanguage(value)}><span className="flex items-center gap-3"><span className="text-xl" role="img" aria-label={label}>{flag}</span>{label}</span>{language === value ? <Check className="size-5 text-primary" /> : null}</button>)}
            </div>
          </section>

          <section className="mt-8 border-t border-border/70 pt-8">
            <div className="flex items-center gap-3"><Sun className="size-5 text-primary" /><div><h2 className="font-semibold">{t.appearance}</h2><p className="text-sm text-muted-foreground">{t.appearanceDetail}</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([['light', t.light, Sun], ['dark', t.dark, Moon]] as [Theme, string, typeof Sun][]).map(([value, label, Icon]) => <button key={value} type="button" className={optionClass(theme === value)} onClick={() => setTheme(value)}><span className="flex items-center gap-2"><Icon className="size-4" />{label}</span>{theme === value ? <Check className="size-5 text-primary" /> : null}</button>)}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Settings
  
