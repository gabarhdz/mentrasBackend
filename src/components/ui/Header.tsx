import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { languageOptions, type Language, usePreferences } from '@/lib/preferences'

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { language, setLanguage } = usePreferences()
  const texts: Record<Language, { pymes: string; learning: string; tools: string; dashboard: string; blog: string; settings: string; profile: string; language: string }> = {
    es: { pymes: 'Pymes', learning: 'Aprendizaje', tools: 'Herramientas', dashboard: 'Dashboard', blog: 'Blog', settings: 'Opciones', profile: 'Ir a mi perfil', language: 'Idioma' },
    en: { pymes: 'Businesses', learning: 'Learning', tools: 'Tools', dashboard: 'Dashboard', blog: 'Blog', settings: 'Settings', profile: 'My profile', language: 'Language' },
    pt: { pymes: 'Empresas', learning: 'Aprendizagem', tools: 'Ferramentas', dashboard: 'Painel', blog: 'Blog', settings: 'Opções', profile: 'Meu perfil', language: 'Idioma' },
    fr: { pymes: 'Entreprises', learning: 'Apprentissage', tools: 'Outils', dashboard: 'Tableau de bord', blog: 'Blog', settings: 'Paramètres', profile: 'Mon profil', language: 'Langue' },
    de: { pymes: 'Unternehmen', learning: 'Lernen', tools: 'Werkzeuge', dashboard: 'Dashboard', blog: 'Blog', settings: 'Einstellungen', profile: 'Mein Profil', language: 'Sprache' },
    it: { pymes: 'Imprese', learning: 'Apprendimento', tools: 'Strumenti', dashboard: 'Dashboard', blog: 'Blog', settings: 'Impostazioni', profile: 'Il mio profilo', language: 'Lingua' },
    ru: { pymes: 'Компании', learning: 'Обучение', tools: 'Инструменты', dashboard: 'Панель', blog: 'Блог', settings: 'Настройки', profile: 'Мой профиль', language: 'Язык' },
    zh: { pymes: '企业', learning: '学习', tools: '工具', dashboard: '仪表板', blog: '博客', settings: '设置', profile: '我的资料', language: '语言' },
    ja: { pymes: '企業', learning: '学習', tools: 'ツール', dashboard: 'ダッシュボード', blog: 'ブログ', settings: '設定', profile: 'プロフィール', language: '言語' },
    ar: { pymes: 'الشركات', learning: 'التعلم', tools: 'الأدوات', dashboard: 'لوحة التحكم', blog: 'المدونة', settings: 'الإعدادات', profile: 'ملفي الشخصي', language: 'اللغة' },
    hi: { pymes: 'व्यवसाय', learning: 'सीखना', tools: 'उपकरण', dashboard: 'डैशबोर्ड', blog: 'ब्लॉग', settings: 'सेटिंग्स', profile: 'मेरी प्रोफ़ाइल', language: 'भाषा' },
    nl: { pymes: 'Bedrijven', learning: 'Leren', tools: 'Tools', dashboard: 'Dashboard', blog: 'Blog', settings: 'Instellingen', profile: 'Mijn profiel', language: 'Taal' },
  }
  const text = texts[language]
  const navItems = [
    { label: text.pymes, to: '/pymes' },
    { label: text.learning, to: '/aprendizaje' },
    { label: text.tools, to: '/herramientas' },
    { label: text.dashboard, to: '/dashboard' },
    { label: text.blog, to: '/blog' },
    { label: text.settings, to: '/settings' },
  ]

  return (
    <nav className="relative flex items-center justify-between border-b border-border/70 bg-background/90 px-6 py-4 font-sans text-foreground backdrop-blur md:px-12 lg:px-24 xl:px-40 z-10000">
      <Link to="/" className="shrink-0 text-primary transition-opacity hover:opacity-90" aria-label="Mentras home">
       <p className='text-5xl'>Mentras</p>
      </Link>

      <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-1 py-1 shadow-sm md:flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'border border-primary/15 bg-primary/10 font-medium text-primary hover:text-primary/80'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <label className="sr-only" htmlFor="site-language">{text.language}</label>
        <select
          id="site-language"
          value={language}
          className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground outline-none transition hover:border-primary/35"
          onChange={(event) => setLanguage(event.target.value as Language)}
        >
          {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.flag} {option.shortLabel}</option>)}
        </select>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2.5 rounded-full border-0 bg-linear-to-r from-accent to-primary py-2 pl-5 pr-2 text-sm font-medium text-primary-foreground shadow-lg shadow-accent/20 transition-[background-image,background-color,box-shadow] duration-300 ease-out hover:bg-accent hover:bg-none hover:shadow-accent/30"
        >
          {text.profile}
          <span className="flex size-7 items-center justify-center rounded-full bg-white">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex flex-col gap-1.5 border-0 bg-transparent p-1 md:hidden"
      >
        <span className={`block h-0.5 w-6 bg-foreground transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}></span>
        <span className={`block h-0.5 w-6 bg-foreground transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block h-0.5 w-6 bg-foreground transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}></span>
      </button>

      {menuOpen && (
        <div className="absolute left-0 top-full z-50 flex w-full flex-col gap-1 border-t border-border bg-background/95 p-5 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2.5 text-sm ${
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <select
            aria-label={text.language}
            value={language}
            className="mt-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none"
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.flag} {option.shortLabel}</option>)}
          </select>
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="mt-3 flex w-fit items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-accent to-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-accent/20 transition-[background-image,background-color,box-shadow] duration-300 ease-out hover:bg-accent hover:bg-none hover:shadow-accent/30"
          >
            {text.profile}
            <span className="flex size-7 items-center justify-center rounded-full bg-white">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M.6 4.602h10m-4-4 4 4-4 4" stroke="#3f3f47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Header
