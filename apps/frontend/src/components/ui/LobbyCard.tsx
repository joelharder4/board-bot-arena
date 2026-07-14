import type React from "react";
import { useState } from "react";
import { type JoinMatchResponse, type Match } from "@board-bot-arena/shared";
import { cn } from "../../utils/shadcn";
import { Button, message } from "antd";
import CatanLobbyImage from "../../assets/catan_lobby.png";
import { api } from "../../services/api";
import { useNavigate } from "react-router";
import { useMatchStore } from "../../services/useMatchStore";

const styleVariants = {
  large: {
    containerRadius: "rounded-2xl",
    imageArea: "p-6 pt-16",         // More padding, taller gradient fade
    badge: "px-3 py-1.5 text-sm",   // Bigger badge
    title: "text-2xl font-bold",   // Heavier, larger font
    footerArea: "p-4",              // Generous whitespace around the button
    footerText: "text-sm ml-2",
    buttonSize: "large" as const,
  },
  small: {
    containerRadius: "rounded-xl",
    imageArea: "p-4 pt-10",         // Tighter padding to save space
    badge: "px-2 py-1 text-xs",     // Compact badge
    title: "text-lg font-bold",     // Standard font size
    footerArea: "p-2",            // Tighter footer
    footerText: "text-xs ml-1",
    buttonSize: "middle" as const,
  }
};

interface props {
  lobby: Match;
  size?: keyof typeof styleVariants;
  className?: string | undefined;
};

const LobbyCard: React.FC<props> = ({lobby, size, className}: props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setMatchId = useMatchStore((state) => state.setMatchId);
  const setPlayerId = useMatchStore((state) => state.setPlayerId);
  const clearMatch = useMatchStore((state) => state.clearMatch);
  const navigate = useNavigate();

  const styles = styleVariants[size ?? "small"];

  const onTryJoin = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<JoinMatchResponse>('/matches/join', { matchId: lobby.matchId });
      // const playerSlot = res.data.playerSlot;
      if (!res.data.matchId) throw new Error("Did not receive matchId from the server");
      setMatchId(res.data.matchId);
      setPlayerId(res.data.playerId);
      navigate(`/lobby/${res.data.matchId}`);
    } catch {
      clearMatch();
      message.error("Failed to join lobby");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200",
        styles.containerRadius,
        className
      )}
    >
      <div
        className={cn(
          "grow relative flex flex-col justify-between bg-gray-200 border-b border-gray-200 bg-cover bg-center",
          styles.imageArea
        )}
        style={{ backgroundImage: `url(${CatanLobbyImage})` }}
      >
        <div className={cn(
          "absolute right-3 top-3 bg-gray-900/80 backdrop-blur-sm rounded-md shadow-sm font-bold text-white tracking-wide",
          styles.badge
        )}>
          <span className="text-xs font-bold text-white tracking-wide">
            {lobby.numPlayers} / {lobby.maxPlayers} Players
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-end">
          <h3 className={cn("text-white leading-tight", styles.title)}>{lobby.gameTitle}</h3>
        </div>
      </div>


      <div className={cn("bg-white flex justify-between items-center", styles.footerArea)}>
        <p className={cn("font-medium text-gray-500", styles.footerText)}>
          Public Match
        </p>
        <Button
          type="primary"
          size={styles.buttonSize}
          className="font-semibold shadow-sm"
          disabled={isLoading}
          onClick={onTryJoin}
        >
          <span className="min-w-20 text-center inline-block">
            {isLoading ? 'Joining...' : 'Join'}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default LobbyCard;