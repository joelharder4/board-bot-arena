import { ALL_CORNERS, HexCorner } from "@board-bot-arena/shared";


const CORNER_ALIASES: Record<HexCorner, Array<{dq: number, dr: number, corner: HexCorner}>> = {
  [HexCorner.N]:  [ { dq: 0, dr: -1, corner: HexCorner.SE }, { dq: 1, dr: -1, corner: HexCorner.SW } ],
  [HexCorner.NE]: [ { dq: 1, dr: -1, corner: HexCorner.S },  { dq: 1, dr: 0,  corner: HexCorner.NW } ],
  [HexCorner.SE]: [ { dq: 1, dr: 0,  corner: HexCorner.SW }, { dq: 0, dr: 1,  corner: HexCorner.N } ],
  [HexCorner.S]:  [ { dq: 0, dr: 1,  corner: HexCorner.NW }, { dq: -1, dr: 1, corner: HexCorner.NE } ],
  [HexCorner.SW]: [ { dq: -1, dr: 1, corner: HexCorner.N },  { dq: -1, dr: 0, corner: HexCorner.SE } ],
  [HexCorner.NW]: [ { dq: -1, dr: 0, corner: HexCorner.NE }, { dq: 0, dr: -1, corner: HexCorner.S } ],
};


const AXIAL_DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

export const getAdjacentHexes = (q: number, r: number, distance: number = 1) => {
  return AXIAL_DIRECTIONS.map(dir => ({
    q: q + (dir.q * distance),
    r: r + (dir.r * distance)
  }));
}


export const getCornerAliases = (q: number, r: number, corner: HexCorner) => {
  const aliases: {q: number, r: number, corner: HexCorner}[] = [{ q, r, corner }];
  
  for (const n of CORNER_ALIASES[corner]) {
    aliases.push({
      q: q + n.dq,
      r: r + n.dr,
      corner: n.corner
    });
  }

  return aliases;
};


export const getHexCornerAliases = (q: number, r: number) => {
  const aliases: {q: number, r: number, corner: HexCorner}[] = [];

  for (const corner of ALL_CORNERS) {
    aliases.push(...getCornerAliases(q, r, corner));
  }

  return aliases;
}