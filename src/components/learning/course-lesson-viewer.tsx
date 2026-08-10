import { FileText, PlayCircle } from 'lucide-react'

import type { LessonSummary } from '@/components/learning/course-learning-types'
import { usePreferences } from '@/lib/preferences'

type CourseLessonViewerProps = {
  selectedLesson: LessonSummary | null
}

const copy = {
  es: {
    currentLesson: 'Leccion actual',
    selectLesson: 'Selecciona una leccion',
    selectedDescription: 'Aqui puedes avanzar por el contenido de esta leccion.',
    emptyDescription: 'Elige una leccion del panel izquierdo para empezar.',
    video: 'Video',
    noVideo: 'Esta leccion todavia no tiene video disponible.',
    supportMaterial: 'Material de apoyo',
    openPdf: 'Abrir material en PDF',
    noExtraMaterial: 'Esta leccion no tiene material extra por ahora.',
    emptyViewer: 'Cuando selecciones una leccion, aqui veras su video y el material complementario.',
  },
  en: {
    currentLesson: 'Current lesson',
    selectLesson: 'Select a lesson',
    selectedDescription: 'Here you can move through this lesson content.',
    emptyDescription: 'Choose a lesson from the left panel to start.',
    video: 'Video',
    noVideo: 'This lesson does not have video available yet.',
    supportMaterial: 'Support material',
    openPdf: 'Open PDF material',
    noExtraMaterial: 'This lesson has no extra material for now.',
    emptyViewer: 'When you select a lesson, you will see its video and complementary material here.',
  },
  pt: {
    currentLesson: 'Aula atual',
    selectLesson: 'Selecione uma aula',
    selectedDescription: 'Aqui voce pode avancar pelo conteudo desta aula.',
    emptyDescription: 'Escolha uma aula no painel esquerdo para comecar.',
    video: 'Video',
    noVideo: 'Esta aula ainda nao tem video disponivel.',
    supportMaterial: 'Material de apoio',
    openPdf: 'Abrir material em PDF',
    noExtraMaterial: 'Esta aula nao tem material extra por enquanto.',
    emptyViewer: 'Quando selecionar uma aula, aqui voce vera o video e o material complementar.',
  },
  fr: {
    currentLesson: 'Lecon actuelle',
    selectLesson: 'Selectionnez une lecon',
    selectedDescription: 'Ici vous pouvez avancer dans le contenu de cette lecon.',
    emptyDescription: 'Choisissez une lecon dans le panneau gauche pour commencer.',
    video: 'Video',
    noVideo: 'Cette lecon n a pas encore de video disponible.',
    supportMaterial: 'Support',
    openPdf: 'Ouvrir le PDF',
    noExtraMaterial: 'Cette lecon n a pas de materiel supplementaire pour le moment.',
    emptyViewer: 'Lorsque vous selectionnez une lecon, sa video et le materiel complementaire apparaitront ici.',
  },
} as const

export function CourseLessonViewer({ selectedLesson }: CourseLessonViewerProps) {
  const { language } = usePreferences()
  const t = copy[language]

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-border/70 bg-card/92 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {t.currentLesson}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {selectedLesson?.title || t.selectLesson}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {selectedLesson ? t.selectedDescription : t.emptyDescription}
        </p>
      </div>

      {selectedLesson ? (
        <>
          <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/92 shadow-sm backdrop-blur">
            <div className="border-b border-border/70 px-6 py-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <PlayCircle className="h-6 w-6 text-primary" />
                {t.video}
              </div>
            </div>
            <div className="p-6 md:p-7">
              {selectedLesson.video ? (
                <video
                  className="aspect-video w-full rounded-[1.75rem] border border-border bg-black shadow-[0_26px_60px_-38px_rgba(0,0,0,0.75)]"
                  controls
                  preload="metadata"
                  src={selectedLesson.video}
                />
              ) : (
                <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
                  {t.noVideo}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/92 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              {t.supportMaterial}
            </div>
            {selectedLesson.pdf ? (
              <a
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                href={selectedLesson.pdf}
                rel="noreferrer"
                target="_blank"
              >
                <FileText className="h-4 w-4" />
                {t.openPdf}
              </a>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {t.noExtraMaterial}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-[2rem] border border-border/70 bg-card/92 p-6 shadow-sm backdrop-blur">
          <p className="text-sm leading-6 text-muted-foreground">
            {t.emptyViewer}
          </p>
        </div>
      )}
    </section>
  )
}
