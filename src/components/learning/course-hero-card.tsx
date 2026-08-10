import { BookOpen } from 'lucide-react'

import type { CourseDetail } from '@/components/learning/course-learning-types'
import { usePreferences } from '@/lib/preferences'

type CourseHeroCardProps = {
  course: CourseDetail | null
  totalLessons: number
  unitCount: number
}

const copy = {
  es: {
    course: 'Curso',
    unnamedCourse: 'Curso sin nombre',
    noDescription: 'Este curso aun no tiene descripcion.',
    units: 'unidades',
    lessons: 'lecciones',
    createdBy: 'Creado por',
  },
  en: {
    course: 'Course',
    unnamedCourse: 'Unnamed course',
    noDescription: 'This course does not have a description yet.',
    units: 'units',
    lessons: 'lessons',
    createdBy: 'Created by',
  },
  pt: {
    course: 'Curso',
    unnamedCourse: 'Curso sem nome',
    noDescription: 'Este curso ainda nao tem descricao.',
    units: 'unidades',
    lessons: 'aulas',
    createdBy: 'Criado por',
  },
  fr: {
    course: 'Cours',
    unnamedCourse: 'Cours sans nom',
    noDescription: 'Ce cours n a pas encore de description.',
    units: 'unites',
    lessons: 'lecons',
    createdBy: 'Cree par',
  },
} as const

export function CourseHeroCard({ course, totalLessons, unitCount }: CourseHeroCardProps) {
  const { language } = usePreferences()
  const t = copy[language]

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_28px_80px_-46px_rgba(0,137,123,0.45)] backdrop-blur">
      <div className="border-b border-border/70 bg-linear-to-br from-primary/12 via-secondary/10 to-accent/12 px-7 py-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium tracking-[0.24em] text-primary uppercase">
          <BookOpen className="h-3.5 w-3.5" />
          {t.course}
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          {course?.name || t.unnamedCourse}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          {course?.description?.trim() || t.noDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            {unitCount} {t.units}
          </span>
          <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            {totalLessons} {t.lessons}
          </span>
          {course?.author_username ? (
            <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              {t.createdBy} {course.author_username}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
