import React from "react"
import { useMatchStore } from "../services/useMatchStore";

const MatchLobby: React.FC = () => {
  const matchId = useMatchStore((state) => state.matchId);

  return (
    <div className="flex flex-col">
      
    </div>
  );
}

export default MatchLobby;