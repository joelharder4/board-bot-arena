import { type IGameEngine } from './engine-interface.ts';
import { FrontiersEngine } from './frontiers/engine.ts';

const EngineRegistry: Record<string, IGameEngine> = {
  "Frontiers": new FrontiersEngine(),
  // future games here...
};

export const getEngine = (gameName: string): IGameEngine => {
  const engine = EngineRegistry[gameName];
  if (!engine) {
    throw new Error(`Game engine for platform game '${gameName}' is not registered.`);
  }
  return engine;
};