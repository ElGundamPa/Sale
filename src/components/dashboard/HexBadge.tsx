import { cn } from "@/lib/utils";

interface HexBadgeProps {
  rank: 1 | 2 | 3 | number;
  size?: number;
  className?: string;
}

const PALETTE: Record<
  number,
  { fill: string; stroke: string; glow: string; text: string }
> = {
  1: { fill: "#FF8A2A", stroke: "#FFD07A", glow: "#FFB347", text: "#050E1F" },
  2: { fill: "#34D8FF", stroke: "#A8EFFF", glow: "#34D8FF", text: "#050E1F" },
  3: { fill: "#0FA3C7", stroke: "#34D8FF", glow: "#0FA3C7", text: "#050E1F" },
};

const DEFAULT = {
  fill: "#1F3A5F",
  stroke: "#34D8FF",
  glow: "#34D8FF",
  text: "#E6F1FF",
};

export function HexBadge({ rank, size = 48, className }: HexBadgeProps) {
  const p = PALETTE[rank] ?? DEFAULT;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn(className)}
      style={{
        filter: `drop-shadow(0 0 6px ${p.glow}aa) drop-shadow(0 0 14px ${p.glow}66)`,
      }}
      aria-hidden
    >
      <polygon
        points="50,4 92,28 92,72 50,96 8,72 8,28"
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth="2.5"
      />
      <polygon
        points="50,18 78,34 78,66 50,82 22,66 22,34"
        fill="none"
        stroke={p.stroke}
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="Audiowide, Orbitron, sans-serif"
        fontSize="34"
        fontWeight="700"
        fill={p.text}
      >
        {rank}
      </text>
    </svg>
  );
}
