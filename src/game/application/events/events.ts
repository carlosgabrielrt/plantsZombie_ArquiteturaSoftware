// Tipos de eventos do jogo (Observer/Event-Driven).
import type { Plant } from "../../domain/entities/Plant";
import type { Zombie } from "../../domain/entities/Zombie";

export type GameEventType =
  | "PLANT_PLACED"
  | "ZOMBIE_KILLED"
  | "SCORE_UPDATED"
  | "WAVE_SPAWNED"
  | "SUN_GENERATED"
  | "SUN_COLLECTED"
  | "TURN_PROCESSED"
  | "GAME_OVER"
  | "STATE_CHANGED"
  | "PROJECTILE";

export interface GameEventMap {
  PLANT_PLACED: { plant: Plant; row: number; col: number };
  ZOMBIE_KILLED: { zombie: Zombie; pts: number };
  SCORE_UPDATED: { prevScore: number; score: number };
  WAVE_SPAWNED: { waveNum: number; zombies: number };
  SUN_GENERATED: { row: number; col: number; amount: number };
  SUN_COLLECTED: { amount: number };
  TURN_PROCESSED: { attackedCells: string[]; damagedCells: string[] };
  GAME_OVER: { score: number; wave: number; player: string };
  STATE_CHANGED: Record<string, never>;
  PROJECTILE: { fromRow: number; fromCol: number; toCol: number; id: number };
}
