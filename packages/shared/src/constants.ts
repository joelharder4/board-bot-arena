
interface TeamInfo {
  name: string;
  hex: string;
  textClass: string;
  badgeClass: string;
};

export const TEAM_MAP: Record<number, TeamInfo> = {
  1: {
    name: "Blue",
    hex: "#3b82f6",
    textClass: "text-blue-400",
    badgeClass: "bg-blue-300",
  },
  2: {
    name: "Red",
    hex: "#ef4444",
    textClass: "text-red-400",
    badgeClass: "bg-red-300",
  },
  3: {
    name: "Green",
    hex: "#22c55e",
    textClass: "text-green-400",
    badgeClass: "bg-green-300",
  },
  4: {
    name: "Yellow",
    hex: "#eab308",
    textClass: "text-yellow-800",
    badgeClass: "bg-yellow-300",
  }
};

export const CHAT_MAX_LENGTH = 200;
export const USERNAME_MAX_LENGTH = 32;
export const EMAIL_MAX_LENGTH = 255;
export const JOIN_CODE_LENGTH = 6;