
interface TeamInfo {
  name: string;
  hex: string;
  badgeClass: string;
}

export const TEAM_MAP: Record<number, TeamInfo> = {
  1: {
    name: "Blue",
    hex: "#3b82f6",
    badgeClass: "bg-blue-300"
  },
  2: {
    name: "Red",
    hex: "#ef4444",
    badgeClass: "bg-red-300"
  },
  3: {
    name: "Green",
    hex: "#22c55e",
    badgeClass: "bg-green-300",
  },
  4: {
    name: "Yellow",
    hex: "#eab308",
    badgeClass: "bg-yellow-300"
  }
}