// Padrão Factory Method: cria zumbis a partir do tipo.
import { Zombie } from "../entities/Zombie";
import type { ZombieType } from "../types";

export interface ZombieSpec {
  type: ZombieType;
  name: string;
  image: string;
  emoji: string;
  hp: number;
  speed: number;
  bite: number;
  points: number;
}

export const ZOMBIE_SPECS: Record<ZombieType, ZombieSpec> = {
  NORMAL: { type: "NORMAL", name: "Zumbi Comum", image: "/zumbie 1.png", emoji: "🧟", hp: 200, speed: 0.5, bite: 10, points: 100 },
  CONE: { type: "CONE", name: "Cone Zombie", image: "", emoji: "🧟‍♂️", hp: 180, speed: 0.5, bite: 15, points: 200 },
  GIRL: { type: "GIRL", name: "Zumbi Menina Pequena", image: "/zombim menina pequena.png", emoji: "👧🧟", hp: 300, speed: 0.5, bite: 10, points: 150 },
};

export class ZombieFactory {
  static create(type: ZombieType, row: number, col: number, hpOverride?: number, biteOverride?: number, speedOverride?: number): Zombie {
    const s = ZOMBIE_SPECS[type];
    return new Zombie(s.type, s.name, hpOverride ?? s.hp, speedOverride ?? s.speed, biteOverride ?? s.bite, s.points, row, col);
  }
}
