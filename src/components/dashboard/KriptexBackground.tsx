import { useMemo } from "react";

/**
 * Lightweight foreground decoration over the global body background image.
 * - Particles: 14 (was 28). Smaller blur radius. Pure CSS animation.
 * - No grid overlay, no per-corner SVG beams (those came from the image now).
 */

const PARTICLE_COUNT = 14;

interface Particle {
  left: number;
  size: number;
  duration: number;
  delay: number;
  hue: "orange" | "cyan";
}

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    left: Math.random() * 100,
    size: 2 + Math.random() * 2,
    duration: 22 + Math.random() * 18,
    delay: Math.random() * -30,
    hue: Math.random() > 0.45 ? "orange" : "cyan",
  }));
}

export function KriptexBackground() {
  const particles = useMemo(makeParticles, []);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="anim-particle absolute block rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: "-10vh",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.hue === "orange" ? "#FFB347" : "#34D8FF",
            boxShadow: `0 0 ${p.size * 2}px ${p.hue === "orange" ? "#FF8A2A" : "#34D8FF"}`,
            opacity: 0.32,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
