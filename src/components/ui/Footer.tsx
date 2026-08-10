import { Link } from 'react-router-dom'
import { usePreferences } from '@/lib/preferences'

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
  const text = language === 'en'
    ? { description: 'Tools, learning and digital structure for small businesses that want to grow with clarity.', base: 'Digital foundation for businesses that need organization, presence and follow-up.' }
    : { description: 'Herramientas, aprendizaje y estructura digital para pymes que quieren crecer con mas claridad.', base: 'Base digital para pymes que necesitan orden, presencia y seguimiento.' }
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
