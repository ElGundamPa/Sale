import { useEffect, useMemo, useState } from "react";
import { KriptexBackground } from "@/components/dashboard/KriptexBackground";
import { StartScreen } from "@/components/dashboard/StartScreen";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { JackpotOverlay } from "@/components/dashboard/JackpotOverlay";
import { useAgents } from "@/hooks/useAgents";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useGoogleSheetData } from "@/hooks/useGoogleSheetData";
import { buildTeams } from "@/lib/buildTeams";
import { mockTeams } from "@/config/mockData";
import type { JackpotEvent, Sale, Team } from "@/types";

const norm = (s: string) => s.trim().toLowerCase();

export default function Index() {
  const [entered, setEntered] = useState(false);
  const [queue, setQueue] = useState<JackpotEvent[]>([]);
  const [current, setCurrent] = useState<JackpotEvent | null>(null);

  const { agents, teams: teamRows, error: agentsError } = useAgents();
  const { settings } = useAppSettings();

  const sheet = useGoogleSheetData({
    pollingIntervalSeconds: settings.polling_interval_seconds,
    enabled: entered,
    onNewSale: (sale: Sale) => {
      const liveAgents = teamRows.length
        ? buildTeams(agents, teamRows, null).flatMap((t) => t.agents)
        : mockTeams.flatMap((t) => t.agents);
      const match = liveAgents.find((a) => norm(a.name) === norm(sale.agentName));
      if (!match) return;
      setQueue((q) => [
        ...q,
        { agent: match, amount: sale.value, triggeredAt: Date.now() },
      ]);
    },
  });

  const liveTeams = useMemo<Team[]>(() => {
    if (!teamRows.length) return mockTeams;
    return buildTeams(agents, teamRows, sheet.data);
  }, [agents, teamRows, sheet.data]);

  useEffect(() => {
    if (current || queue.length === 0) return;
    setCurrent(queue[0]);
    setQueue((q) => q.slice(1));
  }, [current, queue]);

  return (
    <div className="relative h-full w-full">
      <KriptexBackground />

      {!entered ? (
        <StartScreen onEnter={() => setEntered(true)} />
      ) : (
        <DashboardView teams={liveTeams} />
      )}

      <JackpotOverlay event={current} onComplete={() => setCurrent(null)} />

      {entered && (agentsError || sheet.error) && (
        <div className="fixed bottom-4 left-4 z-40 max-w-sm rounded-md border border-kriptex-danger bg-black/80 px-4 py-2 text-xs text-kriptex-danger">
          {agentsError && <div>DB: {agentsError}</div>}
          {sheet.error && <div>Sheet: {sheet.error}</div>}
        </div>
      )}
    </div>
  );
}
