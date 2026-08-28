import { useEffect, useRef } from "react";
import { useMatchStore } from "../../services/useMatchStore"
import { LogEventRouter } from "./LogEventRouter";

export const MatchLogContainer = () => {
  const matchLog = useMatchStore((state) => state.matchLog);
  const matchStatus = useMatchStore((state) => state.matchStatus);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [matchLog, matchStatus]);

  return (
    <div className="flex flex-col h-full w-full rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 px-6 flex flex-col gap-1">
        {matchLog.map((log) => (
          <LogEventRouter key={log.id} event={log} />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}