import type React from "react";
import { useMatchStore } from "../../../services/useMatchStore";
import { HexType } from "@board-bot-arena/shared";

const HEX_SIZE = 50; 
const BOARD_RADIUS = 300;

// 2. Helper: Convert q, r to physical x, y pixels (Pointy-topped hex)
const hexToPixel = (q: number, r: number, size: number) => {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
};

// 3. Helper: Get the 6 corners of the polygon
const getHexCorners = (centerX: number, centerY: number, size: number) => {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    // 30 degree offset (Math.PI / 6) for pointy-topped hexes
    const angle_deg = 60 * i - 30; 
    const angle_rad = Math.PI / 180 * angle_deg;
    corners.push({
      x: centerX + size * Math.cos(angle_rad),
      y: centerY + size * Math.sin(angle_rad)
    });
  }
  return corners;
};

const getHexColour = (resource: HexType | null) => {
  switch (resource) {
    case HexType.FOREST: return '#2E8B57';
    case HexType.QUARRY: return '#B22222';
    case HexType.PASTURE: return '#9ACD32';
    case HexType.FIELD: return '#FFD700';
    case HexType.MOUNTAIN: return '#708090';
    case HexType.DESERT: return '#D2B48C';
    case HexType.WATER: return '#1271ff';
    default: return '#000000';
  }
};

const FrontiersBoard: React.FC = () => {
  const board = useMatchStore((state) => state.gameState?.board);

  return (
    <svg viewBox={`-${BOARD_RADIUS} -${BOARD_RADIUS} ${BOARD_RADIUS * 2} ${BOARD_RADIUS * 2}`} className="w-full h-full">
      <g id="hex-grid">
        {!!board && board.hexes.map((hex, index) => {
          const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
          const corners = getHexCorners(x, y, HEX_SIZE);
          const pointsString = corners.map(c => `${c.x},${c.y}`).join(' ');

          return (
            <g key={`hex-${hex.q}-${hex.r}`} className="hover:opacity-90 transition-opacity">
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
                    className={`text-xs font-bold ${hex.diceValue === 6 || hex.diceValue === 8 ? 'fill-red-600' : 'fill-black'}`}
                  >
                    {hex.diceValue}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default FrontiersBoard;