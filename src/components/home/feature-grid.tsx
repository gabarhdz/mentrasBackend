import { Bot, Globe, MessageCircleMore, Workflow } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getLocalizedCopy, usePreferences } from "@/lib/preferences";

const copy = {
  es: {
    badge: "Que hacemos",
    title: "Digitalizamos lo importante sin complicar tu operacion",
    description:
      "Mentras convierte necesidades dispersas en un sistema digital simple: presencia, captacion, seguimiento y automatizacion para que puedas enfocarte en vender y atender mejor.",
    features: [
      ["Presencia digital clara", "Creamos una base profesional para que tu negocio se vea confiable y sea facil de encontrar."],
      ["Canales que venden", "Organizamos WhatsApp, formularios, catalogos y seguimiento para que cada contacto tenga un camino."],
      ["Automatizacion con sentido", "Quitamos tareas repetitivas con automatizaciones ligeras que de verdad ahorran tiempo."],
      ["Asistencia inteligente", "Integramos herramientas digitales y asistentes que ayudan a responder, ordenar y escalar."],
    ],
  },
  en: {
    badge: "What we do",
    title: "We digitalize what matters without complicating your operation",
    description:
      "Mentras turns scattered needs into a simple digital system: presence, capture, follow-up and automation so you can focus on selling and serving better.",
    features: [
      ["Clear digital presence", "We create a professional base so your business looks reliable and is easy to find."],
      ["Channels that sell", "We organize WhatsApp, forms, catalogs and follow-up so every contact has a path."],
      ["Purposeful automation", "We remove repetitive tasks with light automations that truly save time."],
      ["Smart assistance", "We integrate digital tools and assistants that help answer, organize and scale."],
    ],
  },
  pt: {
    badge: "O que fazemos",
    title: "Digitalizamos o importante sem complicar sua operacao",
    description:
      "A Mentras transforma necessidades dispersas em um sistema digital simples: presenca, captacao, acompanhamento e automacao para voce focar em vender e atender melhor.",
    features: [
      ["Presenca digital clara", "Criamos uma base profissional para seu negocio parecer confiavel e ser facil de encontrar."],
      ["Canais que vendem", "Organizamos WhatsApp, formularios, catalogos e acompanhamento para cada contato ter um caminho."],
      ["Automacao com sentido", "Removemos tarefas repetitivas com automacoes leves que realmente economizam tempo."],
      ["Assistencia inteligente", "Integramos ferramentas digitais e assistentes que ajudam a responder, organizar e escalar."],
    ],
  },
  fr: {
    badge: "Ce que nous faisons",
    title: "Nous numerisons l'essentiel sans compliquer votre operation",
    description:
      "Mentras transforme des besoins disperses en systeme numerique simple: presence, acquisition, suivi et automatisation pour mieux vendre et mieux servir.",
    features: [
      ["Presence numerique claire", "Nous creons une base professionnelle pour que votre entreprise inspire confiance et soit facile a trouver."],
      ["Des canaux qui vendent", "Nous organisons WhatsApp, formulaires, catalogues et suivi pour que chaque contact ait un parcours."],
      ["Automatisation utile", "Nous supprimons les taches repetitives avec des automatisations legeres qui font vraiment gagner du temps."],
      ["Assistance intelligente", "Nous integrons des outils numeriques et assistants qui aident a repondre, organiser et grandir."],
    ],
  },
} as const;

const icons = [Globe, MessageCircleMore, Workflow, Bot] as const;

export function FeatureGrid() {
  const { language } = usePreferences();
  const t = getLocalizedCopy(copy, language);

  return (
    <section id="servicios" className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge={t.badge}
          title={t.title}
          description={t.description}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {t.features.map(([title, description], index) => {
            const Icon = icons[index];
            return (
            <Reveal key={title} delay={index * 0.08}>
              <article className="group h-full rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {description}
                </p>
              </article>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
