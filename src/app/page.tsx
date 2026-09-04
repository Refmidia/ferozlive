import { PageShell } from "@/components/layout/page-shell";
import { HomePage } from "@/features/home/home-page";

export default function Page() {
  return (
    <PageShell overlay>
      <HomePage />
    </PageShell>
  );
}
