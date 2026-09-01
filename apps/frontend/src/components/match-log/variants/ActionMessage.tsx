import { FrontiersRollLogSchema, LogType, TEAM_MAP, type MatchLogEvent } from "@board-bot-arena/shared";
import { useMatchStore } from "../../../services/useMatchStore";
import { DiceIconD6 } from "../../ui/icons/DiceIconD6";

export const ActionMessage = ({ event }: { event: Extract<MatchLogEvent, { type: LogType.ACTION }> }) => {
  const player = useMatchStore((state) => {
    return state.playerList.find((p) => p.playerId === event.payload.playerId);
  });

  const teamId = player?.teamId;
  const playerName = player?.name ?? "Unknown";
  const nameColourClass = teamId ? TEAM_MAP[teamId].textClass : "";

  if (event.payload.actionId === "roll") {
    const rollLog = FrontiersRollLogSchema.parse(event.payload);

    return (
      <div className="text-gray-400 text-sm my-2 flex flex-row justify-center items-center text-center gap-1.5">
        <span className={nameColourClass}>{playerName}</span>
        <span>rolled a {rollLog.data.total}</span>

        <span className="inline-flex items-center gap-0.5 select-none">
          <span className="relative top-[-1.5px] select-none">(</span>
          
          <DiceIconD6 value={rollLog.data.die1} className="text-lg" />
          <span className="relative top-[-0.5px] text-xs">+</span>
          <DiceIconD6 value={rollLog.data.die2} className="text-lg" />
          
          <span className="relative top-[-1.5px] select-none">)</span>
        </span>
      </div>
    );
  }
  
  return <></>;
};