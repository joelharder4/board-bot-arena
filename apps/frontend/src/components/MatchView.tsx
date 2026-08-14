import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function MatchView({ matchId }: { matchId: number }) {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<object>({});

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_match', { matchId });
    });

    socket.on('game_state_update', (newState) => {
      setGameState(newState);
    });

    return () => {
      socket.disconnect();
    };
  }, [matchId]);

  const handleBuildClick = () => {
    if (socketRef.current) {
      socketRef.current.emit('player_action', { action: 'build', target: 'market', matchId });
    }
  };

  return (
    <div>
      <h1>Match #{matchId}</h1>
      <button onClick={handleBuildClick}>Build Market</button>
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
    </div>
  );
}
