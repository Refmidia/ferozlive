import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <PageShell>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-5">
        <Card className="w-full p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--sp-text-subtle)]">404</p>
          <h1 className="mt-3 text-3xl font-semibold">Página não encontrada</h1>
          <p className="mt-3 text-[var(--sp-text-muted)]">
            Esse endereço não existe ou a sala já não está disponível.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--sp-primary)] px-5 font-medium text-white"
          >
            Voltar ao início
          </Link>
        </Card>
      </section>
    </PageShell>
  );
}
