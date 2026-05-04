import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/branding";

interface BrandMarkProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

function MonogramSvg({ size, label }: { size: number; label: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="brand-mono-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="100%" stopColor="#C95A0F" />
        </linearGradient>
        <linearGradient id="brand-mono-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34D8FF" />
          <stop offset="100%" stopColor="#0FA3C7" />
        </linearGradient>
      </defs>
      <polygon
        points="50,4 92,28 92,72 50,96 8,72 8,28"
        fill="rgba(10, 27, 51, 0.85)"
        stroke="url(#brand-mono-stroke)"
        strokeWidth="2.5"
      />
      <polygon
        points="50,16 80,33 80,67 50,84 20,67 20,33"
        fill="none"
        stroke="rgba(255, 179, 71, 0.45)"
        strokeWidth="1"
      />
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fontFamily="Audiowide, Orbitron, sans-serif"
        fontSize="38"
        fontWeight="700"
        fill="url(#brand-mono-fill)"
      >
        {label.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}

export function BrandMark({
  size = 96,
  showWordmark = false,
  className,
}: BrandMarkProps) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = BRAND.documentTitle;
    }
  }, []);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className="relative"
        style={{
          filter:
            "drop-shadow(0 0 12px rgba(255, 138, 42, 0.45)) drop-shadow(0 0 24px rgba(52, 216, 255, 0.18))",
        }}
      >
        {BRAND.logoPath ? (
          <img
            src={BRAND.logoPath}
            alt={BRAND.name}
            width={size}
            height={Math.round(size * 0.55)}
            style={{ width: size, height: "auto", objectFit: "contain" }}
          />
        ) : (
          <MonogramSvg size={size} label={BRAND.monogram} />
        )}
      </div>
      {showWordmark && (
        <span
          className="font-display tracking-[0.35em] text-orange-glow"
          style={{ fontSize: Math.max(16, size * 0.16) }}
        >
          {BRAND.name.toUpperCase()}
        </span>
      )}
    </div>
  );
}
