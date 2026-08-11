import type { MatchLogEvent } from "@board-bot-arena/shared";
import { SystemMessage } from "./variants/SystemMessage";
import { ChatMessage } from "./variants/ChatMessage";

export const LogEventRouter = ({ event }: { event: MatchLogEvent }) => {
  switch (event.type) {
    case "system":
      return <SystemMessage event={event} />;
    case "chat":
      return <ChatMessage event={event} />;
    case "action":
      // return <ActionMessage event={event} />;
      return null;
    case "trade":
      // return <TradeMessage event={event} />;
      return null;
    default:
      console.warn("Unknown log type", event);
      return null;
  }
};