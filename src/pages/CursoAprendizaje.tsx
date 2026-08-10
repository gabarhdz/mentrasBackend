import { useEffect, useState } from 'react'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { CourseHeroCard } from '@/components/learning/course-hero-card'
import { CourseLessonViewer } from '@/components/learning/course-lesson-viewer'
import { CourseOutlinePanel } from '@/components/learning/course-outline-panel'
import { countLessons } from '@/components/learning/course-learning-types'
import type { CourseDetail } from '@/components/learning/course-learning-types'
import Footer from '@/components/ui/Footer'
import Header from '@/components/ui/Header'
import { authFetch, clearAuthTokens, hasStoredSession } from '@/lib/auth'
import { getLocalizedCopy, usePreferences } from '@/lib/preferences'
import { buildBackendUrl } from '@/lib/utils'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

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

const copy = {
  es: {
    loading: 'Cargando el curso...',
    errorTitle: 'No pudimos abrir el curso',
    back: 'Volver a Aprendizaje',
  },
  en: {
    loading: 'Loading the course...',
    errorTitle: 'We could not open the course',
    back: 'Back to Learning',
  },
  pt: {
    loading: 'Carregando o curso...',
    errorTitle: 'Nao foi possivel abrir o curso',
    back: 'Voltar para Aprendizagem',
  },
  fr: {
    loading: 'Chargement du cours...',
    errorTitle: 'Impossible d ouvrir le cours',
    back: 'Retour a l apprentissage',
  },
} as const

export default function CursoAprendizaje() {
  const { language } = usePreferences()
  const t = getLocalizedCopy(copy, language)
  const { courseId } = useParams()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasStoredSession()) {
      redirectToAuth()
      return
    }

    if (!courseId) {
      setIsLoading(false)
      setPageError('No encontramos el curso que quieres abrir.')
      return
    }

    const loadCourse = async () => {
      try {
        setIsLoading(true)
        setPageError(null)

        const response = await authFetch(buildBackendUrl(`/api/learning/courses/${courseId}/`))

        if (response.status === 401) {
          redirectToAuth()
          return
        }

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, 'No pudimos abrir este curso.'))
        }

        const data = (await response.json()) as CourseDetail
        setCourse(data)

        const firstLesson =
          data.units?.flatMap((unit) => unit.lessons ?? []).find((lesson) => lesson.id) ?? null
        setSelectedLessonId(firstLesson?.id ?? '')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No pudimos abrir este curso.'
        setPageError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadCourse()
  }, [courseId])

  const selectedLesson =
    course?.units?.flatMap((unit) => unit.lessons ?? []).find((lesson) => lesson.id === selectedLessonId) ?? null
  const units = course?.units ?? []
  const totalLessons = countLessons(units)

  if (isLoading) {
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
            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              to="/aprendizaje"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Link>
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
        <div className="mx-auto max-w-6xl space-y-6">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
            to="/aprendizaje"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>

          <CourseHeroCard course={course} totalLessons={totalLessons} unitCount={units.length} />

          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] xl:grid-cols-[0.78fr_1.22fr]">
            <aside className="space-y-5">
              <CourseOutlinePanel
                selectedLessonId={selectedLessonId}
                onSelectLesson={setSelectedLessonId}
                units={units}
              />
            </aside>

            <CourseLessonViewer selectedLesson={selectedLesson} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
