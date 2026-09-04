import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";
import { brand } from "@/config/brand";

export const metadata = {
  title: "Privacidade",
};

const points = [
  {
    title: "Só durante a sessão",
    body: `Esta é a plataforma oficial de telagem da ${brand.name}. A staff usa o canal para analisar ocorrências, oferecer suporte de instalação e verificar situações de anti-cheat. Tela e microfone circulam apenas enquanto a sala estiver ativa.`,
  },
  {
    title: "Sem gravação",
    body: "Não gravamos, não armazenamos e não reprocessamos o conteúdo da transmissão. Não há egress, recording nem arquivos de mídia no banco.",
  },
  {
    title: "Dados operacionais",
    body: "Guardamos apenas o necessário para operar a sala: código público, status, validade, hash da senha se você criar uma, e eventos administrativos básicos para auditoria.",
  },
  {
    title: "Nome no navegador",
    body: "Seu nome de exibição fica salvo neste navegador para você não precisar digitá-lo de novo. Você pode apagar os dados do site a qualquer momento.",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell overlay>
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 pb-16 pt-28 sm:pt-32">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/hero-feroz.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[35%_0%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(5,3,10,0.94)_0%,rgba(5,3,10,0.82)_42%,rgba(5,3,10,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,3,10,0.55)_0%,transparent_40%,rgba(5,3,10,0.72)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-[#FF2D95]/28 bg-black/55 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF8FBF]">
              {brand.name}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Privacidade
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#C9B8D8] sm:text-base">
              Transparência sobre o que circula na sala e o que nunca fica guardado.
            </p>

            <div className="mt-8 space-y-5">
              {points.map((point) => (
                <div key={point.title} className="border-t border-white/10 pt-5">
                  <h2 className="text-sm font-semibold text-white">{point.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#B7A6C8]">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
