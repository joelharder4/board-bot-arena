import { Button } from "antd";
import { useMatchStore } from "../../../services/useMatchStore";
import { GiRollingDices } from "react-icons/gi";
import type { FrontiersMove } from "@board-bot-arena/shared";
import { useSocket } from "../../../providers/useSocket";
import { useState } from "react";


export const FrontiersActionDock = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const isTurn = useMatchStore((state) => state.playerId === state.gameState?.turnPlayerId);
  const gamePhase = useMatchStore((state) => state.gameState?.phase);

  const { socket } = useSocket();

  const handleRollDice = () => {
    if (!socket) return;
    setLoading(true);

    try {
      const rollPayload: FrontiersMove = {
        kind: "roll"
      };
      socket.emit('make_action', rollPayload);

    } finally {
      setLoading(false);
    }
  }

  const handleEndTurn = () => {
    if (!socket) return;
    setLoading(true);

    try {
      // TODO

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      {gamePhase === "roll" && isTurn ?
        <Button
          color="primary"
          variant="solid"
          block
          size="large"
          onClick={handleRollDice}
          disabled={!isTurn || loading}
        >
          <div className="flex flex-row items-center gap-1.5">
            <GiRollingDices className="text-xl"/>
            Roll Dice
          </div>
        </Button>
      : 
        <Button
          color="primary"
          variant="solid"
          block
          size="large"
          onClick={handleEndTurn}
          disabled={!isTurn || loading}
        >
          End Turn
        </Button>
      }
    </div>
  );
}