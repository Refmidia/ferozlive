"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mic, MicOff } from "lucide-react";
import { Room } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";

export function MicControl({
  micEnabled,
  deafened,
  speaking,
  onToggleMic,
}: {
  micEnabled: boolean;
  deafened: boolean;
  speaking: boolean;
  onToggleMic: () => void;
}) {
  const room = useRoomContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [activeMicId, setActiveMicId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadDevices() {
      try {
        const devices = await Room.getLocalDevices("audioinput", false);
        if (cancelled) return;
        setMics(devices.filter((device) => device.deviceId));
        setActiveMicId(room.getActiveDevice("audioinput") ?? devices[0]?.deviceId ?? "");
      } catch {
        // permission may be pending until first mic enable
      }
    }

    void loadDevices();
    room.on("mediaDevicesChanged", loadDevices);
    return () => {
      cancelled = true;
      room.off("mediaDevicesChanged", loadDevices);
    };
  }, [room]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function openMenu() {
    try {
      const devices = await Room.getLocalDevices("audioinput", true);
      setMics(devices.filter((device) => device.deviceId));
      setActiveMicId(room.getActiveDevice("audioinput") ?? devices[0]?.deviceId ?? "");
    } catch {
      // ignore
    }
    setOpen((value) => !value);
  }

  async function selectMic(deviceId: string) {
    try {
      await room.switchActiveDevice("audioinput", deviceId);
      setActiveMicId(deviceId);
      setOpen(false);
    } catch {
      setOpen(false);
    }
  }

  const live = speaking && micEnabled && !deafened;

  return (
    <div ref={rootRef} className="relative inline-flex items-center">
      <div
        className={`inline-flex items-center rounded-full transition ${
          live ? "bg-[#12301f] shadow-[0_0_16px_rgba(61,220,151,0.35)]" : ""
        }`}
      >
        <button
          type="button"
          onClick={onToggleMic}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
            deafened || !micEnabled
              ? "text-[#FF8FA3] hover:bg-[#FF4D6D]/15"
              : live
                ? "text-[#3DDC97]"
                : "text-[#FF2D95] hover:bg-white/8"
          }`}
          aria-label={micEnabled && !deafened ? "Mutar microfone" : "Ativar microfone"}
          aria-pressed={micEnabled && !deafened}
        >
          <span className="relative inline-flex">
            {micEnabled && !deafened ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            {live ? (
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-[#3DDC97]" />
            ) : null}
          </span>
        </button>
        <button
          type="button"
          onClick={() => void openMenu()}
          className="mr-0.5 inline-flex h-8 w-5 items-center justify-center rounded-full text-[#7E6E90] transition hover:bg-white/8 hover:text-[#C9B8D8]"
          aria-label="Escolher microfone"
          aria-expanded={open}
          title="Escolher microfone"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open ? (
        <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 min-w-[220px] max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#120b18] py-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E6E90]">
            Microfone
          </p>
          {mics.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[#9A8AAE]">Nenhum microfone encontrado.</p>
          ) : (
            mics.map((device) => {
              const selected = device.deviceId === activeMicId;
              return (
                <button
                  key={device.deviceId}
                  type="button"
                  onClick={() => void selectMic(device.deviceId)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                    selected ? "text-[#3DDC97]" : "text-[#E8D7F5]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      selected ? "bg-[#3DDC97]" : "bg-transparent"
                    }`}
                  />
                  <span className="truncate">{device.label || "Microfone"}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
