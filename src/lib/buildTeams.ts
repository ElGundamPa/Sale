import type { Agent, Team } from "@/types";
import type { AgentRow, TeamRow } from "@/types/database";
import type { SheetPayload } from "@/hooks/useGoogleSheetData";

const norm = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Merges the live Apps Script payload (totals + per-agent sales) with the
 * Supabase agents table (photos, songs, start times, team assignment, order).
 * Source-of-truth for *who exists* is Supabase; for *how much they sold* is the Sheet.
 */
export function buildTeams(
  supaAgents: AgentRow[],
  supaTeams: TeamRow[],
  sheet: SheetPayload | null,
): Team[] {
  const salesByAgent = new Map<string, number>();
  const totalByTeam = new Map<string, number>();
  for (const t of sheet?.teams ?? []) {
    if (typeof t.total_real === "number") totalByTeam.set(t.id, t.total_real);
    for (const a of t.agents ?? []) {
      salesByAgent.set(norm(a.name), Number(a.sales) || 0);
    }
  }

  return supaTeams
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((t) => {
      const teamAgents: Agent[] = supaAgents
        .filter((a) => a.team_id === t.id)
        .sort((a, b) => a.display_order - b.display_order)
        .map((row) => ({
          id: row.id,
          name: row.name,
          photoUrl: row.photo_url,
          songUrl: row.song_url,
          songStartSeconds: Number(row.song_start_seconds) || 0,
          teamId: row.team_id,
          displayOrder: row.display_order,
          total: salesByAgent.get(norm(row.name)) ?? 0,
        }));

      const total =
        totalByTeam.get(t.id) ??
        teamAgents.reduce((sum, a) => sum + a.total, 0);

      return {
        id: t.id,
        name: t.name,
        goal: Number(t.goal),
        iconUrl: t.icon_url,
        displayOrder: t.display_order,
        total,
        agents: teamAgents,
      };
    });
}
