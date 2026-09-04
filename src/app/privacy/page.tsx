import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { brand } from "@/config/brand";

export const metadata = {
  title: "Privacidade",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-3xl px-5 pb-20 pt-6">
        <Card className="p-8">
          <h1 className="text-3xl font-semibold">Privacidade</h1>
          <div className="mt-6 space-y-4 text-[var(--sp-text-muted)] leading-7">
            <p>
              Esta é a plataforma oficial de telagem da {brand.name}. A staff
              utiliza o canal para analisar ocorrências, oferecer suporte de
              instalação e verificar situações de anti-cheat. Tela e microfone
              circulam apenas durante a sessão.
            </p>
            <p>
              Não gravamos, não armazenamos e não reprocessamos o conteúdo da
              transmissão. Não há egress, recording nem arquivos de mídia no banco.
            </p>
            <p>
              Guardamos apenas o necessário para operar a sala: código público, status,
              validade, hash da senha se você criar uma, e eventos administrativos
              básicos para auditoria.
            </p>
            <p>
              Seu nome de exibição fica salvo neste navegador para você não precisar
              digitá-lo de novo. Você pode apagar os dados do site a qualquer momento.
            </p>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
