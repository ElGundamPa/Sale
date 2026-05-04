export interface Agent {
  id: string;
  name: string;
  photoUrl: string | null;
  songUrl: string | null;
  songStartSeconds: number;
  teamId: string;
  displayOrder: number;
  total: number;
}

export interface Team {
  id: string;
  name: string;
  goal: number;
  iconUrl: string | null;
  displayOrder: number;
  total: number;
  agents: Agent[];
}

export interface Sale {
  id: string;
  agentName: string;
  entryDate: string;
  value: number;
}

export interface JackpotEvent {
  agent: Agent;
  amount: number;
  triggeredAt: number;
}
