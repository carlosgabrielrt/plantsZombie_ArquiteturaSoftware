// Entidade de domínio: Plant. Comportamento é definido por uma AttackStrategy.
import type { PlantType } from "../types";
import type { AttackStrategy } from "../strategy/AttackStrategy";

let _id = 1;

export class Plant {
  readonly id: number;
  hp: number;
  shaking = false;
  isAttacking = false;
  constructor(
    public readonly type: PlantType,
    public readonly name: string,
    public readonly emoji: string,
    public readonly maxHp: number,
    public readonly cost: number,
    public readonly strategy: AttackStrategy,
    public row: number,
    public col: number,
  ) {
    this.id = _id++;
    this.hp = maxHp;
  }
  get alive() {
    return this.hp > 0;
  }
  takeDamage(d: number) {
    this.hp = Math.max(0, this.hp - d);
    this.shaking = true;
  }
}
