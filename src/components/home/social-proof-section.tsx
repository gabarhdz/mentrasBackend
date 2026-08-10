import { BriefcaseBusiness, Clock3, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getLocalizedCopy, usePreferences } from "@/lib/preferences";

const copy = {
  es: {
    badge: "Confianza",
    title: "Digitalizarse tambien es verse listo para crecer",
    description:
      "Mentras te ayuda a proyectar claridad, orden y profesionalismo para que tus clientes confien antes, durante y despues del primer contacto.",
    expected: "Resultado esperado",
    expectedTitle: "Un negocio que se entiende mejor, responde mas rapido y transmite mas confianza.",
    expectedDescription:
      "Desde una presencia mas profesional hasta procesos mas ordenados, cada mejora suma credibilidad para vender con menos friccion.",
    tags: ["Sitio y presencia", "Contacto y seguimiento", "Automatizacion"],
    points: [
      ["Pensado para emprendedores", "Procesos sencillos, lenguaje claro y herramientas que no te roban tiempo."],
      ["Implementacion practica", "Priorizamos avances visibles rapido para que empieces a notar orden y traccion."],
      ["Mas confianza frente a clientes", "Una presencia digital consistente transmite seriedad y mejora la conversion."],
    ],
  },
  en: {
    badge: "Trust",
    title: "Going digital also means looking ready to grow",
    description:
      "Mentras helps you project clarity, order and professionalism so customers trust you before, during and after the first contact.",
    expected: "Expected result",
    expectedTitle: "A business that is easier to understand, responds faster and builds more trust.",
    expectedDescription:
      "From a more professional presence to more organized processes, every improvement adds credibility and reduces friction in sales.",
    tags: ["Website and presence", "Contact and follow-up", "Automation"],
    points: [
      ["Built for founders", "Simple processes, clear language and tools that do not steal your time."],
      ["Practical implementation", "We prioritize visible progress quickly so you start seeing order and traction."],
      ["More customer trust", "A consistent digital presence signals seriousness and improves conversion."],
    ],
  },
  pt: {
    badge: "Confianca",
    title: "Digitalizar tambem e parecer pronto para crescer",
    description:
      "A Mentras ajuda voce a projetar clareza, ordem e profissionalismo para que clientes confiem antes, durante e depois do primeiro contato.",
    expected: "Resultado esperado",
    expectedTitle: "Um negocio mais facil de entender, que responde mais rapido e transmite mais confianca.",
    expectedDescription:
      "De uma presenca mais profissional a processos mais organizados, cada melhoria soma credibilidade para vender com menos friccao.",
    tags: ["Site e presenca", "Contato e acompanhamento", "Automacao"],
    points: [
      ["Pensado para empreendedores", "Processos simples, linguagem clara e ferramentas que nao roubam seu tempo."],
      ["Implementacao pratica", "Priorizamos avancos visiveis rapidamente para voce notar ordem e tracao."],
      ["Mais confianca com clientes", "Uma presenca digital consistente transmite seriedade e melhora a conversao."],
    ],
  },
  fr: {
    badge: "Confiance",
    title: "Se numeriser, c'est aussi paraitre pret a grandir",
    description:
      "Mentras vous aide a projeter clarte, ordre et professionnalisme pour que vos clients vous fassent confiance avant, pendant et apres le premier contact.",
    expected: "Resultat attendu",
    expectedTitle: "Une entreprise plus facile a comprendre, plus rapide a repondre et plus fiable.",
    expectedDescription:
      "D'une presence plus professionnelle a des processus mieux organises, chaque amelioration ajoute de la credibilite et reduit la friction.",
    tags: ["Site et presence", "Contact et suivi", "Automatisation"],
    points: [
      ["Pense pour entrepreneurs", "Des processus simples, un langage clair et des outils qui ne vous font pas perdre de temps."],
      ["Mise en place pratique", "Nous priorisons des progres visibles rapidement pour apporter ordre et traction."],
      ["Plus de confiance client", "Une presence numerique coherente transmet du serieux et ameliore la conversion."],
    ],
  },
} as const;

const icons = [BriefcaseBusiness, Clock3, ShieldCheck] as const;

export function SocialProofSection() {
  const { language } = usePreferences();
  const t = getLocalizedCopy(copy, language);

  return (
    <section id="contacto" className="px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-border bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_11%,white),color-mix(in_oklab,var(--secondary)_10%,white))] p-8 shadow-sm dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_14%,black),color-mix(in_oklab,var(--secondary)_12%,black))] sm:p-10">
        <Reveal>
          <SectionHeading
            badge={t.badge}
            title={t.title}
            description={t.description}
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Reveal delay={0.08}>
            <div className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-3">
                {t.points.map(([title, description], index) => {
                  const Icon = icons[index];
                  return (
                  <div key={title} className="rounded-2xl bg-background p-4">
                    <Icon className="size-5 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="flex h-full flex-col justify-between rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
                  {t.expected}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {t.expectedTitle}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {t.expectedDescription}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  {t.tags[0]}
                </span>
                <span className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
                  {t.tags[1]}
                </span>
                <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                  {t.tags[2]}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
