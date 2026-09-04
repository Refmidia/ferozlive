import { Card } from "@/components/ui/card";

export function IncompatibleBrowser() {
  return (
    <Card className="mx-auto max-w-lg p-6">
      <h2 className="text-lg font-semibold text-[var(--sp-text)]">
        Este navegador não permite transmitir a tela
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--sp-text-muted)]">
        Você ainda pode assistir normalmente. Para compartilhar a própria tela, use
        Chrome ou Edge no computador. Em celulares, a maioria dos navegadores
        bloqueia essa permissão.
      </p>
    </Card>
  );
}
