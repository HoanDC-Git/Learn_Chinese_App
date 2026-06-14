import { invoke } from "@tauri-apps/api/core";
import { useMutation } from "@tanstack/react-query";
import type { TtsResponse } from "../types";

// Helper to wake up sleeping audio hardware (like Bluetooth headphones) before playing real audio.
// It plays a tiny silent oscillator using Web Audio API.
const wakeUpAudioHardware = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0; // complete silence
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore errors on unsupported browsers
  }
};

export function useTts() {
  const generateMutation = useMutation({
    mutationFn: ({ text }: { text: string }) =>
      invoke<TtsResponse>("generate_audio", {
        text,
        voice: null as unknown as undefined,
      }),
  });

  const generateAudio = async (text: string) => {
    return generateMutation.mutateAsync({ text });
  };

  const playAudio = async (audioPath: string, delayMs?: number) => {
    try {
      const b64 = await invoke<string>("read_audio_file", { audioPath });
      const audio = new Audio(`data:audio/mp3;base64,${b64}`);
      if (delayMs && delayMs > 0) {
        wakeUpAudioHardware();
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        wakeUpAudioHardware();
      }
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      });
    } catch (e) {
      console.error("Lỗi phát âm thanh:", e);
    }
  };

  const speakText = async (text: string, delayMs?: number) => {
    try {
      const b64 = await invoke<string>("speak_text", { text, voice: null });
      const audio = new Audio(`data:audio/mp3;base64,${b64}`);
      if (delayMs && delayMs > 0) {
        wakeUpAudioHardware();
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        wakeUpAudioHardware();
      }
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      });
    } catch (e) {
      console.error("Lỗi tạo/phát âm thanh:", e);
    }
  };

  return {
    generateAudio,
    playAudio,
    speakText,
    isGenerating: generateMutation.isPending,
  };
}
