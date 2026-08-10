import { useEffect, useState } from 'react'
import { ArrowRight, BarChart3, BookOpen, FolderPlus, Layers3, LoaderCircle, PlayCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { countLessons } from '@/components/learning/course-learning-types'
import type { UnitSummary } from '@/components/learning/course-learning-types'
import Footer from '@/components/ui/Footer'
import Header from '@/components/ui/Header'
import { authFetch, clearAuthTokens, getStoredUserId, hasStoredSession } from '@/lib/auth'
import { getLocalizedCopy, usePreferences } from '@/lib/preferences'
import { buildBackendUrl } from '@/lib/utils'

type UserProfile = {
  id?: string
  is_mentor?: boolean
  username?: string
}
type CourseSummary = {
  id?: string
  name?: string
  description?: string
  author_username?: string
  units?: UnitSummary[]
}

const COURSES_PER_PAGE = 6
const MAX_VISUAL_BAR_HEIGHT = 88

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toCourseArray = (value: unknown): CourseSummary[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isRecord) as CourseSummary[]
}

const normalizeCoursesResponse = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return toCourseArray(payload)
  }

  if (!isRecord(payload)) {
    return []
  }

  const possibleLists = [payload.results, payload.data, payload.items, payload.courses]

  for (const candidate of possibleLists) {
    if (Array.isArray(candidate)) {
      return toCourseArray(candidate)
    }
  }

  return []
}

const getVisualBarHeight = (value: number, multiplier: number) =>
  Math.max(24, Math.min(MAX_VISUAL_BAR_HEIGHT, value * multiplier))

const copy = {
  es: {
    badge: 'Aprendizaje',
    title: 'Explora los cursos y entra al contenido desde una vista mucho mas clara',
    description:
      'Revisa el catalogo completo y abre cualquier curso para navegar sus unidades y lecciones en una pagina dedicada.',
    createCourses: 'Crear cursos',
    createHelp: 'Tambien podras crear unidades y lecciones desde ese menu.',
    readOnly:
      'Tu cuenta esta en modo lectura. Si luego recibe permisos de creador, aqui veras el acceso para administrar cursos.',
    flow: 'Flujo',
    flowTitle: 'Como se organiza',
    flowItems: [
      'Curso: define el contenido principal.',
      'Unidad: divide el curso en bloques claros.',
      'Leccion: agrega video, texto y material de apoyo.',
    ],
    catalog: 'Catalogo',
    availableCourses: 'Cursos disponibles',
    catalogDescription: 'Abre cualquier curso para ver su estructura completa y avanzar por sus lecciones.',
    emptyCourses: 'Todavia no hay cursos disponibles para mostrar.',
    unnamedCourse: 'Curso sin nombre',
    noDescription: 'Este curso aun no tiene descripcion.',
    units: 'unidades',
    lessons: 'lecciones',
    by: 'Por',
    quickView: 'Vista rapida',
    courseStructure: 'Estructura del curso',
    page: 'Pagina',
    of: 'de',
    previous: 'Anterior',
    next: 'Siguiente',
    loading: 'Cargando tu espacio de aprendizaje...',
    errorTitle: 'No pudimos abrir Aprendizaje',
  },
  en: {
    badge: 'Learning',
    title: 'Explore courses and open content from a much clearer view',
    description:
      'Review the full catalog and open any course to browse its units and lessons on a dedicated page.',
    createCourses: 'Create courses',
    createHelp: 'You will also be able to create units and lessons from that menu.',
    readOnly:
      'Your account is in read-only mode. If it later receives creator permissions, you will see access to manage courses here.',
    flow: 'Flow',
    flowTitle: 'How it is organized',
    flowItems: [
      'Course: defines the main content.',
      'Unit: divides the course into clear blocks.',
      'Lesson: adds video, text and support material.',
    ],
    catalog: 'Catalog',
    availableCourses: 'Available courses',
    catalogDescription: 'Open any course to see its full structure and move through its lessons.',
    emptyCourses: 'There are no courses available to show yet.',
    unnamedCourse: 'Unnamed course',
    noDescription: 'This course does not have a description yet.',
    units: 'units',
    lessons: 'lessons',
    by: 'By',
    quickView: 'Quick view',
    courseStructure: 'Course structure',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    loading: 'Loading your learning space...',
    errorTitle: 'We could not open Learning',
  },
  pt: {
    badge: 'Aprendizagem',
    title: 'Explore cursos e acesse o conteudo em uma vista muito mais clara',
    description:
      'Revise o catalogo completo e abra qualquer curso para navegar por unidades e aulas em uma pagina dedicada.',
    createCourses: 'Criar cursos',
    createHelp: 'Voce tambem podera criar unidades e aulas a partir desse menu.',
    readOnly:
      'Sua conta esta em modo leitura. Se receber permissoes de criador depois, voce vera aqui o acesso para administrar cursos.',
    flow: 'Fluxo',
    flowTitle: 'Como se organiza',
    flowItems: [
      'Curso: define o conteudo principal.',
      'Unidade: divide o curso em blocos claros.',
      'Aula: adiciona video, texto e material de apoio.',
    ],
    catalog: 'Catalogo',
    availableCourses: 'Cursos disponiveis',
    catalogDescription: 'Abra qualquer curso para ver sua estrutura completa e avancar pelas aulas.',
    emptyCourses: 'Ainda nao ha cursos disponiveis para mostrar.',
    unnamedCourse: 'Curso sem nome',
    noDescription: 'Este curso ainda nao tem descricao.',
    units: 'unidades',
    lessons: 'aulas',
    by: 'Por',
    quickView: 'Vista rapida',
    courseStructure: 'Estrutura do curso',
    page: 'Pagina',
    of: 'de',
    previous: 'Anterior',
    next: 'Proxima',
    loading: 'Carregando seu espaco de aprendizagem...',
    errorTitle: 'Nao foi possivel abrir Aprendizagem',
  },
  fr: {
    badge: 'Apprentissage',
    title: 'Explorez les cours et ouvrez le contenu dans une vue beaucoup plus claire',
    description:
      'Consultez le catalogue complet et ouvrez n importe quel cours pour parcourir ses unites et lecons dans une page dediee.',
    createCourses: 'Creer des cours',
    createHelp: 'Vous pourrez aussi creer des unites et des lecons depuis ce menu.',
    readOnly:
      'Votre compte est en mode lecture. S il recoit plus tard des droits de creation, vous verrez ici l acces pour gerer les cours.',
    flow: 'Flux',
    flowTitle: 'Organisation',
    flowItems: [
      'Cours: definit le contenu principal.',
      'Unite: divise le cours en blocs clairs.',
      'Lecon: ajoute video, texte et support.',
    ],
    catalog: 'Catalogue',
    availableCourses: 'Cours disponibles',
    catalogDescription: 'Ouvrez n importe quel cours pour voir sa structure complete et avancer dans ses lecons.',
    emptyCourses: 'Aucun cours disponible pour le moment.',
    unnamedCourse: 'Cours sans nom',
    noDescription: 'Ce cours n a pas encore de description.',
    units: 'unites',
    lessons: 'lecons',
    by: 'Par',
    quickView: 'Vue rapide',
    courseStructure: 'Structure du cours',
    page: 'Page',
    of: 'sur',
    previous: 'Precedent',
    next: 'Suivant',
    loading: 'Chargement de votre espace d apprentissage...',
    errorTitle: 'Impossible d ouvrir Apprentissage',
  },
} as const

const getResponseErrorMessage = async (response: Response, fallbackMessage: string) => {
  try {
    const data = await response.json()

    if (typeof data.detail === 'string') {
      return data.detail
    }

    if (typeof data.message === 'string') {
      return data.message
    }

    if (typeof data.error === 'string') {
      return data.error
    }

    if (isRecord(data)) {
      const firstEntry = Object.entries(data)[0]

      if (firstEntry) {
        const [, value] = firstEntry

        if (Array.isArray(value) && typeof value[0] === 'string') {
          return value[0]
        }

        if (typeof value === 'string') {
          return value
        }
      }
    }

    return fallbackMessage
  } catch {
    return fallbackMessage
  }
}

const redirectToAuth = () => {
  clearAuthTokens()
  window.location.href = '/auth'
}

const ensureSuccessfulResponse = async (response: Response, fallbackMessage: string) => {
  if (response.status === 401) {
    redirectToAuth()
    throw new Error('Tu sesion vencio. Inicia sesion otra vez.')
  }

  if (!response.ok) {
    throw new Error(await getResponseErrorMessage(response, fallbackMessage))
  }

  return response
}

const fetchUserProfile = async (userId: string) => {
  const response = await authFetch(buildBackendUrl(`/api/user/${userId}/`))
  await ensureSuccessfulResponse(response, 'No se pudo cargar tu perfil.')
  return (await response.json()) as UserProfile
}

const fetchCourses = async () => {
  const response = await authFetch(buildBackendUrl('/api/learning/courses/'))
  await ensureSuccessfulResponse(response, 'No se pudieron cargar los cursos disponibles.')
  const data = await response.json()
  return normalizeCoursesResponse(data)
}

export default function AprendizajeCatalogo() {
  const { language } = usePreferences()
  const t = getLocalizedCopy(copy, language)
  const userId = getStoredUserId()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [currentCatalogPage, setCurrentCatalogPage] = useState(1)

  const totalCatalogPages = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE))
  const paginatedCourses = courses.slice(
    (currentCatalogPage - 1) * COURSES_PER_PAGE,
    currentCatalogPage * COURSES_PER_PAGE,
  )
  const canCreateCourses = Boolean(user?.is_mentor)

  useEffect(() => {
    if (!hasStoredSession()) {
      redirectToAuth()
      return
    }

    if (!userId) {
      setIsLoadingUser(false)
      setPageError('No pudimos identificar tu cuenta para cargar esta seccion.')
      return
    }

    const loadUser = async () => {
      try {
        setIsLoadingUser(true)
        setPageError(null)
        const profile = await fetchUserProfile(userId)
        setUser(profile)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar tu perfil en este momento.'
        setPageError(message)
      } finally {
        setIsLoadingUser(false)
      }
    }

    void loadUser()
  }, [userId])

  useEffect(() => {
    if (!user) {
      return
    }

    const loadCourses = async () => {
      try {
        setIsLoadingCourses(true)
        setCoursesError(null)
        const nextCourses = await fetchCourses()
        setCourses(nextCourses)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudieron cargar los cursos disponibles.'

        if (message !== 'Tu sesion vencio. Inicia sesion otra vez.') {
          setCourses([])
          setCoursesError(message)
        }
      } finally {
        setIsLoadingCourses(false)
      }
    }

    void loadCourses()
  }, [user])

  useEffect(() => {
    setCurrentCatalogPage((currentPage) => Math.min(currentPage, totalCatalogPages))
  }, [totalCatalogPages])

  const renderCatalogPagination = () => {
    if (totalCatalogPages <= 1) {
      return null
    }

    return (
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t.page} {currentCatalogPage} {t.of} {totalCatalogPages}
        </p>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentCatalogPage === 1}
            type="button"
            onClick={() => setCurrentCatalogPage((page) => Math.max(1, page - 1))}
          >
            {t.previous}
          </button>
          <button
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentCatalogPage === totalCatalogPages}
            type="button"
            onClick={() => setCurrentCatalogPage((page) => Math.min(totalCatalogPages, page + 1))}
          >
            {t.next}
          </button>
        </div>
      </div>
    )
  }

  if (isLoadingUser) {
    return (
      <main className="relative min-h-screen overflow-hidden text-foreground">
        <Header />
        <section className="px-6 py-14 md:px-12 lg:px-24 xl:px-40">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {t.loading}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  if (pageError) {
    return (
      <main className="relative min-h-screen overflow-hidden text-foreground">
        <Header />
        <section className="px-6 py-14 md:px-12 lg:px-24 xl:px-40">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-accent/25 bg-card/90 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{t.errorTitle}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{pageError}</p>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <Header />

      <section className="relative px-6 py-14 md:px-12 lg:px-24 xl:px-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-primary/8 via-secondary/6 to-transparent" />
        <div className="pointer-events-none absolute left-0 top-24 -z-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 -z-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_28px_80px_-46px_rgba(0,137,123,0.45)] backdrop-blur">
            <div className="grid gap-8 px-7 py-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium tracking-[0.24em] text-primary uppercase">
                  <BookOpen className="h-3.5 w-3.5" />
                  {t.badge}
                </div>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                  {t.title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                  {t.description}
                </p>

                {canCreateCourses ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/92"
                      to="/aprendizaje/crear"
                    >
                      <FolderPlus className="h-4 w-4" />
                      {t.createCourses}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t.createHelp}
                    </span>
                  </div>
                ) : (
                  <div className="mt-6 inline-flex rounded-[1.5rem] border border-border/70 bg-background/70 px-5 py-4 text-sm leading-6 text-muted-foreground">
                    {t.readOnly}
                  </div>
                )}
              </div>

              <aside className="rounded-[1.75rem] border border-border/70 bg-background/75 p-5">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  {t.flow}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{t.flowTitle}</h2>
                <div className="mt-4 space-y-3">
                  {t.flowItems.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-card/92 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  {t.catalog}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{t.availableCourses}</h2>
              </div>
              {isLoadingCourses ? <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t.catalogDescription}
            </p>

            {coursesError ? (
              <div className="mt-4 rounded-[1.5rem] border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
                {coursesError}
              </div>
            ) : null}

            {!courses.length && !isLoadingCourses ? (
              <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                {t.emptyCourses}
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {paginatedCourses.map((course) => {
                    const unitCount = course.units?.length ?? 0
                    const lessonCount = countLessons(course.units)
                    const unitBarHeight = getVisualBarHeight(unitCount, 18)
                    const lessonBarHeight = getVisualBarHeight(lessonCount, 8)

                    return (
                      <Link
                        key={course.id ?? course.name}
                        className="block rounded-[1.5rem] border border-border/70 bg-background/70 p-4 transition-colors hover:border-primary/30 hover:bg-primary/6"
                        to={`/aprendizaje/cursos/${course.id}`}
                      >
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {course.name || t.unnamedCourse}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {course.description?.trim() || t.noDescription}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                {unitCount} {t.units}
                              </span>
                              <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                {lessonCount} {t.lessons}
                              </span>
                              {course.author_username ? (
                                <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                  {t.by} {course.author_username}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="rounded-[1.35rem] border border-border/70 bg-linear-to-br from-primary/10 via-background/95 to-secondary/10 p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3 pb-4">
                              <div>
                                <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                                  {t.quickView}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                  {t.courseStructure}
                                </p>
                              </div>
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                                <BarChart3 className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="mt-4 flex items-end justify-between gap-4">
                              <div className="flex h-24 items-end gap-3 pt-6">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="flex h-24 w-14 items-end rounded-full bg-background/90 p-1 shadow-inner">
                                    <div
                                      className="w-full rounded-full bg-linear-to-t from-primary to-primary/55"
                                      style={{ height: `${unitBarHeight}px` }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    <Layers3 className="h-3.5 w-3.5" />
                                    {t.units}
                                  </div>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                  <div className="flex h-24 w-14 items-end rounded-full bg-background/90 p-1 shadow-inner">
                                    <div
                                      className="w-full rounded-full bg-linear-to-t from-secondary to-secondary/55"
                                      style={{ height: `${lessonBarHeight}px` }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    <PlayCircle className="h-3.5 w-3.5" />
                                    {t.lessons}
                                  </div>
                                </div>
                              </div>

                              
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                {renderCatalogPagination()}
              </>
            )}
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
