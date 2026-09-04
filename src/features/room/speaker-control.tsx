"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Headphones, HeadphoneOff } from "lucide-react";
import { useRoomContext } from "@livekit/components-react";
import {
  listAudioDevices,
  switchSpeaker,
  toastDeviceError,
} from "@/features/room/audio-devices";

export function SpeakerControl({
  deafened,
  onToggleDeafen,
}: {
  deafened: boolean;
  onToggleDeafen: () => void;
}) {
  const room = useRoomContext();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadDevices() {
      try {
        const devices = await listAudioDevices("audiooutput", false);
        if (cancelled) return;
        setSpeakers(devices);
        const active = room.getActiveDevice("audiooutput");
        setActiveSpeakerId(
          active && devices.some((device) => device.deviceId === active)
            ? active
            : (devices[0]?.deviceId ?? ""),
        );
      } catch {
        // some browsers require a prior user gesture / permission
      }
    }

    void loadDevices();
    room.on("mediaDevicesChanged", loadDevices);
    room.on("activeDeviceChanged", loadDevices);
    return () => {
      cancelled = true;
      room.off("mediaDevicesChanged", loadDevices);
      room.off("activeDeviceChanged", loadDevices);
    };
  }, [room]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function openMenu() {
    try {
      await room.startAudio().catch(() => undefined);
      const devices = await listAudioDevices("audiooutput", true);
      setSpeakers(devices);
      const active = room.getActiveDevice("audiooutput");
      setActiveSpeakerId(
        active && devices.some((device) => device.deviceId === active)
          ? active
          : (devices[0]?.deviceId ?? ""),
      );
    } catch {
      // ignore
    }
    setOpen((value) => !value);
  }

  async function selectSpeaker(deviceId: string) {
    if (busy || deviceId === activeSpeakerId) {
      setOpen(false);
      return;
    }

    setBusy(true);
    try {
      await switchSpeaker(room, deviceId);
      setActiveSpeakerId(deviceId);
      setOpen(false);
    } catch {
      toastDeviceError("speaker");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={rootRef} className="relative inline-flex items-center">
      <div className="inline-flex items-center rounded-full">
        <button
          type="button"
          onClick={onToggleDeafen}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
            deafened
              ? "bg-[#FF4D6D]/15 text-[#FF8FA3] hover:bg-[#FF4D6D]/25"
              : "bg-[var(--sp-primary-soft)] text-[#FF2D95] hover:bg-[rgba(233,30,99,0.28)]"
          }`}
          aria-label={deafened ? "Ativar áudio" : "Ensurdecer"}
          aria-pressed={!deafened}
        >
          {deafened ? <HeadphoneOff className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => void openMenu()}
          className="mr-0.5 inline-flex h-8 w-5 items-center justify-center rounded-full text-[#7E6E90] transition hover:bg-white/8 hover:text-[#C9B8D8]"
          aria-label="Escolher saída de áudio"
          aria-expanded={open}
          title="Escolher saída de áudio"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open ? (
        <div
          className="absolute bottom-[calc(100%+10px)] left-0 z-50 min-w-[240px] max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#120b18] py-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E6E90]">
            Saída de áudio
          </p>
          {speakers.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[#9A8AAE]">Nenhuma saída encontrada.</p>
          ) : (
            speakers.map((device) => {
              const selected = device.deviceId === activeSpeakerId;
              return (
                <button
                  key={device.deviceId}
                  type="button"
                  disabled={busy}
                  onClick={() => void selectSpeaker(device.deviceId)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/5 disabled:opacity-60 ${
                    selected ? "text-[#3DDC97]" : "text-[#E8D7F5]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      selected ? "bg-[#3DDC97]" : "bg-transparent"
                    }`}
                  />
                  <span className="truncate">{device.label || "Alto-falante"}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
