"use client";

import { ConnectionState } from "livekit-client";
import { useConnectionState } from "@livekit/components-react";

const labels: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: "Desconectado",
  [ConnectionState.Connecting]: "Conectando",
  [ConnectionState.Connected]: "Conectado",
  [ConnectionState.Reconnecting]: "Reconectando",
  [ConnectionState.SignalReconnecting]: "Reconectando sinal",
};

export function ConnectionIndicator() {
  const state = useConnectionState();
  const isOk = state === ConnectionState.Connected;
  const isWarn =
    state === ConnectionState.Reconnecting ||
    state === ConnectionState.SignalReconnecting ||
    state === ConnectionState.Connecting;

  return (
    <p
      className="inline-flex items-center gap-2 text-sm text-[var(--sp-text-muted)]"
      aria-live="polite"
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOk ? "bg-[var(--sp-success)]" : isWarn ? "bg-[var(--sp-warning)]" : "bg-[var(--sp-danger)]"
        }`}
        aria-hidden
      />
      {labels[state]}
    </p>
  );
}
