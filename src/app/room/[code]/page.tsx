import { RoomGate } from "@/features/room/room-gate";
import { normalizeRoomCode } from "@/lib/validation/room-code";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <RoomGate code={normalizeRoomCode(decodeURIComponent(code))} />;
}
