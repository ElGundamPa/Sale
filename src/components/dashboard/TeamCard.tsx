import type { Team } from "@/types";
import { AgentRow } from "./AgentRow";
import { formatCurrency } from "@/lib/utils";

interface TeamCardProps {
  team: Team;
}

const SEGMENT_COUNT = 14;

function ProgressBar({ progress }: { progress: number }) {
  const filled = Math.round(progress * SEGMENT_COUNT);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
        const lit = i < filled;
        return (
          <span
            key={i}
            className={
              "h-3 flex-1 rounded-sm border " +
              (lit
                ? "border-kriptex-orange-bright bg-gradient-to-b from-kriptex-orange-bright via-kriptex-orange to-kriptex-orange-deep shadow-[0_0_6px_rgba(255,138,42,0.55)]"
                : "border-kriptex-cyan/20 bg-kriptex-steel/40")
            }
          />
        );
      })}
    </div>
  );
}

export function TeamCard({ team }: TeamCardProps) {
  const progress = Math.min(team.total / team.goal, 1);
  const sortedAgents = [...team.agents].sort((a, b) => b.total - a.total);

  return (
    <section className="kriptex-card relative overflow-hidden p-6">
      <header className="mb-5 flex items-end justify-between gap-4 border-b border-kriptex-cyan/30 pb-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.5em] text-kriptex-cyan/70">
            Trading desk
          </p>
          <h2 className="font-display text-3xl text-orange-glow">{team.name}</h2>
        </div>
        <div className="text-right">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-kriptex-cream/60">
            Volume
          </p>
          <p className="font-digital text-3xl text-cyan-glow">
            {formatCurrency(team.total)}
          </p>
          <p className="font-sans text-xs text-kriptex-cream/50">
            target {formatCurrency(team.goal)}
          </p>
        </div>
      </header>

      <div className="mb-6">
        <ProgressBar progress={progress} />
        <p className="mt-2 font-sans text-sm tracking-wider text-kriptex-cream/70">
          {Math.round(progress * 100)}% to desk target
        </p>
      </div>

      <ul className="space-y-2">
        {sortedAgents.map((agent, i) => (
          <AgentRow key={agent.id} agent={agent} rank={i + 1} />
        ))}
      </ul>
    </section>
  );
}
