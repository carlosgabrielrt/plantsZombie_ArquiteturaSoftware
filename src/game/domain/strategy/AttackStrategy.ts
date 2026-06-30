// Padrão Strategy: define o comportamento/efeito de cada planta de forma intercambiável.
import type { Plant } from "../entities/Plant";
import type { Zombie } from "../entities/Zombie";

export interface StrategyContext {
  plant: Plant;
  rowZombies: Zombie[]; // zumbis vivos na mesma linha
  onDamage: (zombie: Zombie, dmg: number) => void;
  onSun: (amount: number, row: number, col: number) => void;
}

export interface AttackStrategy {
  readonly name: string;
  execute(ctx: StrategyContext): void;
}

export class PeaShootStrategy implements AttackStrategy {
  readonly name = "PeaShoot";
  constructor(private damage = 20) {}
  execute({ plant, rowZombies, onDamage }: StrategyContext): void {
    // ataca o zumbi vivo mais próximo (estritamente à frente: > coluna da planta)
    const targets = rowZombies
      .filter((z) => z.alive && z.col > plant.col)
      .sort((a, b) => a.col - b.col);
    const target = targets[0];
    if (target) {
      plant.isAttacking = true;
      onDamage(target, this.damage);
    } else {
      plant.isAttacking = false;
    }
  }
}

export class SunGenerationStrategy implements AttackStrategy {
  readonly name = "SunGen";
  private ticks = 0;
  constructor(private amount = 25) {}
  execute({ plant, onSun }: StrategyContext): void {
    this.ticks++;
    if (this.ticks >= 7) {
      onSun(this.amount, plant.row, plant.col);
      this.ticks = 0;
    }
  }
}

export class NoAttackStrategy implements AttackStrategy {
  readonly name = "NoAttack";
  execute(): void {
    /* wall-nut apenas bloqueia */
  }
}
