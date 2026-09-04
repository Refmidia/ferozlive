import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SystemStatus } from "@/components/layout/system-status";
import { brand } from "@/config/brand";

export function PageShell({
  children,
  overlay = false,
}: {
  children: ReactNode;
  overlay?: boolean;
}) {
  return (
    <div className="relative isolate min-h-screen bg-black">
      <header className={`${overlay ? "absolute inset-x-0 top-0" : "relative"} z-20 px-4 pt-4 sm:px-6`}>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 rounded-full border border-white/10 bg-[#0A0A0A] px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:px-5">
          <Link href="/" className="shrink-0" aria-label={brand.name}>
            <Logo compact />
          </Link>
          <span className="hidden h-7 w-px bg-white/20 sm:block" aria-hidden />
          <nav className="hidden items-center gap-6 text-sm text-[#B3B3B3] sm:flex">
            <a href="/#como-funciona" className="hover:text-white">
              Como funciona
            </a>
            <Link href="/privacy" className="hover:text-white">
              Privacidade
            </Link>
          </nav>
          <div className="ml-auto">
            <SystemStatus />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
