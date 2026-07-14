import React, { useEffect, useState } from "react"
import { api } from "../services/api";
import type { LobbyPlayer, MatchDetailsParams, MatchDetailsResponse } from "@board-bot-arena/shared";
import { message } from "antd";
import { useMatchStore } from "../services/useMatchStore";

const MatchLobby: React.FC = () => {
  const [playerList, setPlayerList] = useState<Array<LobbyPlayer>>([]);
  const matchId = useMatchStore((state) => state.matchId);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        if (!matchId) return;
        const params: MatchDetailsParams = { matchId }
        const res = await api.get<MatchDetailsResponse>(`/matches/${matchId}`, { params: params });
        setPlayerList(res.data.players);
      } catch {
        message.error('Failed to fetch match details');
        // TODO: retry/leave?
      }
    }
    
    fetchPlayers();
  }, [matchId]);

  return (
    <div className="flex flex-col">
      {playerList.map((p: LobbyPlayer) => {
        return (
          <div className="p-4 rounded-sm w-full bg-accent text-primary flex flex-row">
            {p.name}
            {p.type === "bot" && <div>BOT</div>}
          </div>
        );
      })}
    </div>
  );
}

export default MatchLobby;