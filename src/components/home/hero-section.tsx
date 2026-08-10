import { ArrowRight, BadgeCheck, ChartSpline, Smartphone } from "lucide-react";
import { motion } from "motion/react";

import { MarqueeStrip } from "@/components/ui/marquee-strip";
import { Reveal } from "@/components/ui/reveal";
import { getLocalizedCopy, usePreferences } from "@/lib/preferences";

const copy = {
  es: {
    eyebrow: "Digitalizacion util para emprendedores que quieren avanzar sin caos",
    title: "Convierte tu negocio en una operacion digital clara, confiable y lista para crecer.",
    description:
      "Mentras ayuda a emprendedores a ordenar su presencia digital, mejorar sus ventas y automatizar lo esencial sin volverse una empresa pesada.",
    primaryAction: "Entrar para comenzar",
    secondaryAction: "Ver como funciona",
    imageAlt: "Profesionales y emprendedores usando Mentras",
    points: [
      "Tu negocio en canales digitales",
      "Procesos simples para vender mejor",
      "Acompanamiento cercano y claro",
    ],
    marquee: [
      "Diagnostico digital",
      "Catalogo online",
      "Automatizacion ligera",
      "WhatsApp y CRM",
      "Cobros y seguimiento",
      "Presencia profesional",
    ],
  },
  en: {
    eyebrow: "Useful digitalization for founders who want progress without chaos",
    title: "Turn your business into a clear, reliable digital operation ready to grow.",
    description:
      "Mentras helps founders organize their digital presence, improve sales, and automate the essentials without becoming a heavy company.",
    primaryAction: "Enter to start",
    secondaryAction: "See how it works",
    imageAlt: "Professionals and founders using Mentras",
    points: [
      "Your business across digital channels",
      "Simple processes to sell better",
      "Close and clear guidance",
    ],
    marquee: [
      "Digital diagnosis",
      "Online catalog",
      "Light automation",
      "WhatsApp and CRM",
      "Payments and follow-up",
      "Professional presence",
    ],
  },
  pt: {
    eyebrow: "Digitalizacao util para empreendedores que querem avancar sem caos",
    title: "Transforme seu negocio em uma operacao digital clara, confiavel e pronta para crescer.",
    description:
      "A Mentras ajuda empreendedores a organizar sua presenca digital, melhorar vendas e automatizar o essencial sem virar uma empresa pesada.",
    primaryAction: "Entrar para comecar",
    secondaryAction: "Ver como funciona",
    imageAlt: "Profissionais e empreendedores usando Mentras",
    points: [
      "Seu negocio em canais digitais",
      "Processos simples para vender melhor",
      "Acompanhamento proximo e claro",
    ],
    marquee: [
      "Diagnostico digital",
      "Catalogo online",
      "Automacao leve",
      "WhatsApp e CRM",
      "Pagamentos e acompanhamento",
      "Presenca profissional",
    ],
  },
  fr: {
    eyebrow: "Numerisation utile pour entrepreneurs qui veulent avancer sans chaos",
    title: "Transformez votre entreprise en operation numerique claire, fiable et prete a grandir.",
    description:
      "Mentras aide les entrepreneurs a organiser leur presence numerique, ameliorer leurs ventes et automatiser l'essentiel sans alourdir l'entreprise.",
    primaryAction: "Entrer pour commencer",
    secondaryAction: "Voir le fonctionnement",
    imageAlt: "Professionnels et entrepreneurs utilisant Mentras",
    points: [
      "Votre entreprise sur les canaux numeriques",
      "Des processus simples pour mieux vendre",
      "Un accompagnement proche et clair",
    ],
    marquee: [
      "Diagnostic numerique",
      "Catalogue en ligne",
      "Automatisation legere",
      "WhatsApp et CRM",
      "Paiements et suivi",
      "Presence professionnelle",
    ],
  },
} as const;

export function HeroSection() {
  const { language } = usePreferences();
  const t = getLocalizedCopy(copy, language);
  const heroPoints = [
    { icon: Smartphone, label: t.points[0] },
    { icon: ChartSpline, label: t.points[1] },
    { icon: BadgeCheck, label: t.points[2] },
  ];

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-6 sm:pb-24 sm:pt-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklab,var(--secondary)_28%,transparent),transparent_46%),radial-gradient(circle_at_80%_10%,_color-mix(in_oklab,var(--primary)_18%,transparent),transparent_42%),linear-gradient(to_bottom,_color-mix(in_oklab,var(--background)_30%,transparent),transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_68%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_68%,transparent_100%)]" />

      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <span className="size-2 rounded-full bg-primary" />
            Mentras
          </div>
        </div>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-4">
          <Reveal className="space-y-8">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                {t.eyebrow}
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                  {t.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  {t.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
              >
                {t.primaryAction}
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                {t.secondaryAction}
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroPoints.map(({ icon: Icon, label }, index) => (
                <Reveal
                  key={label}
                  delay={0.08 * (index + 1)}
                  className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur"
                >
                  <Icon className="mb-3 size-5 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{label}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto w-full max-w-[56rem] lg:max-w-none">
              <motion.div
                className="absolute left-[18%] top-[4%] -z-10 h-56 w-56 rounded-full bg-secondary/30 blur-3xl sm:h-80 sm:w-80"
                animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.45, 0.28] }}
                transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute right-[0%] top-[14%] -z-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl sm:h-96 sm:w-96"
                animate={{ scale: [1.02, 1.12, 1.02], opacity: [0.24, 0.4, 0.24] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 }}
              />
              <div className="relative min-h-[24rem] overflow-hidden pt-8 sm:min-h-[31rem] sm:pt-12 lg:min-h-[39rem] lg:pt-2">
                <div className="absolute inset-x-[14%] bottom-10 h-24 rounded-full bg-black/12 blur-3xl dark:bg-black/30" />

                <div className="relative z-10 h-[18rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_76%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_76%,transparent_100%)] sm:h-[24rem] lg:h-[32rem]">
                  <img
                    src="/SMEs_owner_landing.png"
                    alt={t.imageAlt}
                    className="absolute bottom-0 left-1/2 h-auto w-[155%] max-w-none -translate-x-[45%] object-contain drop-shadow-[0_34px_60px_rgba(4,24,25,0.18)] [clip-path:inset(0_0_0_6%)] sm:w-[165%] sm:-translate-x-[45%] lg:w-[205%] lg:-translate-x-[46.5%] xl:w-[220%] xl:-translate-x-[47%]"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="mt-10">
          <MarqueeStrip items={[...t.marquee]} />
        </Reveal>
      </div>
    </section>
  );
}
