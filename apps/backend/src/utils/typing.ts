import type { BotRow, LobbyPlayer, MatchPlayerRow, UserRow } from "@board-bot-arena/shared";


type JoinedPlayerRow = {
  match_player: MatchPlayerRow;
  user: UserRow | null;
  bot: BotRow | null;
};

export const toLobbyPlayer = (joinedRows: JoinedPlayerRow[]): LobbyPlayer[] => {
  return joinedRows.flatMap((row): LobbyPlayer[] => {
    const { match_player: p, user, bot } = row;

    if (p.botId) {
      return [{
        type: "bot",
        botId: p.botId,
        playerId: p.id,
        name: p.name ?? bot?.name ?? `Bot_${p.botId}`,
        colour: p.colour,
        teamId: p.teamIndex,
      }];
    }

    if (p.userId) {
      return [{
        type: "user",
        userId: p.userId,
        playerId: p.id,
        name: p.name ?? user?.name ?? `Player_${p.userId}`,
        colour: p.colour,
        teamId: p.teamIndex,
        isHost: p.isHost,
      }];
    }

    return [];
  });
};