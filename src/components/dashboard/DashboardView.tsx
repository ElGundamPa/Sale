import { useMemo } from "react";
import type { Team } from "@/types";
import { TeamCard } from "./TeamCard";
import { NeonText } from "./NeonText";
import { BrandMark } from "./BrandMark";
import { BRAND } from "@/config/branding";
import { formatCurrency } from "@/lib/utils";

interface DashboardViewProps {
  teams: Team[];
}

export function DashboardView({ teams }: DashboardViewProps) {
  const houseTotal = useMemo(
    () => teams.reduce((sum, t) => sum + t.total, 0),
    [teams],
  );
  const houseGoal = useMemo(
    () => teams.reduce((sum, t) => sum + t.goal, 0),
    [teams],
  );

  return (
    <div className="flex h-full w-full flex-col px-8 py-6">
      <header className="flex items-center justify-between gap-6 border-b border-kriptex-cyan/30 pb-6">
        <div className="flex items-center gap-4">
          <BrandMark size={56} />
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.4em] text-kriptex-cyan/70">
              Sales Floor
            </p>
            <h1 className="font-display text-4xl leading-none text-orange-glow">
              {BRAND.name.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="anim-live-pulse h-3 w-3 rounded-full"
            style={{
              background: "var(--color-danger)",
              boxShadow:
                "0 0 12px var(--color-danger), 0 0 24px var(--color-danger)",
            }}
          />
          <NeonText color="danger" className="text-3xl">
            LIVE
          </NeonText>
        </div>

        <div className="text-right">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-kriptex-cream/60">
            Total Volume
          </p>
          <p className="font-digital text-5xl text-cyan-glow">
            {formatCurrency(houseTotal)}
          </p>
          <p className="font-sans text-xs text-kriptex-cream/50">
            target {formatCurrency(houseGoal)}
          </p>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 overflow-auto py-6 lg:grid-cols-2 xl:grid-cols-2">
        {teams.length === 0 ? (
          <div className="col-span-full flex h-full items-center justify-center">
            <p className="font-sans text-xl text-kriptex-cream/60">
              No hay mesas configuradas. Andá a{" "}
              <a
                href="/admin"
                className="text-kriptex-orange underline underline-offset-4"
              >
                /admin
              </a>{" "}
              para crear una.
            </p>
          </div>
        ) : (
          teams.map((team) => <TeamCard key={team.id} team={team} />)
        )}
      </main>
    </div>
  );
}
