import { FrontiersPickupLogSchema, FrontiersRollLogSchema, LogType, Resource, TEAM_MAP, type MatchLogEvent } from "@board-bot-arena/shared";
import { useMatchStore } from "../../../services/useMatchStore";
import { DiceIconD6 } from "../../ui/icons/DiceIconD6";
import { FrontiersCard } from "../../ui/icons/FrontiersCard";

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
      <div className="text-sm my-2 flex flex-row justify-center items-center text-center gap-1">
        <span className={`font-semibold ${nameColourClass}`}>{playerName}</span>
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

  if (event.payload.actionId === "pickup") {
    const pickupLog = FrontiersPickupLogSchema.parse(event.payload);

    return (
      <div className="text-sm my-2 flex flex-row justify-center items-center text-center gap-1">
        <span className={`font-semibold ${nameColourClass}`}>{playerName}</span>
        <span>picked up</span>

        <span className="select-none flex flex-row gap-1">
          {Object.entries(pickupLog.data.resources).map(([res, num]) => {
            if (num === 0) return <></>;
            if (num <= 3) return (
              <div className={`flex flex-row ${num === 2 && "ml-1 mr-1"} ${num === 3 && "ml-2 mr-2"}`}>
                {Array(num).fill(null).map(() => <FrontiersCard resource={res as Resource} size="small" className="-ml-8 first:m-0 shadow-sm"/> )}
              </div>
            );
            if (num > 3) return (
              <div key={res} className="relative">
                <FrontiersCard resource={res as Resource} size="small" className="shadow-sm" />
                <span className="absolute -top-1.5 -right-2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg border border-white z-10 shadow-sm leading-none">
                  x{num}
                </span>
              </div>
            );
          })}
        </span>
      </div>
    );
  }
  
  return <></>;
};