import type { MatchLogEvent } from "@board-bot-arena/shared";

export const ChatMessage = ({ event }: { event: Extract<MatchLogEvent, { type: 'chat' }> }) => {
  return (
    <div className="bg-blue-100 text-blue-900 p-2 rounded-lg my-1 w-fit max-w-[80%]">
      <span className="font-bold text-xs block">{event.payload.senderPlayerId}</span>
      <span>{event.payload.text}</span>
    </div>
  );
};