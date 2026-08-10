import { PlayCircle } from 'lucide-react'

import type { UnitSummary } from '@/components/learning/course-learning-types'
import { usePreferences } from '@/lib/preferences'

type CourseOutlinePanelProps = {
  selectedLessonId: string
  onSelectLesson: (lessonId: string) => void
  units: UnitSummary[]
}

const copy = {
  es: {
    content: 'Contenido',
    title: 'Unidades y lecciones',
    emptyCourse: 'Este curso todavia no tiene contenido disponible.',
    unit: 'Unidad',
    noUnitDescription: 'Esta unidad aun no tiene descripcion.',
    lessons: 'lecciones',
    lesson: 'Leccion',
    openLesson: 'Toca para abrir esta leccion',
    emptyUnit: 'Esta unidad todavia no tiene lecciones.',
  },
  en: {
    content: 'Content',
    title: 'Units and lessons',
    emptyCourse: 'This course does not have available content yet.',
    unit: 'Unit',
    noUnitDescription: 'This unit does not have a description yet.',
    lessons: 'lessons',
    lesson: 'Lesson',
    openLesson: 'Tap to open this lesson',
    emptyUnit: 'This unit does not have lessons yet.',
  },
  pt: {
    content: 'Conteudo',
    title: 'Unidades e aulas',
    emptyCourse: 'Este curso ainda nao tem conteudo disponivel.',
    unit: 'Unidade',
    noUnitDescription: 'Esta unidade ainda nao tem descricao.',
    lessons: 'aulas',
    lesson: 'Aula',
    openLesson: 'Toque para abrir esta aula',
    emptyUnit: 'Esta unidade ainda nao tem aulas.',
  },
  fr: {
    content: 'Contenu',
    title: 'Unites et lecons',
    emptyCourse: 'Ce cours n a pas encore de contenu disponible.',
    unit: 'Unite',
    noUnitDescription: 'Cette unite n a pas encore de description.',
    lessons: 'lecons',
    lesson: 'Lecon',
    openLesson: 'Appuyez pour ouvrir cette lecon',
    emptyUnit: 'Cette unite n a pas encore de lecons.',
  },
} as const

export function CourseOutlinePanel({
  selectedLessonId,
  onSelectLesson,
  units,
}: CourseOutlinePanelProps) {
  const { language } = usePreferences()
  const t = copy[language]

  return (
    <div className="rounded-[2rem] border border-border/70 bg-card/92 p-6 backdrop-blur">
      <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
        {t.content}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">{t.title}</h2>

      {!units.length ? (
        <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
          {t.emptyCourse}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {units.map((unit, unitIndex) => (
            <article
              key={unit.id ?? `${unit.title}-${unitIndex}`}
              className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {unit.title || `${t.unit} ${unitIndex + 1}`}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {unit.description?.trim() || t.noUnitDescription}
                  </p>
                </div>
                <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {unit.lessons?.length ?? 0} {t.lessons}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {unit.lessons?.length ? (
                  unit.lessons.map((lesson, lessonIndex) => {
                    const isActive = lesson.id === selectedLessonId

                    return (
                      <button
                        key={lesson.id ?? `${unit.id}-${lessonIndex}`}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                          isActive
                            ? 'border-primary/30 bg-primary/8'
                            : 'border-border/70 bg-background/80 hover:bg-muted'
                        }`}
                        type="button"
                        onClick={() => onSelectLesson(lesson.id ?? '')}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {lesson.title || `${t.lesson} ${lessonIndex + 1}`}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t.openLesson}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    {t.emptyUnit}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
