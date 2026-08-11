import type { MatchLogEvent } from "@board-bot-arena/shared";

export const SystemMessage = ({ event }: { event: Extract<MatchLogEvent, { type: 'system' }> }) => {
  return (
    <div className="text-gray-400 text-sm italic text-center my-2">
      {event.payload.message}
    </div>
  );
};