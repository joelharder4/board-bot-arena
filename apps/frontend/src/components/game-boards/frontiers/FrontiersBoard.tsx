import type React from "react";
import { useMatchStore } from "../../../services/useMatchStore";
import { ALL_CORNERS, ALL_EDGES, HexCorner, HexEdge, HexType, TEAM_MAP, type FrontiersMove } from "@board-bot-arena/shared";
import RoadAsset from "./RoadAsset";
import SettlementAsset from "./SettlementAsset";
import CityAsset from "./CityAsset";
import { useMemo, useState } from "react";
import { useSocket } from "../../../providers/useSocket";

const HEX_SIZE = 50;
const HEX_SPACING = 2;
const BOARD_RADIUS = 300;

const hexToPixel = (q: number, r: number, size: number, spacing: number = HEX_SPACING) => {
  const x = (size + spacing) * Math.sqrt(3) * (q + r / 2);
  const y = (size + spacing) * (3 / 2) * r;
  return { x, y };
};

const getHexCorners = (centerX: number, centerY: number, size: number) => {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    // 30 degree offset (Math.PI / 6) for pointy-topped hexes
    const angleDeg = 60 * i - 30;
    const angleRad = Math.PI / 180 * angleDeg;
    corners.push({
      x: centerX + size * Math.cos(angleRad),
      y: centerY + size * Math.sin(angleRad)
    });
  }
  return corners;
};

const getRoadTransform = (centerX: number, centerY: number, edge: HexEdge, size: number, spacing: number = HEX_SPACING) => {
  const innerRadius = size * (Math.sqrt(3) / 2);
  const angleDeg = 60 * edge;
  const angleRad = Math.PI / 180 * angleDeg;

  return {
    x: centerX + (spacing + innerRadius) * Math.cos(angleRad),
    y: centerY + (spacing + innerRadius) * Math.sin(angleRad),
    rotation: angleDeg + 90
  };
}

const getCornerTransform = (centerX: number, centerY: number, corner: number, size: number, spacing: number = HEX_SPACING) => {
  const angleDeg = 60 * corner - 30;
  const angleRad = (Math.PI / 180) * angleDeg;
  
  const x = centerX + (spacing + size) * Math.cos(angleRad);
  const y = centerY + (spacing + size) * Math.sin(angleRad);
  
  return { x, y };
};

const getHexColour = (resource: HexType | null) => {
  switch (resource) {
    case HexType.FOREST: return '#2E8B57';
    case HexType.QUARRY: return '#B22222';
    case HexType.PASTURE: return '#9ACD32';
    case HexType.FIELD: return '#FFD700';
    case HexType.MOUNTAIN: return '#708090';
    case HexType.DESERT: return '#D2B48C';
    case HexType.WATER: return '#5ca1fa';
    default: return '#000000';
  }
};

const FrontiersBoard: React.FC = () => {
  const [isBuildingCorner, setIsBuildingCorner] = useState<boolean>(false);
  const [isBuildingEdge, setIsBuildingEdge] = useState<boolean>(false);

  const matchId = useMatchStore((state) => state.match?.matchId);
  const playerList = useMatchStore((state) => state.playerList);
  const board = useMatchStore((state) => state.gameState?.board);
  const phase = useMatchStore((state) => state.gameState?.phase);
  const isTurn = useMatchStore((state) => state.playerId === state.gameState?.turnPlayerId);

  const isMovingRobber = isTurn && phase === "robber";

  const { socket } = useSocket();


  const uniqueCornerHitboxes = useMemo(() => {
    if (!board) return [];

    const cornersMap = new Map<string, { q: number, r: number, x: number, y: number, corner: HexCorner }>();

    board.hexes.forEach((hex) => {
      const hexCenter = hexToPixel(hex.q, hex.r, HEX_SIZE);

      ALL_CORNERS.forEach((corner) => {
        const transform = getCornerTransform(hexCenter.x, hexCenter.y, corner, HEX_SIZE);
        const key = `${transform.x.toFixed(1)}${transform.y.toFixed(1)}`;

        if (!cornersMap.has(key)) {
          cornersMap.set(key, {
            q: hex.q,
            r: hex.r,
            x: transform.x,
            y: transform.y,
            corner
          });
        }
      });
    });

    return Array.from(cornersMap.values());
  }, [board]);

  const uniqueEdgeHitboxes = useMemo(() => {
    if (!board) return [];

    const edgeMap = new Map<string, { q: number, r: number, x: number, y: number, edge: HexEdge }>();

    board.hexes.forEach((hex) => {
      const hexCenter = hexToPixel(hex.q, hex.r, HEX_SIZE);

      ALL_EDGES.forEach((edge) => {
        const transform = getRoadTransform(hexCenter.x, hexCenter.y, edge, HEX_SIZE);
        const key = `${transform.x.toFixed(1)}${transform.y.toFixed(1)}`;

        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            q: hex.q,
            r: hex.r,
            x: transform.x,
            y: transform.y,
            edge
          });
        }
      });
    });

    return Array.from(edgeMap.values());
  }, [board]);


  const handleHexClick = (q: number, r: number, type: HexType) => {
    if (!isMovingRobber || !socket) return;
    if (board?.robber.q === q && board.robber.r === r) return;
    if (type === HexType.WATER) return; // TODO: Allow the pirate but not robber
    
    const robberPayload: FrontiersMove = {
      actionId: "move_robber",
      data: { q, r },
    };
    socket.emit("make_action", { matchId, action: robberPayload });
  }

  const handleCornerClick = (q: number, r: number, corner: HexCorner) => {
    console.log("corner", q, r, corner);
  }

  const handleEdgeClick = (q: number, r: number, edge: HexEdge) => {
    console.log("edge", q, r, edge);
  }


  return (
    <svg viewBox={`-${BOARD_RADIUS} -${BOARD_RADIUS} ${BOARD_RADIUS * 2} ${BOARD_RADIUS * 2}`} className="w-full h-full">
      <g id="hex-grid">
        {!!board && board.hexes.map((hex) => {
          const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
          const corners = getHexCorners(x, y, HEX_SIZE);
          const pointsString = corners.map(c => `${c.x},${c.y}`).join(' ');

          return (
            <g key={`hex-${hex.q}-${hex.r}`} className={`transition-opacity ${isMovingRobber && "hover:opacity-90 cursor-pointer"}`} onClick={() => handleHexClick(hex.q, hex.r, hex.type)}>
              <polygon
                points={pointsString}
                fill={getHexColour(hex.type)}
                stroke="#222"
                strokeWidth="2"
              />
              
              {hex.diceValue && (
                <g>
                  <circle cx={x} cy={y} r={14} fill="#FFE4B5" stroke="#333" strokeWidth="1"/>
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-xs font-bold select-none ${hex.diceValue === 6 || hex.diceValue === 8 ? 'fill-red-600' : 'fill-black'}`}
                  >
                    {hex.diceValue}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {!!board && board.roads.map((road) => {
          const { x, y } = hexToPixel(road.q, road.r, HEX_SIZE);
          const transform = getRoadTransform(x, y, road.edge, HEX_SIZE);

          const roadWidth = HEX_SIZE * 0.9;
          const roadHeight = HEX_SIZE * 0.15;

          const teamId = playerList[road.playerId]?.teamId ?? 1;

          return (
            <g
              key={`road-${road.q}-${road.r}-${road.edge}`}
              transform={`translate(${transform.x}, ${transform.y}) rotate(${transform.rotation})`}
            >
              <RoadAsset
                width={roadWidth}
                height={roadHeight}
                x={-roadWidth / 2}
                y={-roadHeight / 2}
                preserveAspectRatio="none"
                className={`${TEAM_MAP[teamId].strokeClass} ${TEAM_MAP[teamId].fillClass}`}
              />
            </g>
          );
        })}

        {!!board && board.buildings.map((build) => {
          const { x, y } = hexToPixel(build.q, build.r, HEX_SIZE);
          const transform = getCornerTransform(x, y, build.corner, HEX_SIZE);

          const settlementWidth = HEX_SIZE * 0.4;
          const settlementHeight = HEX_SIZE * 0.5;
          const cityWidth = HEX_SIZE * 0.6;
          const cityHeight = HEX_SIZE * 0.6;

          const teamId = playerList[build.playerId]?.teamId ?? 1;

          return (
            <g
              key={`building-${build.q}-${build.r}-${build.corner}`}
              transform={`translate(${transform.x}, ${transform.y})`}
            >
              {build.type === "settlement" && 
                <SettlementAsset
                  width={settlementWidth}
                  height={settlementHeight}
                  x={-settlementWidth / 2}
                  y={-settlementHeight * 0.6}
                  preserveAspectRatio="none"
                  className={`${TEAM_MAP[teamId].strokeClass} ${TEAM_MAP[teamId].fillClass}`}
                />
              }
              {build.type === "city" &&
                <CityAsset
                  width={cityWidth}
                  height={cityHeight}
                  x={-cityWidth / 2}
                  y={-cityHeight * 0.65}
                  preserveAspectRatio="none"
                  className={`${TEAM_MAP[teamId].strokeClass} ${TEAM_MAP[teamId].fillClass}`}
                />
              }
            </g>
          );
        })}
      </g>

      <g id="interaction-layer">
        {isBuildingCorner &&
          uniqueCornerHitboxes.map((hitbox) => (
            <circle
              key={`hitbox-${hitbox.q}-${hitbox.r}-${hitbox.corner}`}
              cx={hitbox.x}
              cy={hitbox.y}
              r={12}
              className="fill-white opacity-0 hover:opacity-20 cursor-pointer transition-opacity"
              onClick={() => handleCornerClick(hitbox.q, hitbox.r, hitbox.corner)}
            />
          ))
        }
        {isBuildingEdge &&
          uniqueEdgeHitboxes.map((hitbox) => (
            <circle
              key={`hitbox-${hitbox.q}-${hitbox.r}-${hitbox.edge}`}
              cx={hitbox.x}
              cy={hitbox.y}
              r={8}
              className="fill-white opacity-0 hover:opacity-20 cursor-pointer transition-opacity"
              onClick={() => handleEdgeClick(hitbox.q, hitbox.r, hitbox.edge)}
            />
          ))
        }
      </g>
    </svg>
  );
}

export default FrontiersBoard;