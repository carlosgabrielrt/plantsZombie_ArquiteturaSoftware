// Padrão Factory Method: cria plantas a partir do tipo, sem expor classes concretas de Strategy.
import { Plant } from "../entities/Plant";
import {
  NoAttackStrategy,
  PeaShootStrategy,
  SunGenerationStrategy,
} from "../strategy/AttackStrategy";
import type { PlantType } from "../types";

export interface PlantSpec {
  type: PlantType;
  name: string;
  emoji: string;
  hp: number;
  cost: number;
  description: string;
}

export const PLANT_SPECS: Record<PlantType, PlantSpec> = {
  PEASHOOTER: {
    type: "PEASHOOTER",
    name: "Ervilhadora",
    emoji: "🌿",
    hp: 80,
    cost: 100,
    description: "Atira ervilhas (20 dmg/turno) no zumbi mais próximo da linha.",
  },
  SUNFLOWER: {
    type: "SUNFLOWER",
    name: "Girassol",
    emoji: "🌻",
    hp: 1500,
    cost: 50,
    description: "Gera +25 de sol a cada 7 turnos.",
  },
  WALLNUT: {
    type: "WALLNUT",
    name: "Noz",
    emoji: "🥜",
    hp: 200,
    cost: 50,
    description: "Bloqueia e absorve dano. Não ataca.",
  },
};

export class PlantFactory {
  static create(type: PlantType, row: number, col: number, hpOverride?: number, damageOverride?: number): Plant {
    const spec = PLANT_SPECS[type];
    const strategy =
      type === "PEASHOOTER"
        ? new PeaShootStrategy(damageOverride ?? 20)
        : type === "SUNFLOWER"
          ? new SunGenerationStrategy(25)
          : new NoAttackStrategy();
    return new Plant(spec.type, spec.name, spec.emoji, hpOverride ?? spec.hp, spec.cost, strategy, row, col);
  }
}
