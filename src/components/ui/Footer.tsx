import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const footerGroups = [
  {
    title: 'footer.explore',
    links: [
      { label: 'footer.home', to: '/' },
      { label: 'nav.pymes', to: '/pymes' },
      { label: 'nav.learning', to: '/aprendizaje' },
      { label: 'nav.tools', to: '/herramientas' },
    ],
  },
  {
    title: 'footer.resources',
    links: [
      { label: 'nav.blog', to: '/blog' },
      { label: 'footer.contact', to: '/contacto' },
    ],
  },
  {
    title: 'footer.legal',
    links: [
      { label: 'footer.privacy', to: '/privacidad' },
      { label: 'footer.terms', to: '/terminos' },
    ],
  },
]

const currentYear = new Date().getFullYear()

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border/70 bg-card/70 px-6 py-12 backdrop-blur md:px-12 lg:px-24 xl:px-40">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.85fr]">
        <div className="space-y-4">
          <Link to="/" className="inline-block text-4xl font-semibold tracking-tight text-primary">
            Mentras
          </Link>
          <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            {t('Herramientas, aprendizaje y estructura digital para pymes que quieren crecer con mas claridad.')}
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-foreground">
              {t(group.title)}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link className="transition-colors hover:text-foreground" to={link.to}>
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {currentYear} Mentras</p>
        <p>{t('Base digital para pymes que necesitan orden, presencia y seguimiento.')}</p>
      </div>
    </footer>
  )
}

export default Footer
