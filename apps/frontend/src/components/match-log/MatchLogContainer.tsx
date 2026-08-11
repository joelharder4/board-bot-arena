import { useEffect, useRef } from "react";
import { useMatchStore } from "../../services/useMatchStore"
import { LogEventRouter } from "./LogEventRouter";

export const MatchLogContainer = () => {
  const matchLog = useMatchStore((state) => state.matchLog);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [matchLog]);

  return (
    <div className="flex flex-col h-full w-full rounded-lg overflow-hidden">
      
      {/* Scrollable Log Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {matchLog.map((log) => (
          <LogEventRouter key={log.id} event={log} />
        ))}
        {/* Invisible div to act as the scroll target */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}