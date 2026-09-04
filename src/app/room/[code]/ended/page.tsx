import { PageShell } from "@/components/layout/page-shell";
import { EndedPage } from "@/features/ended/ended-page";
import { normalizeRoomCode } from "@/lib/validation/room-code";

export default async function RoomEndedPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <PageShell>
      <EndedPage code={normalizeRoomCode(decodeURIComponent(code))} />
    </PageShell>
  );
}
