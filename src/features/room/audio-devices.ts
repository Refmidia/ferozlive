"use client";

import { toast } from "sonner";
import { Room } from "livekit-client";

/** Prefer real hardware entries over Windows "default" / "communications" aliases. */
export function preferPhysicalDevices(devices: MediaDeviceInfo[]): MediaDeviceInfo[] {
  const physical = devices.filter(
    (device) =>
      Boolean(device.deviceId) &&
      device.deviceId !== "default" &&
      device.deviceId !== "communications",
  );
  return physical.length > 0 ? physical : devices.filter((device) => Boolean(device.deviceId));
}

export async function listAudioDevices(kind: "audioinput" | "audiooutput", requestPermission = false) {
  const devices = await Room.getLocalDevices(kind, requestPermission);
  return preferPhysicalDevices(devices);
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export async function switchMicrophone(room: Room, deviceId: string): Promise<void> {
  await room.startAudio().catch(() => undefined);

  room.options.audioCaptureDefaults = {
    ...(room.options.audioCaptureDefaults ?? {}),
    deviceId: { exact: deviceId },
  };

  try {
    await room.switchActiveDevice("audioinput", deviceId, true);
  } catch {
    // fall through to explicit republish when mic is live
  }

  const participant = room.localParticipant;
  if (!participant.isMicrophoneEnabled) {
    return;
  }

  await participant.setMicrophoneEnabled(false);
  await participant.setMicrophoneEnabled(true, {
    deviceId: { exact: deviceId },
  });
}

export async function switchSpeaker(room: Room, deviceId: string): Promise<void> {
  await room.startAudio().catch(() => undefined);

  room.options.audioOutput = {
    ...(room.options.audioOutput ?? {}),
    deviceId,
  };

  const ok = await room.switchActiveDevice("audiooutput", deviceId, true);
  if (!ok) {
    throw new Error("switch_failed");
  }
}

export function toastDeviceError(kind: "mic" | "speaker") {
  toast.error(
    kind === "mic"
      ? "Não foi possível usar este microfone. Verifique a permissão do navegador."
      : "Não foi possível trocar a saída de áudio neste navegador.",
  );
}
