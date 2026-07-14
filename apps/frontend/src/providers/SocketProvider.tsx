import React, { useRef, useState, useEffect } from "react";
import { SocketContext } from "./useSocket";
import { Socket, io } from "socket.io-client";
import { useMatchStore } from "../services/useMatchStore";
import { getAccessToken, refreshAccessToken } from "../services/api";
import { useNavigate } from "react-router";

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { matchId } = useMatchStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!matchId) {
      navigate('/')
      return;
    }

    const socket = io('http://localhost:3000', {
      auth: (cb: (payload: { token?: string | null }) => void) => {
        cb({ token: getAccessToken() });
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_room', { matchId });
    });

    socket.on('connect_error', async (err) => {
      if (err.message === "jwt expired") {
        console.log("Socket token expired! Attempting background refresh...");
        try {
          await refreshAccessToken();
          socket.connect();
        } catch {
          console.error("Refresh failed. User must log in again.");
          navigate('/');
        }
      } else {
        navigate('/');
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [matchId, navigate]);

  return (
    // eslint-disable-next-line react-hooks/refs
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}