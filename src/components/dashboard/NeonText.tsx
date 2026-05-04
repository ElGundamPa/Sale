import { cn } from "@/lib/utils";

interface NeonTextProps {
  children: React.ReactNode;
  color?: "orange" | "cyan" | "danger" | "success";
  className?: string;
}

const COLOR_MAP = {
  orange: "#FFB347",
  cyan: "#34D8FF",
  danger: "#FF3B5C",
  success: "#34FFB0",
} as const;

export function NeonText({
  children,
  color = "orange",
  className,
}: NeonTextProps) {
  const c = COLOR_MAP[color];
  return (
    <span
      className={cn("font-display", className)}
      style={{
        color: c,
        textShadow: `0 0 6px ${c}, 0 0 18px ${c}cc, 0 0 36px ${c}99, 0 0 64px ${c}66`,
      }}
    >
      {children}
    </span>
  );
}
