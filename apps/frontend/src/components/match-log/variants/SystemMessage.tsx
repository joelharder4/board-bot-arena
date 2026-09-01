import type { LogType, MatchLogEvent } from "@board-bot-arena/shared";

export const SystemMessage = ({ event }: { event: Extract<MatchLogEvent, { type: LogType.SYSTEM }> }) => {
  return (
    <div className="text-gray-400 text-sm italic text-center my-2">
      {event.payload.message}
    </div>
  );
};