import type React from "react";
import { useState } from "react";
import { type JoinMatchResponse, type Match } from "@board-bot-arena/shared";
import { cn } from "../../utils/shadcn";
import { Button, message } from "antd";
import CatanLobbyImage from "../../assets/catan_lobby.png";
import { api } from "../../services/api";
import { useNavigate } from "react-router";

interface props {
  lobby: Match;
  size?: string | undefined;
  className?: string | undefined;
};

const LobbyCard: React.FC<props> = ({lobby, size, className}: props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const buttonSize = size === "large" ? "large" : "medium";

  const onTryJoin = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<JoinMatchResponse>('/matches/join', { matchId: lobby.matchId });
      // const playerSlot = res.data.playerSlot;
      if (!res.data.matchId) throw new Error("Did not receive matchId from the server");
      navigate(`/lobby/${res.data.matchId}`);
    } catch {
      message.error("Failed to join lobby");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-50 border rounded-lg overflow-hidden", className)}>
      <div 
        className="h-full relative bg-gray-200"
        style={{
          backgroundImage: `url(${CatanLobbyImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 flex items-end p-4 bg-linear-to-t from-black/60 to-transparent">
          <h3 className="text-white font-bold text-lg">{lobby.gameTitle}</h3>
          <h3 className="text-white font-bold text-md ml-auto">{lobby.numPlayers} / {lobby.maxPlayers}</h3>
        </div>
      </div>

      <div className="p-0">
        <Button
          type="primary"
          className="rounded-t-none"
          style={{borderTopLeftRadius: "0px", borderTopRightRadius: "0px"}}
          block
          disabled={isLoading}
          size={buttonSize}
          onClick={onTryJoin}
        >
          <span className="min-w-20">
            {isLoading ? 'Joining...' : 'Join'}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default LobbyCard;