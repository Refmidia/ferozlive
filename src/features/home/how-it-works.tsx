import {
  MessageCircleWarning,
  Monitor,
  Users,
  ShieldAlert,
  VideoOff,
  Globe,
} from "lucide-react";

const cards = [
  {
    icon: MessageCircleWarning,
    title: "Relate o ocorrido",
    text: "Explique o que aconteceu em detalhes.",
  },
  {
    icon: Monitor,
    title: "Compartilhe sua tela",
    text: "Mostre o problema em tempo real.",
  },
  {
    icon: Users,
    title: "Resolva com a staff",
    text: "Receba suporte e resolva junto com a equipe.",
  },
];

const guarantees = [
  { icon: ShieldAlert, label: "Privado por padrão" },
  { icon: VideoOff, label: "Nada é gravado" },
  { icon: Globe, label: "Acesso pelo navegador" },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-[#08070B] px-5 pb-16 pt-10">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-white">
          Suporte rápido, seguro e direto
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="flex items-center gap-5 rounded-2xl border border-[#E91E63]/45 bg-[#10080F] px-6 py-6 shadow-[0_0_24px_rgba(233,30,99,0.08)]"
            >
              <card.icon className="h-11 w-11 shrink-0 text-[#E91E63]" strokeWidth={1.6} aria-hidden />
              <div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#A0A0A0]">{card.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 grid overflow-hidden rounded-2xl border border-[#E91E63]/45 bg-[#10080F] md:grid-cols-3">
          {guarantees.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-center gap-3 px-6 py-4 text-sm text-[#C8C8C8] ${
                index > 0 ? "border-t border-[#E91E63]/25 md:border-l md:border-t-0" : ""
              }`}
            >
              <item.icon className="h-5 w-5 text-[#E91E63]" strokeWidth={1.7} aria-hidden />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
