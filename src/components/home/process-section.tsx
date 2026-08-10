import { Compass, Rocket, SearchCheck } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { usePreferences } from "@/lib/preferences";

const copy = {
  es: {
    badge: "Como trabajamos",
    title: "Un proceso pensado para avanzar sin abrumarte",
    description: "Nos enfocamos en pasos concretos, decisiones claras y herramientas que tu negocio pueda adoptar de verdad.",
    step: "Paso",
    steps: [
      ["Diagnostico simple", "Revisamos tu negocio, tus canales actuales y las trabas mas urgentes para priorizar bien."],
      ["Ruta digital realista", "Definimos una hoja de ruta clara con acciones alcanzables, herramientas y tiempos razonables."],
      ["Implementacion y acompanamiento", "Ponemos en marcha la solucion contigo y te dejamos un sistema que puedas sostener."],
    ],
  },
  en: {
    badge: "How we work",
    title: "A process designed to move forward without overwhelming you",
    description: "We focus on concrete steps, clear decisions and tools your business can truly adopt.",
    step: "Step",
    steps: [
      ["Simple diagnosis", "We review your business, current channels and most urgent blockers to prioritize well."],
      ["Realistic digital roadmap", "We define a clear roadmap with achievable actions, tools and reasonable timelines."],
      ["Implementation and guidance", "We launch the solution with you and leave you with a system you can sustain."],
    ],
  },
  pt: {
    badge: "Como trabalhamos",
    title: "Um processo pensado para avancar sem sobrecarregar",
    description: "Focamos em passos concretos, decisoes claras e ferramentas que seu negocio possa adotar de verdade.",
    step: "Passo",
    steps: [
      ["Diagnostico simples", "Revisamos seu negocio, canais atuais e bloqueios mais urgentes para priorizar bem."],
      ["Rota digital realista", "Definimos um plano claro com acoes alcancaveis, ferramentas e prazos razoaveis."],
      ["Implementacao e acompanhamento", "Colocamos a solucao em marcha com voce e deixamos um sistema sustentavel."],
    ],
  },
  fr: {
    badge: "Notre methode",
    title: "Un processus concu pour avancer sans vous submerger",
    description: "Nous misons sur des etapes concretes, des decisions claires et des outils que votre entreprise peut vraiment adopter.",
    step: "Etape",
    steps: [
      ["Diagnostic simple", "Nous examinons votre entreprise, vos canaux actuels et les blocages les plus urgents pour bien prioriser."],
      ["Feuille de route numerique realiste", "Nous definissons un plan clair avec des actions atteignables, des outils et des delais raisonnables."],
      ["Mise en place et accompagnement", "Nous lancons la solution avec vous et vous laissons un systeme durable."],
    ],
  },
} as const;

const icons = [SearchCheck, Compass, Rocket] as const;

export function ProcessSection() {
  const { language } = usePreferences();
  const t = copy[language];

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] border border-border bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <SectionHeading
            badge={t.badge}
            title={t.title}
            description={t.description}
          />
        </Reveal>

        <div className="space-y-4">
          {t.steps.map(([title, description], index) => {
            const Icon = icons[index];
            return (
            <Reveal key={title} delay={index * 0.08}>
              <article className="flex gap-4 rounded-3xl border border-border/80 bg-background p-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-foreground">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                    {t.step} {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </article>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
