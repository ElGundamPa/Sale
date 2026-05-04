import { motion } from "framer-motion";
import type { Agent } from "@/types";
import { HexBadge } from "./HexBadge";
import { formatCurrency } from "@/lib/utils";

interface AgentRowProps {
  agent: Agent;
  rank: number;
}

export function AgentRow({ agent, rank }: AgentRowProps) {
  const isPodium = rank <= 3;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="flex items-center gap-4 rounded-md border border-kriptex-cyan/20 bg-kriptex-navy-deep/55 px-4 py-3"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        {isPodium ? (
          <HexBadge rank={rank as 1 | 2 | 3} size={48} />
        ) : (
          <span className="font-display text-2xl text-kriptex-cyan/70">
            {rank}
          </span>
        )}
      </div>

      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md ring-2 ring-kriptex-orange/70">
        {agent.photoUrl ? (
          <img
            src={agent.photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-kriptex-navy-mid font-display text-kriptex-orange">
            {agent.name.charAt(0)}
          </div>
        )}
      </div>

      <p className="flex-1 truncate font-sans text-lg font-semibold text-kriptex-cream">
        {agent.name}
      </p>

      <p className="font-digital text-xl text-orange-glow">
        {formatCurrency(agent.total)}
      </p>
    </motion.li>
  );
}
