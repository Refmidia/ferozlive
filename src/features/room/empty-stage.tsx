import { MonitorOff } from "lucide-react";

export function EmptyStage() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--sp-border)] bg-[rgba(16,16,28,0.55)] px-6 text-center">
      <MonitorOff className="h-10 w-10 text-[var(--sp-text-subtle)]" aria-hidden />
      <h2 className="mt-4 text-xl font-medium text-[var(--sp-text)]">
        Aguardando compartilhamento
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--sp-text-muted)]">
        O cidadão em telagem deve clicar em Compartilhar tela. A staff acompanha
        a sessão neste painel.
      </p>
    </div>
  );
}
