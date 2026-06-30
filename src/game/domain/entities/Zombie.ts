// Entidade de domínio: Zombie. Mantém estado de animação (idle/walk/attack/hurt/dead).
import type { ZombieAction, ZombieType } from "../types";

let _id = 1;

export class Zombie {
  readonly id: number;
  hp: number;
  action: ZombieAction = "idle";
  hurtUntil = 0;
  deadAt: number | null = null;
  constructor(
    public readonly type: ZombieType,
    public readonly name: string,
    public readonly maxHp: number,
    public readonly speed: number,
    public readonly biteDamage: number,
    public readonly points: number,
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
    if (this.hp <= 0) {
      this.action = "dead";
      this.deadAt = Date.now();
    } else {
      this.action = "hurt";
      this.hurtUntil = Date.now() + 280;
    }
  }
}
