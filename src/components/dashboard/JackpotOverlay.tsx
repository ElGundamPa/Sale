import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { JackpotEvent } from "@/types";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { formatCurrency } from "@/lib/utils";
import {
  JACKPOT_AUDIO_FADE_MS,
  JACKPOT_DURATION_MS,
  JACKPOT_FLASH_MS,
  JACKPOT_REEL_SPIN_MS,
} from "@/config/constants";

interface JackpotOverlayProps {
  event: JackpotEvent | null;
  onComplete: () => void;
}

const REEL_FACES = ["⚡", "◆", "▲", "✦", "◯", "❖", "K", "⬢", "◈", "⬣", "✧"];
const SHARD_COUNT = 36; // was 70 — kept for visual density without crushing FPS

function MarqueeFrame({
  photoUrl,
  name,
}: {
  photoUrl: string | null;
  name: string;
}) {
  const bulbCount = 24;
  const bulbs = useMemo(
    () => Array.from({ length: bulbCount }, (_, i) => i),
    [],
  );
  return (
    <div className="relative h-72 w-72">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, transparent 65%, #0FA3C7 65%, #34D8FF 73%, #FFB347 78%, #FF8A2A 83%, #C95A0F 90%, transparent 92%)",
        }}
      />
      {bulbs.map((i) => {
        const angle = (i / bulbCount) * Math.PI * 2;
        const r = 47;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        const isOrange = i % 2 === 0;
        return (
          <span
            key={i}
            className="anim-marquee-bulb absolute h-3 w-3 rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              background: isOrange ? "#FFB347" : "#34D8FF",
              animationDelay: `${i * 0.06}s`,
              boxShadow: `0 0 6px ${isOrange ? "#FFB347" : "#34D8FF"}`,
            }}
          />
        );
      })}
      <div className="absolute inset-6 overflow-hidden rounded-full ring-4 ring-kriptex-orange-deep">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-kriptex-navy-deep">
            <span className="font-display text-9xl text-kriptex-orange">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotReel({
  finalFace,
  delayMs,
}: {
  finalFace: string;
  delayMs: number;
}) {
  const strip = useMemo(() => {
    const filler = Array.from(
      { length: 24 },
      (_, i) => REEL_FACES[i % REEL_FACES.length],
    );
    return [...filler, finalFace];
  }, [finalFace]);

  const itemHeight = 96;
  const totalShift = (strip.length - 1) * itemHeight;

  return (
    <div className="slot-window h-24 w-32">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: -totalShift }}
        transition={{
          duration: (JACKPOT_REEL_SPIN_MS + delayMs) / 1000,
          ease: [0.05, 0.7, 0.1, 1.0],
          delay: delayMs / 1000,
        }}
        className="flex flex-col"
      >
        {strip.map((face, i) => (
          <div
            key={i}
            className="flex h-24 w-32 shrink-0 items-center justify-center font-display text-5xl text-orange-glow"
          >
            {face}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function HexShard() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <polygon
        points="50,4 92,28 92,72 50,96 8,72 8,28"
        fill="#FF8A2A"
        stroke="#FFD07A"
        strokeWidth="2"
      />
    </svg>
  );
}
function DiamondShard() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <polygon
        points="50,8 90,50 50,92 10,50"
        fill="#34D8FF"
        stroke="#A8EFFF"
        strokeWidth="2"
      />
    </svg>
  );
}

function ShardRain() {
  const pieces = useMemo(() => {
    return Array.from({ length: SHARD_COUNT }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      size: 22 + Math.random() * 22,
      kind: i % 3 === 0 ? "diamond" : "hex",
      rotateStart: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="anim-shard-fall absolute"
          style={{
            left: `${p.left}%`,
            top: "-10%",
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotateStart}deg)`,
          }}
        >
          {p.kind === "diamond" ? <DiamondShard /> : <HexShard />}
        </span>
      ))}
    </div>
  );
}

const FIREWORK_COLORS = ["#FFB347", "#FF8A2A", "#34D8FF"];
const FIREWORK_RAYS = 12;

function FireworkBurst({
  position,
  delay,
}: {
  position: "tl" | "tr" | "bl" | "br";
  delay: number;
}) {
  const offsets = {
    tl: { left: "10%", top: "12%" },
    tr: { right: "10%", top: "12%" },
    bl: { left: "10%", bottom: "12%" },
    br: { right: "10%", bottom: "12%" },
  } as const;
  return (
    <div className="pointer-events-none absolute h-2 w-2" style={offsets[position]}>
      {Array.from({ length: FIREWORK_RAYS }).map((_, i) => {
        const angle = (i / FIREWORK_RAYS) * 360;
        const color = FIREWORK_COLORS[i % FIREWORK_COLORS.length];
        return (
          <span
            key={i}
            className="anim-firework absolute left-1/2 top-1/2 block w-1"
            style={{
              transform: `translate(-50%, 0) rotate(${angle}deg)`,
              background: `linear-gradient(to bottom, ${color}, transparent)`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function CountUp({
  value,
  durationMs = 1200,
}: {
  value: number;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const k = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(value * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return <span>+{formatCurrency(display)}</span>;
}

export function JackpotOverlay({ event, onComplete }: JackpotOverlayProps) {
  const { play, stop } = useAudioPlayer();
  const [phase, setPhase] = useState<
    "flash" | "reels" | "reveal" | "curtain" | "done"
  >("flash");

  useEffect(() => {
    if (!event) return;
    setPhase("flash");

    const t1 = window.setTimeout(() => setPhase("reels"), JACKPOT_FLASH_MS);
    const t2 = window.setTimeout(
      () => setPhase("reveal"),
      JACKPOT_FLASH_MS + JACKPOT_REEL_SPIN_MS + 600,
    );
    const t3 = window.setTimeout(
      () => setPhase("curtain"),
      JACKPOT_DURATION_MS - 500,
    );
    const t4 = window.setTimeout(() => {
      setPhase("done");
      onComplete();
    }, JACKPOT_DURATION_MS);

    if (event.agent.songUrl) {
      const audioStart = window.setTimeout(() => {
        play({
          url: event.agent.songUrl as string,
          startSeconds: event.agent.songStartSeconds,
          fadeOutMs: JACKPOT_AUDIO_FADE_MS,
          totalDurationMs: JACKPOT_DURATION_MS - JACKPOT_FLASH_MS,
        });
      }, JACKPOT_FLASH_MS);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
        window.clearTimeout(t4);
        window.clearTimeout(audioStart);
        stop();
      };
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.triggeredAt]);

  return (
    <AnimatePresence>
      {event && phase !== "done" && (
        <motion.div
          key={event.triggeredAt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(19, 41, 77, 0.95) 0%, rgba(5, 14, 31, 0.98) 75%)",
          }}
        >
          <AnimatePresence>
            {phase === "flash" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: JACKPOT_FLASH_MS / 1000,
                  times: [0, 0.3, 1],
                }}
                className="absolute inset-0 bg-white"
              />
            )}
          </AnimatePresence>

          {phase === "reels" && (
            <div className="flex flex-col items-center gap-6">
              <h2 className="font-display text-7xl">
                <span
                  style={{
                    color: "#34D8FF",
                    textShadow:
                      "0 0 8px #34D8FF, 0 0 24px rgba(15,163,199,0.7)",
                  }}
                >
                  JACKPOT!
                </span>
              </h2>
              <div className="flex gap-4 rounded-2xl border-4 border-kriptex-orange bg-kriptex-navy-deep p-6 shadow-[0_0_60px_rgba(255,138,42,0.45)]">
                <SlotReel finalFace="K" delayMs={0} />
                <SlotReel finalFace="◆" delayMs={250} />
                <SlotReel finalFace="⚡" delayMs={500} />
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="anim-marquee-bulb h-2 w-2 rounded-full"
                    style={{
                      background: i % 2 === 0 ? "#FFB347" : "#34D8FF",
                      animationDuration: "0.5s",
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {(phase === "reveal" || phase === "curtain") && (
            <>
              <ShardRain />
              <FireworkBurst position="tl" delay={0} />
              <FireworkBurst position="tr" delay={0.3} />
              <FireworkBurst position="bl" delay={0.6} />
              <FireworkBurst position="br" delay={0.9} />

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="relative z-10 flex flex-col items-center gap-6 text-center"
              >
                <h2 className="font-display text-8xl leading-none">
                  <span
                    style={{
                      color: "#34D8FF",
                      textShadow:
                        "0 0 8px #34D8FF, 0 0 24px rgba(15,163,199,0.7), 0 0 48px rgba(15,163,199,0.4)",
                    }}
                  >
                    JACKPOT!
                  </span>
                </h2>

                <MarqueeFrame
                  photoUrl={event.agent.photoUrl}
                  name={event.agent.name}
                />

                <p className="font-display text-5xl text-orange-glow">
                  {event.agent.name}
                </p>

                <div className="rounded-lg border-2 border-kriptex-orange bg-kriptex-navy-deep px-10 py-4 font-digital text-7xl shadow-[0_0_40px_rgba(255,138,42,0.55)]">
                  <span
                    style={{
                      color: "#FFB347",
                      textShadow: "0 0 10px #FF8A2A",
                    }}
                  >
                    <CountUp value={event.amount} />
                  </span>
                </div>
              </motion.div>
            </>
          )}

          {phase === "curtain" && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              style={{
                position: "fixed",
                inset: 0,
                background:
                  "linear-gradient(180deg, #0A1B33 0%, #050E1F 100%)",
                transformOrigin: "top center",
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
