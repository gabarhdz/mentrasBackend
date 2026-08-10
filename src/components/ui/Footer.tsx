import { Link } from 'react-router-dom'
import { type Language, usePreferences } from '@/lib/preferences'

const footerGroups = [
  {
    title: 'Explorar',
    links: [
      { label: 'Inicio', to: '/' },
      { label: 'Pymes', to: '/pymes' },
      { label: 'Aprendizaje', to: '/aprendizaje' },
      { label: 'Herramientas', to: '/herramientas' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', to: '/privacidad' },
      { label: 'Terminos', to: '/terminos' },
    ],
  },
]

const currentYear = new Date().getFullYear()

const Footer = () => {
  const { language } = usePreferences()
  const texts: Record<Language, { description: string; base: string }> = {
    es: { description: 'Herramientas, aprendizaje y estructura digital para pymes que quieren crecer con mas claridad.', base: 'Base digital para pymes que necesitan orden, presencia y seguimiento.' },
    en: { description: 'Tools, learning and digital structure for small businesses that want to grow with clarity.', base: 'Digital foundation for businesses that need organization, presence and follow-up.' },
    pt: { description: 'Ferramentas, aprendizagem e estrutura digital para empresas que querem crescer com mais clareza.', base: 'Base digital para empresas que precisam de organização, presença e acompanhamento.' },
    fr: { description: 'Des outils, de l’apprentissage et une structure numérique pour les entreprises qui souhaitent se développer clairement.', base: 'Une base numérique pour les entreprises qui ont besoin d’organisation, de présence et de suivi.' },
    de: { description: 'Werkzeuge, Lernen und digitale Struktur für Unternehmen, die klarer wachsen möchten.', base: 'Digitale Basis für Unternehmen, die Ordnung, Präsenz und Nachverfolgung brauchen.' },
    it: { description: 'Strumenti, apprendimento e struttura digitale per imprese che vogliono crescere con più chiarezza.', base: 'Base digitale per imprese che hanno bisogno di ordine, presenza e follow-up.' },
    ru: { description: 'Инструменты, обучение и цифровая структура для компаний, которые хотят расти яснее.', base: 'Цифровая основа для компаний, которым нужны порядок, присутствие и сопровождение.' },
    zh: { description: '为希望更清晰成长的企业提供工具、学习和数字结构。', base: '为需要秩序、展示和跟进的企业提供数字基础。' },
    ja: { description: 'より明確に成長したい企業のためのツール、学習、デジタル構造。', base: '整理、存在感、フォローアップを必要とする企業のためのデジタル基盤。' },
    ar: { description: 'أدوات وتعلم وبنية رقمية للشركات التي تريد النمو بوضوح أكبر.', base: 'أساس رقمي للشركات التي تحتاج إلى تنظيم وحضور ومتابعة.' },
    hi: { description: 'उन व्यवसायों के लिए उपकरण, सीखना और डिजिटल संरचना जो अधिक स्पष्टता से बढ़ना चाहते हैं।', base: 'उन व्यवसायों के लिए डिजिटल आधार जिन्हें व्यवस्था, उपस्थिति और फ़ॉलो-अप चाहिए।' },
    nl: { description: 'Tools, leren en digitale structuur voor bedrijven die duidelijker willen groeien.', base: 'Digitale basis voor bedrijven die orde, aanwezigheid en opvolging nodig hebben.' },
  }
  const text = texts[language]
  return (
    <footer className="border-t border-border/70 bg-card/70 px-6 py-12 backdrop-blur md:px-12 lg:px-24 xl:px-40">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.85fr]">
        <div className="space-y-4">
          <Link to="/" className="inline-block text-4xl font-semibold tracking-tight text-primary">
            Mentras
          </Link>
          <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            {text.description}
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-foreground">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link className="transition-colors hover:text-foreground" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {currentYear} Mentras</p>
        <p>{text.base}</p>
      </div>
    </footer>
  )
}

export default Footer
