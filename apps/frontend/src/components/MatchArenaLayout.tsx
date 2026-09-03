import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSocket } from "../providers/useSocket";
import { Button, Input, message, Skeleton, Tooltip } from "antd";
import { CopyOutlined, EyeInvisibleOutlined, EyeOutlined, SendOutlined } from "@ant-design/icons";
import { type MatchDetailsParams, type MatchDetailsResponse, type SendChatPayload, type NewMatchLogPayload, CHAT_MAX_LENGTH, type PlayerJoinedPayload, type PlayerLeftPayload, type MatchStartedPayload, MatchStatus, type PlayerAbandonedPayload, type MatchStateUpdatePayload, type GameEndedPayload } from "@board-bot-arena/shared";
import { useMatchStore } from "../services/useMatchStore";
import { api } from "../services/api";
import { MatchLogContainer } from "./match-log/MatchLogContainer";
import PlayerListContainer from "./game-boards/frontiers/PlayerListContainer";
import { GameActionContainer } from "./GameActionContainer";


export default function MatchArenaLayout() {
  const [unsentMessage, setUnsentMessage] = useState<string>("");

  const matchId = useMatchStore((state) => state.matchId);
  const matchStatus = useMatchStore((state) => state.matchStatus);
  const match = useMatchStore((state) => state.match);
  const setMatch = useMatchStore((state) => state.setMatch);
  const setMatchStatus = useMatchStore((state) => state.setMatchStatus);
  const setPlayerId = useMatchStore((state) => state.setPlayerId);
  const setPlayerList = useMatchStore((state) => state.setPlayerList);
  const appendPlayer = useMatchStore((state) => state.appendPlayer);
  const removePlayer = useMatchStore((state) => state.removePlayer);
  const setHostPlayer = useMatchStore((state) => state.setHostPlayer);
  const setPlayerAbandoned = useMatchStore((state) => state.setPlayerAbandoned);
  const setMatchLog = useMatchStore((state) => state.setMatchLog);
  const appendMatchLog = useMatchStore((state) => state.appendMatchLog);
  const clearMatchStore = useMatchStore((state) => state.clearMatch);
  const setGameState = useMatchStore((state) => state.setGameState);
  
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  const { isConnected, socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!matchId) return;
        const params: MatchDetailsParams = { matchId }
        const res = await api.get<MatchDetailsResponse>(`/matches/${matchId}`, { params: params });
        setPlayerId(res.data.playerId);
        setPlayerList(res.data.players);
        setMatchLog(res.data.log);
        setMatch(res.data.match);
        setMatchStatus(res.data.match.status as MatchStatus);
        if (res.data.state) setGameState(res.data.state);
      } catch {
        message.error('Failed to fetch match details');
        // TODO: retry/leave?
      }
    }
    
    fetchDetails();
  }, [matchId, setPlayerList, setMatchLog, setGameState, setMatchStatus, setMatch, setPlayerId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewLog = (payload: NewMatchLogPayload) => appendMatchLog(payload.log);
    const handlePlayerJoined = (payload: PlayerJoinedPayload) => appendPlayer(payload.player);
    const handlePlayerLeft = (payload: PlayerLeftPayload) => {
      removePlayer(payload.playerId);
      if (payload.newHostId) setHostPlayer(payload.newHostId);
    }
    const handlePlayerAbandoned = (payload: PlayerAbandonedPayload) => {
      setPlayerAbandoned(payload.playerId);
      if (payload.newHostId) setHostPlayer(payload.newHostId);
    }
    const handleMatchStarted = (payload: MatchStartedPayload) => {
      setGameState(payload.state);
      setMatchStatus(MatchStatus.IN_PROGRESS);
      navigate('play', { replace: true });
    }
    const handleStateUpdate = (payload: MatchStateUpdatePayload) => setGameState(payload.state);
    const handleGameEnd = (payload: GameEndedPayload) => {
      console.log(`player ${payload.winner} just won!`);
      setMatchStatus(MatchStatus.COMPLETED);
    }

    socket.on('new_match_log', handleNewLog);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('player_abandoned', handlePlayerAbandoned);
    socket.on('match_started', handleMatchStarted);
    socket.on('match_state_update', handleStateUpdate);
    socket.on('game_ended', handleGameEnd);
    return () => {
      socket.off('new_match_log', handleNewLog);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('player_abandoned', handlePlayerAbandoned);
      socket.off('match_started', handleMatchStarted);
      socket.off('match_state_update', handleStateUpdate);
      socket.off('game_ended', handleGameEnd);
    }
  }, [socket, navigate, appendMatchLog, appendPlayer, removePlayer, setHostPlayer, setGameState, setMatchStatus, setPlayerAbandoned]);

  const onLeaveMatch = async () => {
    try {
      if (match) await api.post('/matches/leave', { matchId: match.matchId });
    } finally {
      clearMatchStore();
      navigate('/');
    }
  };

  const onCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(match?.joinCode ?? "");
      setCopiedCode(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setCopiedCode(false);
      }, 2000);
    } catch (e) {
      message.error("Failed to Copy");
      console.error(e);
    }
  };

  const onSendMessage = () => {
    const trimmed = unsentMessage.trim();
    if (!trimmed || !socket) return;

    const payload: SendChatPayload = { text: trimmed };
    socket.emit('send_chat', payload);
    setUnsentMessage("");
  }

  // clean up if the user leaves the page
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-accent select-none">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
        <div className="divide-x divide-gray-300 flex flex-row items-center">
          <h1 className="text-xl font-bold pr-4">{match?.gameTitle ?? <Skeleton.Node active style={{ width: "10vw", height: "calc(var(--spacing) * 8)" }}/>}</h1>
          {match?.joinCode &&
            <div className="px-4 text-sm text-gray-600 flex flex-row items-center gap-2">
              Code:
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-md overflow-hidden h-8">
                <span className={`px-3 text-xs text-gray-700 font-mono font-semibold text-center w-18 select-all ${!showCode && "tracking-[0.2em]"}`}>
                  {showCode ? match.joinCode : "••••••"}
                </span>

                <div className="flex items-center bg-white border-l border-gray-200 h-full">
                  <Tooltip title={showCode ? "Hide Code" : "Show Code"}>
                    <Button
                      type="text"
                      className="rounded-none border-0 h-full text-gray-400 hover:text-gray-700 px-2"
                      icon={showCode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={() => setShowCode(!showCode)}
                    />
                  </Tooltip>

                  <div className="w-px h-4 bg-gray-200"></div>

                  <Tooltip title={copiedCode ? "Copied!" : "Copy Join Code"}>
                    <Button
                      type="text"
                      className="rounded-none border-0 h-full text-gray-400 hover:text-indigo-600 px-2"
                      icon={<CopyOutlined />}
                      onClick={onCopyJoinCode}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        </div>


        <div className="flex flex-row items-center gap-2">
          <Button danger type="primary" onClick={onLeaveMatch}>Leave Match</Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className={`overflow-hidden whitespace-nowrap shrink-0 flex flex-col border-gray-200 bg-white rounded-md duration-150 w-72 border`}>
          <div className="w-full h-10 rounded-t-md bg-accent items-center flex justify-between px-4 border-b">

            <h3 className="text-sm font-semibold">
              Players ({match?.numPlayers}/{match?.maxPlayers})
            </h3>
            { matchStatus === MatchStatus.PENDING && 
              <Button
                color="default"
                variant="filled"
                size="small"
              >
                + Add Bot
              </Button>
            }
            
          </div>

          <PlayerListContainer />
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative flex flex-col">
          <Outlet />
        </div>

        <aside className="flex flex-col w-80 gap-2 shrink-0">
          <div className="overflow-hidden whitespace-nowrap flex flex-col grow border-gray-200 bg-white rounded-md border">
            <div className="w-full h-10 rounded-t-md bg-accent items-center flex justify-between px-4 border-b">
              <h3 className="text-sm font-semibold">
                Match Log
                <span className={`inline-block h-2 w-2 mx-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </h3>
            </div>

            <MatchLogContainer />
            
            <div className="h-10 w-full flex items-center grow border border-gray-200">
              <Input
                variant="borderless"
                value={unsentMessage}
                onChange={(e) => setUnsentMessage(e.target.value)}
                onPressEnter={onSendMessage}
                maxLength={CHAT_MAX_LENGTH}
                showCount
              />
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="h-full w-10 flex items-center justify-center">
                <Button
                  color="default"
                  variant="text"
                  onClick={onSendMessage}
                >
                  <SendOutlined />
                </Button>
              </div>
            </div>
          </div>
          <GameActionContainer />
        </aside>
      </main>
    </div>
  );
}