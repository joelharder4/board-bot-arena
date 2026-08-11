import { TEAM_MAP, type MatchLogEvent } from "@board-bot-arena/shared";
import { useMatchStore } from "../../../services/useMatchStore";

export const ChatMessage = ({ event }: { event: Extract<MatchLogEvent, { type: 'chat' }> }) => {
  const teamId = useMatchStore((state) => {
    const player = state.playerList.find((p) => p.type === "user" && p.userId === event.payload.userId);
    return player?.teamId;
  });

  const nameColourClass = teamId ? TEAM_MAP[teamId].textClass : "";

  return (
    <div className="p-2 rounded-lg w-fit max-w-full">
      <span className={`font-bold text-xs block ${nameColourClass}`}>{event.payload.name}</span>
      <div className="whitespace-normal wrap-break-word text-sm leading-6">{event.payload.text}</div>
    </div>
  );
};