import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";

/**
 * Sintetizador de SFX de jackpot usando Web Audio API.
 * No requiere archivos de audio — todo se genera en el navegador.
 *
 * Eventos:
 *  - flash():  "ding!" inicial cuando arranca el flash blanco.
 *  - reels():  ticks rápidos durante el spin de los reels.
 *  - win():    fanfarria ascendente al revelar el ganador.
 *  - coins():  cascada de monedas durante el reveal.
 *  - stop():   corta todo lo que esté sonando.
 */
export function useJackpotSfx() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const activeNodes = useRef<Set<AudioScheduledSourceNode>>(new Set());

  const ensureCtx = () => {
    if (!ctxRef.current) {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctxRef.current = new Ctx();
        const master = ctxRef.current.createGain();
        master.gain.value = 0.6;
        master.connect(ctxRef.current.destination);
        masterRef.current = master;
      } catch (err) {
        logger.warn("Web Audio init failed", err);
        return null;
      }
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  };

  const beep = (
    freq: number,
    startOffset: number,
    durationMs: number,
    type: OscillatorType = "square",
    peakGain = 0.35,
  ) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.05);
    activeNodes.current.add(osc);
    osc.onended = () => activeNodes.current.delete(osc);
  };

  const slide = (
    fromHz: number,
    toHz: number,
    startOffset: number,
    durationMs: number,
    type: OscillatorType = "sawtooth",
    peakGain = 0.3,
  ) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(fromHz, now);
    osc.frequency.exponentialRampToValueAtTime(toHz, now + durationMs / 1000);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.05);
    activeNodes.current.add(osc);
    osc.onended = () => activeNodes.current.delete(osc);
  };

  const flash = () => {
    if (!ensureCtx()) return;
    beep(1320, 0, 90, "square", 0.5);
    beep(1760, 0.04, 90, "square", 0.4);
  };

  const reels = () => {
    if (!ensureCtx()) return;
    // 12 ticks a lo largo de ~1.4s, simulando el giro de los reels.
    for (let i = 0; i < 12; i++) {
      beep(700 + (i % 3) * 60, i * 0.12, 50, "square", 0.18);
    }
  };

  const win = () => {
    if (!ensureCtx()) return;
    // Arpegio ascendente C-E-G-C estilo "ganaste".
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => beep(f, i * 0.09, 220, "triangle", 0.35));
    // Glissando ascendente debajo para dramatismo.
    slide(220, 880, 0, 700, "sawtooth", 0.18);
  };

  const coins = () => {
    if (!ensureCtx()) return;
    // Cascada de "monedas" — beeps cortos a frecuencias aleatorias agudas.
    for (let i = 0; i < 18; i++) {
      const f = 1200 + Math.random() * 1800;
      beep(f, 0.05 + i * 0.07 + Math.random() * 0.04, 60, "sine", 0.16);
    }
  };

  const stop = () => {
    activeNodes.current.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
    activeNodes.current.clear();
  };

  useEffect(
    () => () => {
      stop();
      try {
        ctxRef.current?.close();
      } catch {
        /* ignore */
      }
      ctxRef.current = null;
      masterRef.current = null;
    },
    [],
  );

  return { flash, reels, win, coins, stop };
}
