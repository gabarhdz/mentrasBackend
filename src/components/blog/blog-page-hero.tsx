import { BookOpenText, Globe2, ImagePlus, LockKeyhole, MessageSquareMore, Sparkles } from 'lucide-react'

import type { ForumRecord } from '@/components/blog/blog-types'
import { SectionHeading } from '@/components/ui/section-heading'

type BlogPageHeroProps = {
  activeForum: ForumRecord | null
  forumCount: number
  postCount: number
  visualPostCount: number
}

const formatForumDate = (value: string) => {
  if (!value) {
    return 'Disponible para nuevas conversaciones'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Disponible para nuevas conversaciones'
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

export function BlogPageHero({
  activeForum,
  forumCount,
  postCount,
  visualPostCount,
}: BlogPageHeroProps) {
  const forumProfileImage = activeForum?.profilePic?.trim() ?? ''
  const hasForumImage = forumProfileImage.length > 0
  const forumCreatedLabel = formatForumDate(activeForum?.createdAt ?? '')
  const stats = [
    {
      label: 'Foros visibles',
      value: String(forumCount),
      detail: 'Espacios disponibles para leer, participar y abrir nuevas conversaciones.',
    },
    {
      label: 'Posts cargados',
      value: String(postCount),
      detail: 'Publicaciones recientes integradas en la experiencia del blog comunitario.',
    },
    {
      label: 'Posts con fotos',
      value: String(visualPostCount),
      detail: 'La galeria admite cero, una o hasta cuatro imagenes por publicacion.',
    },
  ]

  return (
    <section className="rounded-[2rem] border border-border/70 bg-linear-to-br from-background via-card to-primary/8 p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/95 shadow-sm">
          {hasForumImage ? (
            <div className="flex min-h-[250px] flex-col justify-center gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <img
                src={forumProfileImage}
                alt={activeForum ? `Imagen principal del foro ${activeForum.name}` : 'Imagen del foro'}
                className="size-24 shrink-0 self-center rounded-full border-4 border-background object-cover object-center shadow-md sm:size-28 sm:self-auto"
              />
              <div className="min-w-0 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="size-3.5" />
                  Foto de perfil del foro
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {activeForum?.name ?? 'Comunidad abierta'}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {activeForum?.description ??
                    'Selecciona un foro para dejar claro el contexto de lectura y publicacion.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[250px] flex-col justify-between bg-linear-to-br from-primary/14 via-background to-secondary/16 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="size-4" />
                Espacio curado para conversaciones con contexto
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Foro activo
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {activeForum?.name ?? 'Comunidad abierta'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Enfoque visual
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Usa portada del foro cuando exista. Si no, esta cabecera conserva orientacion y densidad informativa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background/70 p-5 sm:p-6">
          <SectionHeading
            badge={activeForum ? `Foro actual: ${activeForum.name}` : 'Foros'}
            title={activeForum ? activeForum.name : 'Explora las conversaciones de la comunidad'}
            description={
              activeForum
                ? activeForum.description
                : 'Selecciona un foro para dejar claro el contexto de lectura y publicacion. Cada post mantiene autoria visible y una galeria flexible de hasta cuatro fotos.'
            }
            className="max-w-none space-y-3"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border/70 bg-card/90 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                {activeForum?.isPrivate ? (
                  <LockKeyhole className="size-4 text-primary" />
                ) : (
                  <Globe2 className="size-4 text-primary" />
                )}
                {activeForum?.isPrivate ? 'Acceso privado' : 'Acceso abierto'}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activeForum?.isPrivate
                  ? 'La conversacion ocurre en un espacio mas controlado y orientado a miembros concretos.'
                  : 'La lectura y participacion se entienden rapido desde la cabecera y el feed principal.'}
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-border/70 bg-card/90 p-4">
              <p className="text-sm font-medium text-foreground">Activo desde</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{forumCreatedLabel}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <MessageSquareMore className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">Foro activo visible</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                La cabecera deja claro donde estas leyendo o publicando en todo momento.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <ImagePlus className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">Galeria adaptable</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Las publicaciones pueden ir sin fotos o traer una, dos, tres o cuatro.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <BookOpenText className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">Lectura con estructura</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Directorio de foros, contexto actual y feed conviven en una sola vista clara.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
