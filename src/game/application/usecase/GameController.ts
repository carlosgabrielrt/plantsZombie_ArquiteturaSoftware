// Padrão Singleton: única fonte de verdade do estado e regras do jogo.
// A UI apenas chama métodos deste controller e escuta eventos do EventBus.
import { Plant } from "../../domain/entities/Plant";
import { Zombie } from "../../domain/entities/Zombie";
import { PLANT_SPECS, PlantFactory } from "../../domain/factory/PlantFactory";
import { ZOMBIE_SPECS, ZombieFactory } from "../../domain/factory/ZombieFactory";
import type { RankingRepository } from "../../domain/repository/RankingRepository";
import { LocalStorageRankingRepository } from "../../infrastructure/persistence/LocalStorageRankingRepository";
import { EventBus } from "../../infrastructure/events/EventBus";
import { COLS, ROWS, type PlantType, type ZombieType } from "../../domain/types";

export interface FallingSun {
  id: number;
  x: number; // 0..100 (%)
  spawnedAt: number;
  ttl: number;
}

export interface GameState {
  started: boolean;
  gameOver: boolean;
  player: string;
  sun: number;
  score: number;
  wave: number;
  phase: number;
  phaseZombiesSpawned: number;
  phaseZombiesDefeated: number;
  plants: Plant[];
  zombies: Zombie[];
  fallingSuns: FallingSun[];
  turn: number;
}

let projectileId = 1;
let sunId = 1;

class GameControllerImpl {
  private state: GameState = this.fresh("");
  private ranking: RankingRepository = new LocalStorageRankingRepository();
  private sunTimer: ReturnType<typeof setInterval> | null = null;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private spawnTimers: ReturnType<typeof setTimeout>[] = [];

  setRankingRepository(repo: RankingRepository) {
    this.ranking = repo;
  }
  getRanking(limit = 10) {
    return this.ranking.top(limit);
  }
  getState(): GameState {
    return this.state;
  }
  private fresh(player: string): GameState {
    return {
      started: false,
      gameOver: false,
      player,
      sun: 150,
      score: 0,
      wave: 0,
      phase: 1,
      phaseZombiesSpawned: 0,
      phaseZombiesDefeated: 0,
      plants: [],
      zombies: [],
      fallingSuns: [],
      turn: 0,
    };
  }
  private notify() {
    EventBus.emit("STATE_CHANGED", {});
  }

  start(player: string) {
    this.state = this.fresh(player || "Jogador");
    this.state.started = true;
    this.notify();
    this.startTimers();
  }
  reset() {
    this.stopTimers();
    this.state = this.fresh("");
    this.notify();
  }

  private scheduleNextFallingSun(delay: number) {
    if (this.sunTimer) clearTimeout(this.sunTimer as any);
    this.sunTimer = setTimeout(() => {
      if (this.state.gameOver || !this.state.started) return;
      this.state.fallingSuns.push({
        id: sunId++,
        x: 10 + Math.random() * 80,
        spawnedAt: Date.now(),
        ttl: 8000,
      });
      this.notify();
    }, delay) as any;
  }

  private startTimers() {
    this.stopTimers();
    // Inicia a cadeia de sóis (gera o primeiro após 5 segundos)
    this.scheduleNextFallingSun(5000);
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const before = this.state.fallingSuns.length;
      this.state.fallingSuns = this.state.fallingSuns.filter(
        (s) => now - s.spawnedAt < s.ttl,
      );
      // remover zumbis cuja animação dead terminou
      const beforeZ = this.state.zombies.length;
      this.state.zombies = this.state.zombies.filter(
        (z) => z.alive || (z.deadAt && now - z.deadAt < 1100),
      );
      // resetar shaking das plantas
      this.state.plants.forEach((p) => (p.shaking = false));
      
      if (before > this.state.fallingSuns.length) {
        // Sol expirou sem ser coletado, agenda o próximo para evitar softlock
        this.scheduleNextFallingSun(5000);
      }

      if (
        before !== this.state.fallingSuns.length ||
        beforeZ !== this.state.zombies.length
      ) {
        this.notify();
      }
    }, 250);

    // Timer de zumbis para a Fase 1:
    // 5s  → 2 zumbis juntos (início)
    // 30s → 1 zumbi | 55s → 1 zumbi | 80s → 1 zumbi
    if (this.state.phase === 1) {
      const phaseSnapshot = this.state.phase; // guarda a fase no momento do registro
      const spawnZombie = (count = 1) => {
        if (this.state.gameOver || !this.state.started) return;
        if (this.state.phase !== phaseSnapshot) return; // descarta se a fase mudou
        for (let i = 0; i < count; i++) {
          if (this.state.phaseZombiesSpawned >= 5) break;
          const z = ZombieFactory.create("NORMAL", 2, COLS - 1, 150, 20);
          z.action = "walk";
          this.state.zombies.push(z);
          this.state.phaseZombiesSpawned++;
        }
        this.notify();
      };
      this.spawnTimers.push(setTimeout(() => spawnZombie(2),  5_000)); // 1º e 2º — 5s
      this.spawnTimers.push(setTimeout(() => spawnZombie(1), 30_000)); // 3º — 30s
      this.spawnTimers.push(setTimeout(() => spawnZombie(1), 55_000)); // 4º — 55s
      this.spawnTimers.push(setTimeout(() => spawnZombie(1), 80_000)); // 5º — 80s
    } else if (this.state.phase === 2) {
      const phaseSnapshot = this.state.phase; // guarda a fase no momento do registro
      const pool: ZombieType[] = [
        ...Array(10).fill("NORMAL"),
        ...Array(5).fill("GIRL")
      ].sort(() => Math.random() - 0.5);

      const spawnZombie = (count = 1) => {
        if (this.state.gameOver || !this.state.started) return;
        if (this.state.phase !== phaseSnapshot) return; // descarta se a fase mudou
        for (let i = 0; i < count; i++) {
          if (this.state.phaseZombiesSpawned >= 15 || pool.length === 0) break;
          const row = Math.floor(Math.random() * 3) + 1;
          const type = pool.pop()!;
          let hp = undefined, bite = undefined, speed = undefined;
          if (type === "NORMAL") { hp = 500; bite = 25; }
          else if (type === "GIRL") { hp = 700; bite = 25; speed = 1.0; }
          const z = ZombieFactory.create(type, row, COLS - 1, hp, bite, speed);
          z.action = "walk";
          this.state.zombies.push(z);
          this.state.phaseZombiesSpawned++;
        }
        this.notify();
      };
      this.spawnTimers.push(setTimeout(() => spawnZombie(2),  5_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(3), 20_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(3), 40_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(3), 60_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(4), 80_000));
    } else if (this.state.phase === 3) {
      // Fase 3 – Era Glacial: 25 zumbis
      const phaseSnapshot = this.state.phase; // guarda a fase no momento do registro
      const pool: ZombieType[] = [
        ...Array(12).fill("NORMAL"),
        ...Array(8).fill("GIRL"),
        ...Array(5).fill("CONE")
      ].sort(() => Math.random() - 0.5);

      const spawnZombie = (count = 1) => {
        if (this.state.gameOver || !this.state.started) return;
        if (this.state.phase !== phaseSnapshot) return; // descarta se a fase mudou
        for (let i = 0; i < count; i++) {
          if (this.state.phaseZombiesSpawned >= 25 || pool.length === 0) break;
          const row = Math.floor(Math.random() * ROWS); // linhas 0 a 4
          const type = pool.pop()!;
          let hp = undefined, bite = undefined, speed = undefined;
          if (type === "NORMAL") { hp = 800; bite = 30; }
          else if (type === "GIRL") { hp = 1000; bite = 30; speed = 1.0; }
          else if (type === "CONE") { hp = 1300; bite = 20; }
          const z = ZombieFactory.create(type, row, COLS - 1, hp, bite, speed);
          z.action = "walk";
          this.state.zombies.push(z);
          this.state.phaseZombiesSpawned++;
        }
        this.notify();
      };
      this.spawnTimers.push(setTimeout(() => spawnZombie(3),  5_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(4), 20_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(4), 35_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(5), 50_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(5), 65_000));
      this.spawnTimers.push(setTimeout(() => spawnZombie(4), 80_000));
    }
  }
  private stopTimers() {
    if (this.sunTimer) clearInterval(this.sunTimer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    // Cancela todos os timeouts de spawn pendentes
    this.spawnTimers.forEach((id) => clearTimeout(id));
    this.sunTimer = null;
    this.cleanupTimer = null;
    this.spawnTimers = [];
  }

  collectFallingSun(id: number) {
    const idx = this.state.fallingSuns.findIndex((s) => s.id === id);
    if (idx < 0) return;
    this.state.fallingSuns.splice(idx, 1);
    this.addSun(50);
    // Após coletar, permite a geração do próximo
    this.scheduleNextFallingSun(5000);
    EventBus.emit("SUN_COLLECTED", { amount: 50 });
    this.notify();
  }

  private addSun(n: number) {
    this.state.sun += n;
  }
  private addScore(n: number) {
    const prev = this.state.score;
    this.state.score += n;
    EventBus.emit("SCORE_UPDATED", { prevScore: prev, score: this.state.score });
  }

  canPlant(type: PlantType, row: number, col: number) {
    if (this.state.phase === 1 && row !== 2) return false;
    if (this.state.phase === 2 && (row < 1 || row > 3)) return false;
    // Fase 3: todas as 5 linhas estão ativas, sem restrição de row
    
    const spec = PLANT_SPECS[type];
    if (this.state.sun < spec.cost) return false;
    if (this.state.plants.some((p) => p.alive && p.row === row && p.col === col)) return false;
    return true;
  }

  placePlant(type: PlantType, row: number, col: number): boolean {
    if (!this.canPlant(type, row, col)) return false;
    const spec = PLANT_SPECS[type];
    let hp = undefined, damage = undefined;
    if (this.state.phase === 2) {
      if (type === "PEASHOOTER") { hp = 180; damage = 25; }
      else if (type === "SUNFLOWER") { hp = 160; }
      else if (type === "WALLNUT") { hp = 450; }
    } else if (this.state.phase === 3) {
      if (type === "PEASHOOTER") { hp = 270; damage = 30; }
      else if (type === "SUNFLOWER") { hp = 180; }
      else if (type === "WALLNUT") { hp = 700; }
    }
    const plant = PlantFactory.create(type, row, col, hp, damage);
    this.state.sun -= spec.cost;
    this.state.plants.push(plant);
    EventBus.emit("PLANT_PLACED", { plant, row, col });
    this.notify();
    return true;
  }

  spawnWave() {
    if (this.state.gameOver) return;
    this.state.wave += 1;
    const count = 2 + this.state.wave;
    const pool: ZombieType[] = ["NORMAL", "NORMAL", "CONE"];
    for (let i = 0; i < count; i++) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      let row = Math.floor(Math.random() * ROWS);
      if (this.state.phase === 1) {
        row = 2; // Na Fase 1, zumbis só surgem na linha 2
      }
      const z = ZombieFactory.create(type, row, COLS - 1);
      z.action = "walk";
      this.state.zombies.push(z);
    }
    EventBus.emit("WAVE_SPAWNED", { waveNum: this.state.wave, zombies: count });
    this.notify();
  }

  processTurn() {
    if (this.state.gameOver || !this.state.started) return;
    this.state.turn += 1;

    const attackedCells: string[] = [];
    const damagedCells: string[] = [];

    // 2) plantas agem
    for (const plant of this.state.plants.filter((p) => p.alive)) {
      const rowZombies = this.state.zombies.filter(
        (z) => z.alive && z.row === plant.row,
      );
      plant.strategy.execute({
        plant,
        rowZombies,
        onDamage: (zombie, dmg) => {
          // projétil visual
          if (plant.type === "PEASHOOTER") {
            EventBus.emit("PROJECTILE", {
              fromRow: plant.row,
              fromCol: plant.col,
              toCol: zombie.col,
              id: projectileId++,
            });
          }
          zombie.takeDamage(dmg);
          attackedCells.push(`${zombie.row}-${zombie.col}`);
          damagedCells.push(`${zombie.row}-${zombie.col}`);
          if (!zombie.alive) {
            this.addScore(zombie.points);
            EventBus.emit("ZOMBIE_KILLED", { zombie, pts: zombie.points });
            if (this.state.phase === 1) {
              this.state.phaseZombiesDefeated++;
              if (this.state.phaseZombiesDefeated >= 5) {
                this.endPhase();
              }
            } else if (this.state.phase === 2) {
              this.state.phaseZombiesDefeated++;
              if (this.state.phaseZombiesDefeated >= 15) {
                this.endPhase();
              }
            } else if (this.state.phase === 3) {
              this.state.phaseZombiesDefeated++;
              if (this.state.phaseZombiesDefeated >= 25) {
                this.endPhase();
              }
            }
          }
        },
        onSun: (amount, row, col) => {
          this.addSun(amount);
          EventBus.emit("SUN_GENERATED", { row, col, amount });
        },
      });
    }

    // 3) zumbis avançam (se não há planta na próxima célula)
    for (const z of this.state.zombies.filter((x) => x.alive)) {
      const here = this.state.plants.find(
        (p) => p.alive && p.row === z.row && p.col === Math.floor(z.col),
      );
      if (here) {
        // morde
        z.action = "attack";
        let damage = z.biteDamage;
        if (this.state.phase !== 2 && this.state.phase !== 3) {
          if (z.type === "NORMAL") {
            if (here.type === "PEASHOOTER") damage = 20;
            else if (here.type === "WALLNUT" || here.type === "SUNFLOWER") damage = 20;
          } else {
            // Mantém a regra anterior para outros zumbis caso ataquem a Noz
            if (here.type === "WALLNUT") damage = 20;
          }
        }
        here.takeDamage(damage);
        damagedCells.push(`${here.row}-${here.col}`);
      } else {
        z.col -= z.speed;
        z.action = "walk";
        if (z.col < 0) {
          this.endGame();
        }
      }
    }

    // 4) remove plantas mortas
    this.state.plants = this.state.plants.filter((p) => p.alive);

    EventBus.emit("TURN_PROCESSED", { attackedCells, damagedCells });
    this.notify();
  }

  nextPhase() {
    this.stopTimers();
    this.state.phase += 1;
    this.state.phaseZombiesSpawned = 0;
    this.state.phaseZombiesDefeated = 0;
    this.state.plants = [];
    this.state.zombies = [];
    this.state.fallingSuns = [];
    this.state.gameOver = false;
    this.notify();
    this.startTimers();
  }

  retryPhase(cost: number): boolean {
    if (this.state.sun < cost) return false;
    this.state.sun -= cost;
    this.stopTimers();
    this.state.phaseZombiesSpawned = 0;
    this.state.phaseZombiesDefeated = 0;
    this.state.plants = [];
    this.state.zombies = [];
    this.state.fallingSuns = [];
    this.state.gameOver = false;
    this.notify();
    this.startTimers();
    return true;
  }

  private endPhase() {
    if (this.state.gameOver) return;
    this.state.gameOver = true;
    this.stopTimers();
    EventBus.emit("PHASE_COMPLETED", { score: this.state.score, player: this.state.player });
  }

  private endGame() {
    if (this.state.gameOver) return;
    this.state.gameOver = true;
    this.stopTimers();
    const entry = {
      player: this.state.player,
      score: this.state.score,
      wave: Math.max(0, this.state.wave - 1),
      date: new Date().toISOString(),
    };
    this.ranking.add(entry);
    EventBus.emit("GAME_OVER", {
      score: this.state.score,
      wave: entry.wave,
      player: this.state.player,
    });
  }
}

export const GameController = new GameControllerImpl();
export { PLANT_SPECS, ZOMBIE_SPECS };
