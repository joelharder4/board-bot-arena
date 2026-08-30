import { useMatchStore } from "../services/useMatchStore";
import { FrontiersActionDock } from "./game-boards/frontiers/FrontiersActionDock";

export const GameActionContainer = () => {
  const gameTitle = useMatchStore((state) => state.match?.gameTitle);

  switch (gameTitle) {
    case "Frontiers":
      return <FrontiersActionDock />;
    default:
      return <></>;
  }
};