import { MatchStatus, TEAM_MAP, type LobbyPlayer } from "@board-bot-arena/shared";
import type React from "react";
import PlayerTag from "../../ui/PlayerTag";
import { useMatchStore } from "../../../services/useMatchStore";
import { Skeleton } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { GiVisoredHelm } from "react-icons/gi";
import { TbRoad } from "react-icons/tb";


const PlayerListContainer: React.FC = () => {
  const matchStatus = useMatchStore((state) => state.matchStatus);
  const playerList = useMatchStore((state) => state.playerList);
  const gameStatePlayers = useMatchStore((state) => state.gameState?.players);
  const turnPlayerId = useMatchStore((state) => state.gameState?.turnPlayerId);

  if (matchStatus === MatchStatus.PENDING) {
    return <> {
      playerList.map((p: LobbyPlayer) => {
        return (
          <div key={p.playerId} className="border-b border-gray-200 h-16 flex flex-row items-center p-3 gap-3">
            <div className={`w-8 h-8 rounded-sm ${TEAM_MAP[p.teamId].badgeClass}`}></div>
            <div className="flex flex-col justify-between">
              <div className="flex flex-row gap-1.5 items-center">
                <span className="text-sm font-bold leading-none">{p.name}</span>
                {p.type === "user" && p.isHost && <PlayerTag text="HOST"/>}
                {p.type === "bot" && <PlayerTag text="BOT" classes="bg-gray-200 text-gray-900"/>}
              </div>
              <span className="text-xs text-gray-600">{TEAM_MAP[p.teamId].name} Team</span>
            </div>
          </div>
        );
      })
    } </>
  }

  if (matchStatus === MatchStatus.IN_PROGRESS && !!gameStatePlayers) {
    return <> {
      playerList.map((p: LobbyPlayer) => {
        const pGame = gameStatePlayers[p.playerId];
        if (!pGame) return null;

        return (
          <div key={p.playerId} className="border-b border-gray-200 h-20 flex flex-col gap-1 p-3">
            <div className="flex flex-row items-center gap-3">
              <div className={`w-8 h-8 rounded-sm ${TEAM_MAP[p.teamId].badgeClass} ${turnPlayerId === p.playerId && "animate-pulse"}`}></div>
              <div className="flex flex-col justify-between">
                <div className="flex flex-row gap-1.5 items-center">
                  <span className="text-sm font-bold leading-none">{p.name}</span>
                  {p.type === "user" && p.isHost && <PlayerTag text="HOST"/>}
                  {p.type === "bot" && <PlayerTag text="BOT" classes="bg-gray-200 text-gray-900"/>}
                  {p.abandoned && <PlayerTag text="QUIT" classes="bg-red-200 text-red-900"/>}
                </div>
                <span className="text-xs text-gray-600">{TEAM_MAP[p.teamId].name} Team</span>
              </div>
            </div>
            {/* TODO: Add card count */}

            <div className="mt-auto pt-1 flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-1.5 text-yellow-700 px-2 py-0.5">
                <TrophyOutlined className="text-yellow-600 text-sm" />
                <span className="text-sm font-bold leading-none">{pGame.victoryPoints} VP</span>
              </div>

              <div className="flex flex-row items-center gap-3 text-gray-600 font-semibold px-2 py-0.5">
                <div className="flex flex-row items-center gap-1" title="Knights Played">
                  <GiVisoredHelm className="text-sm"/>
                  <span className="text-sm leading-none">{pGame.knightsPlayed}</span>
                </div>
                <div className="flex flex-row items-center gap-1" title="Longest Road">
                  <TbRoad className="text-sm" />
                  <span className="text-sm leading-none">{pGame.maxConnectedRoads}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })
    } </>
  }

  return <Skeleton.Node active style={{ width: "calc(100% - 24px)", height: "4rem", margin: "12px" }} />;
}

export default PlayerListContainer;