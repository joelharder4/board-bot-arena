import { Outlet } from "react-router";
import { useSocket } from "../providers/useSocket";
import { Button, message, Tooltip } from "antd";
import { CopyOutlined, MessageOutlined, RightOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { type Match, type LobbyPlayer, type MatchDetailsParams, type MatchDetailsResponse } from "@board-bot-arena/shared";
import { useMatchStore } from "../services/useMatchStore";
import { api } from "../services/api";

// TODO: Move to its own file?
interface PlayerTagProps {
  text: string;
  colour?: string;
}

const PlayerTag: React.FC<PlayerTagProps> = ({text}: PlayerTagProps) => {
  return (
    <span className="px-1.5 py-1 bg-indigo-200 text-[10px] leading-none text-indigo-800 rounded-xs uppercase">
      {text}
    </span>
  );
}



export default function MatchArenaLayout() {
  const [chatOpen, setChatOpen] = useState<boolean>(true);
  const [curMatch, setCurMatch] = useState<Match>();
  const [playerList, setPlayerList] = useState<Array<LobbyPlayer>>([]);
  const matchId = useMatchStore((state) => state.matchId);

  const { isConnected } = useSocket();

  useEffect(() => {
      const fetchDetails = async () => {
      try {
          if (!matchId) return;
          const params: MatchDetailsParams = { matchId }
          const res = await api.get<MatchDetailsResponse>(`/matches/${matchId}`, { params: params });
          setPlayerList(res.data.players);
          setCurMatch(res.data.match);
      } catch {
          message.error('Failed to fetch match details');
          // TODO: retry/leave?
      }
      }
      
      fetchDetails();
  }, [matchId]);

  const onLeaveMatch = () => {
    message.info("NOT IMPLEMENTED");
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-accent">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <div className="divide-x divide-gray-300 flex flex-row items-center">
          <h1 className="text-xl font-bold pr-4">Game Title</h1>
          <div className="px-4 text-sm text-gray-600 flex flex-row items-center">
            Code:
            <span className="p-1 m-1 text-xs text-gray-600 font-mono bg-gray-100 border border-gray-200 rounded-sm font-semibold">ABCDEF</span>
            <Tooltip title="Copy Join Code">
              {/* TODO: ADD FUNCTIONALITY */}
              <Button type="text" shape="circle" icon={<CopyOutlined />} />
            </Tooltip>
          </div>
        </div>


        <div className="flex flex-row items-center gap-2">
          <Button
            color="default"
            variant="text"
            onClick={() => setChatOpen(!chatOpen)}
          >
            Chat <MessageOutlined />
          </Button>

          <div className="h-6 w-px bg-gray-300 mr-2" />

          <Button danger type="primary" onClick={onLeaveMatch}>Leave Match</Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-72 shrink-0 flex flex-col border border-gray-200 bg-white rounded-md">
          <div className="w-full h-10 rounded-t-md bg-accent items-center flex justify-between px-4">
            <h3 className="text-sm font-semibold">
              Players ({curMatch?.numPlayers}/{curMatch?.maxPlayers})
            </h3>
            <Button
              color="default"
              variant="filled"
              size="small"
            >
              + Add Bot
            </Button>
          </div>
          {playerList.map((p: LobbyPlayer) => {
            return (
              <div className="border-y border-gray-200 h-16 flex flex-row items-center p-3 gap-3">
                <div className="w-8 h-8 bg-blue-300 rounded-sm"></div>
                <div className="flex flex-col justify-between">
                  <div className="flex flex-row gap-1.5 items-center">
                    <span className="text-sm font-bold leading-none">{p.name}</span>
                    <PlayerTag text="Host"/>
                  </div>
                  <span className="text-xs text-gray-600">Blue Team</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative flex flex-col">
          <Outlet />
        </div>

        <aside className={`overflow-hidden whitespace-nowrap shrink-0 flex flex-col border-gray-200 bg-white rounded-md duration-150 ${chatOpen ? "w-80 border" : "w-0 border-0"}`}>
          <div className="w-full h-10 rounded-t-md bg-accent items-center flex justify-between px-4">
            <h3 className="text-sm font-semibold">
              Match Log
              <span className={`inline-block h-2 w-2 mx-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </h3>
            <Button
              color="default"
              variant="text"
              size="small"
              onClick={() => setChatOpen(false)}
            >
              <RightOutlined />
            </Button>
          </div>
        </aside>
      </main>
    </div>
  );
}