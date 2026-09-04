import Link from "next/link";
import { Card } from "@/components/ui/card";

export function EndedPage({ code }: { code: string }) {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-5">
      <Card className="w-full p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--sp-text-subtle)]">
          Sala {code}
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--sp-text)]">
          Esta sala foi encerrada
        </h1>
        <p className="mt-3 text-[var(--sp-text-muted)]">
          O anfitrião finalizou a transmissão ou a sala expirou. Nada do que foi
          compartilhado ficou gravado.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--sp-primary)] px-5 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sp-focus)]"
        >
          Voltar ao início
        </Link>
      </Card>
    </section>
  );
}
