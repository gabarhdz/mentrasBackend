import Header from '@/components/ui/Header'
import { Check, Globe2, Moon, Sun } from 'lucide-react'
import { languageOptions, type Language, type Theme, usePreferences } from '@/lib/preferences'

const copy: Record<Language, {
  title: string; description: string; language: string; languageDetail: string; appearance: string; appearanceDetail: string; light: string; dark: string; active: string
}> = {
  es: {
    title: 'Opciones', description: 'Personaliza cómo se muestra Mentras en todos tus dispositivos.',
    language: 'Idioma', languageDetail: 'Define el idioma de navegación y de las pantallas compartidas.',
    appearance: 'Apariencia', appearanceDetail: 'El tema seleccionado se aplica a toda la web.',
    light: 'Modo claro', dark: 'Modo oscuro', active: 'Activo',
  },
  en: {
    title: 'Settings', description: 'Customize how Mentras is displayed across the entire website.',
    language: 'Language', languageDetail: 'Set the language used in navigation and shared screens.',
    appearance: 'Appearance', appearanceDetail: 'Your selected theme applies across the entire website.',
    light: 'Light mode', dark: 'Dark mode', active: 'Active',
  },
  pt: {
    title: 'Opções', description: 'Personalize como o Mentras é exibido em todo o site.',
    language: 'Idioma', languageDetail: 'Defina o idioma usado na navegação e nas telas compartilhadas.',
    appearance: 'Aparência', appearanceDetail: 'O tema selecionado é aplicado em todo o site.',
    light: 'Modo claro', dark: 'Modo escuro', active: 'Ativo',
  },
  fr: {
    title: 'Paramètres', description: 'Personnalisez l’affichage de Mentras sur l’ensemble du site.',
    language: 'Langue', languageDetail: 'Définissez la langue utilisée dans la navigation et les écrans partagés.',
    appearance: 'Apparence', appearanceDetail: 'Le thème sélectionné s’applique à l’ensemble du site.',
    light: 'Mode clair', dark: 'Mode sombre', active: 'Actif',
  },
  de: {
    title: 'Einstellungen', description: 'Passe an, wie Mentras auf der gesamten Website angezeigt wird.',
    language: 'Sprache', languageDetail: 'Lege die Sprache für Navigation und gemeinsame Ansichten fest.',
    appearance: 'Darstellung', appearanceDetail: 'Das ausgewählte Design gilt für die gesamte Website.',
    light: 'Heller Modus', dark: 'Dunkler Modus', active: 'Aktiv',
  },
  it: {
    title: 'Impostazioni', description: 'Personalizza come Mentras viene visualizzato in tutto il sito.',
    language: 'Lingua', languageDetail: 'Imposta la lingua usata nella navigazione e nelle schermate condivise.',
    appearance: 'Aspetto', appearanceDetail: 'Il tema selezionato si applica a tutto il sito.',
    light: 'Modalità chiara', dark: 'Modalità scura', active: 'Attivo',
  },
  ru: {
    title: 'Настройки', description: 'Настройте отображение Mentras на всем сайте.',
    language: 'Язык', languageDetail: 'Выберите язык навигации и общих экранов.',
    appearance: 'Внешний вид', appearanceDetail: 'Выбранная тема применяется ко всему сайту.',
    light: 'Светлый режим', dark: 'Темный режим', active: 'Активно',
  },
  zh: {
    title: '设置', description: '自定义 Mentras 在整个网站中的显示方式。',
    language: '语言', languageDetail: '设置导航和共享页面使用的语言。',
    appearance: '外观', appearanceDetail: '所选主题会应用到整个网站。',
    light: '浅色模式', dark: '深色模式', active: '已启用',
  },
  ja: {
    title: '設定', description: 'Mentras の表示方法をサイト全体でカスタマイズします。',
    language: '言語', languageDetail: 'ナビゲーションと共有画面で使う言語を設定します。',
    appearance: '外観', appearanceDetail: '選択したテーマはサイト全体に適用されます。',
    light: 'ライトモード', dark: 'ダークモード', active: '有効',
  },
  ar: {
    title: 'الإعدادات', description: 'خصّص طريقة عرض Mentras في كل الموقع.',
    language: 'اللغة', languageDetail: 'حدد لغة التنقل والشاشات المشتركة.',
    appearance: 'المظهر', appearanceDetail: 'يتم تطبيق النمط المحدد على الموقع بالكامل.',
    light: 'الوضع الفاتح', dark: 'الوضع الداكن', active: 'نشط',
  },
  hi: {
    title: 'सेटिंग्स', description: 'पूरी वेबसाइट पर Mentras कैसे दिखे, इसे अनुकूलित करें।',
    language: 'भाषा', languageDetail: 'नेविगेशन और साझा स्क्रीन में उपयोग की जाने वाली भाषा सेट करें।',
    appearance: 'दिखावट', appearanceDetail: 'चुनी गई थीम पूरी वेबसाइट पर लागू होती है।',
    light: 'लाइट मोड', dark: 'डार्क मोड', active: 'सक्रिय',
  },
  nl: {
    title: 'Instellingen', description: 'Pas aan hoe Mentras op de hele website wordt weergegeven.',
    language: 'Taal', languageDetail: 'Stel de taal in voor navigatie en gedeelde schermen.',
    appearance: 'Weergave', appearanceDetail: 'Het gekozen thema geldt voor de hele website.',
    light: 'Lichte modus', dark: 'Donkere modus', active: 'Actief',
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
              {languageOptions.map(({ value, flag, label }) => <button key={value} type="button" className={optionClass(language === value)} onClick={() => setLanguage(value)}><span className="flex items-center gap-3"><span className="text-xl" role="img" aria-label={label}>{flag}</span>{label}</span>{language === value ? <Check className="size-5 text-primary" /> : null}</button>)}
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
  
