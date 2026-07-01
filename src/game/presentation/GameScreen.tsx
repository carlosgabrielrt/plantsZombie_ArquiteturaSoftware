import { useEffect, useState } from "react";
import { GameController, PLANT_SPECS } from "@/game/application/usecase/GameController";
import { COLS, ROWS, type PlantType } from "@/game/domain/types";
import { useGameState } from "./useGameState";
import { ZombieSprite } from "./ZombieSprite";
import { EventLog } from "./EventLog";
import { ArchitectureModal } from "./ArchitectureModal";
import { RankingModal } from "./RankingModal";
import { EventBus } from "@/game/infrastructure/events/EventBus";
import { PhaseInfoModal } from "./PhaseInfoModal";
import fundoFase1 from "@/assets/fundo-fase-1-cemiterio.png";
import fundoFase2 from "@/assets/fundo-fase-2-egito.png";
import fundoFase3 from "@/assets/fundo-fase-3-glacial.png";

const PLANT_ORDER: PlantType[] = ["PEASHOOTER", "SUNFLOWER", "WALLNUT"];

interface Projectile {
  id: number;
  row: number;
  fromCol: number;
  toCol: number;
}

export function GameScreen() {
  const state = useGameState();
  const [selected, setSelected] = useState<PlantType | null>(null);
  const [archOpen, setArchOpen] = useState(false);
  const [rankOpen, setRankOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [overOpen, setOverOpen] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(true);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [flashes, setFlashes] = useState<Set<string>>(new Set());

  // Loop automático: processa um turno a cada 1 segundo enquanto o jogo estiver ativo
  useEffect(() => {
    const loop = setInterval(() => {
      const s = GameController.getState();
      if (s.started && !s.gameOver) {
        GameController.processTurn();
      }
    }, 1000);
    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    const offs = [
      EventBus.on("PROJECTILE", (e) => {
        const p: Projectile = { id: e.id, row: e.fromRow, fromCol: e.fromCol, toCol: e.toCol };
        setProjectiles((prev) => [...prev, p]);
        setTimeout(() => setProjectiles((prev) => prev.filter((x) => x.id !== p.id)), 360);
      }),
      EventBus.on("TURN_PROCESSED", (e) => {
        setFlashes(new Set(e.damagedCells));
        setTimeout(() => setFlashes(new Set()), 700);
      }),
      EventBus.on("GAME_OVER", () => setOverOpen(true)),
      EventBus.on("PHASE_COMPLETED", () => setVictoryOpen(true)),
    ];
    return () => offs.forEach((o) => o());
  }, []);

  const handleCell = (row: number, col: number) => {
    if (!selected) return;
    const ok = GameController.placePlant(selected, row, col);
    if (ok) setSelected(null);
  };

  return (
    <div
      className="min-h-screen text-emerald-50 p-4"
      style={{
        backgroundImage: `url(${state.phase === 1 ? fundoFase1 : state.phase === 2 ? fundoFase2 : fundoFase3})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'local',
      }}
    >
      {/* HUD */}
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 mb-3">
        {/* Título + botão Log embaixo — lado esquerdo */}
        <div className="flex flex-col gap-1">
          <div className="font-arcade text-emerald-300 text-sm">PLANTS vs ZOMBIES</div>
          <button
            onClick={() => setLogOpen(prev => !prev)}
            className="bg-indigo-700/60 hover:bg-indigo-600 px-2 py-1 rounded-lg text-[12.5px] font-semibold border border-indigo-400/30 w-fit"
          >
            📜 Log
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 bg-black/50 border border-emerald-700/40 rounded-xl px-4 py-2 font-arcade text-[11px]">
          <span className="text-amber-300">☀️ {state.sun}</span>
          <span className="text-emerald-200">🌊 Onda {state.wave}</span>
          <span className="text-yellow-200">⭐ {state.score}</span>
          <span className="text-sky-200">👤 {state.player}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setArchOpen(true)}
            className="bg-emerald-700/60 hover:bg-emerald-600 px-3 py-2 rounded-lg text-[15px] font-semibold border border-emerald-400/30"
          >
            🏗️ Arquitetura
          </button>
          <button
            onClick={() => setInfoOpen(true)}
            className="bg-sky-700/60 hover:bg-sky-600 px-3 py-2 rounded-lg text-[15px] font-semibold border border-sky-400/30"
          >
            ℹ️ Informações
          </button>
          <button
            onClick={() => setRankOpen(true)}
            className="bg-amber-700/60 hover:bg-amber-600 px-3 py-2 rounded-lg text-[15px] font-semibold border border-amber-400/30"
          >
            🏆 Ranking
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-[300px_1fr] gap-4" style={{ marginTop: '-8px' }}>

        {/* Log — lado esquerdo */}
        <div className={`transition-all duration-300 ${logOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <EventLog />
        </div>

        {/* Tabuleiro */}
        <div className="relative">
          <style>{`
            .board-row-a { background: linear-gradient(180deg, rgba(120,200,90,.35), rgba(80,160,60,.35)); }
            .board-row-b { background: linear-gradient(180deg, rgba(100,180,80,.35), rgba(70,140,55,.35)); }
            .inactive-row { background: #2b2b2b; background-image: repeating-linear-gradient(45deg, #3a3a3a, #3a3a3a 2px, #2b2b2b 2px, #2b2b2b 4px); background-size: 8px 8px; }
          `}</style>
          <div
            className="relative rounded-2xl overflow-hidden border-4 border-amber-900/60 shadow-2xl"
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`,
                gridTemplateRows: `repeat(${ROWS}, 88px)`,
              }}
            >
              {Array.from({ length: ROWS * COLS }).map((_, idx) => {
                const row = Math.floor(idx / COLS);
                const col = idx % COLS;
                const key = `${row}-${col}`;
                const plant = state.plants.find(
                  (p) => p.alive && p.row === row && p.col === col,
                );
                const flash = flashes.has(key);
                const isProjRow = projectiles.some((p) => p.row === row);
                const isInactive = (state.phase === 1 && row !== 2) || (state.phase === 2 && (row < 1 || row > 3));
                // Fase 3: todas as 5 linhas estão ativas (isInactive sempre false)
                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (!isInactive) handleCell(row, col);
                    }}
                    className={
                      "relative border border-emerald-900/30 " +
                      (isInactive ? "opacity-30 grayscale cursor-not-allowed inactive-row " : "cursor-pointer ") +
                      (isInactive ? "" : (row % 2 === 0 ? "board-row-a" : "board-row-b")) +
                      (selected && !plant && !isInactive ? " hover:bg-emerald-300/30" : "") +
                      (flash ? " flash-red" : "")
                    }
                  >
                    {plant && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={
                            "text-5xl select-none " +
                            (plant.isAttacking ? "plant-shoot " : "plant-breathe ") +
                            (plant.shaking ? "shake" : "")
                          }
                        >
                          {plant.emoji}
                        </div>
                        <HpBar hp={plant.hp} max={plant.maxHp} />
                      </div>
                    )}
                    {/* projétil */}
                    {isProjRow &&
                      projectiles
                        .filter((p) => p.row === row && p.fromCol === col)
                        .map((p) => {
                          const dist = (p.toCol - p.fromCol) * 100;
                          return (
                            <div
                              key={p.id}
                              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-lime-400 shadow shadow-lime-300 pea-fly"
                              style={
                                {
                                  ["--pea-dist" as never]: `${dist}%`,
                                } as React.CSSProperties
                              }
                            />
                          );
                        })}
                  </div>
                );
              })}
            </div>

            {/* Zumbis em camada absoluta para movimento contínuo */}
            {state.zombies.map((z) => (
              <div
                key={z.id}
                className="absolute transition-all duration-1000 ease-linear pointer-events-none"
                style={{
                  width: `${100 / COLS}%`,
                  height: "88px",
                  top: `${z.row * 88}px`,
                  left: `${(z.col / COLS) * 100}%`,
                }}
              >
                <ZombieSprite action={z.action} />
                {z.type === "CONE" && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-2xl pointer-events-none">
                    🔶
                  </div>
                )}
                <HpBar hp={z.hp} max={z.maxHp} />
              </div>
            ))}
          </div>

          {/* Sóis caindo */}
          <div className="pointer-events-none absolute inset-0">
            {state.fallingSuns.map((s) => (
              <button
                key={s.id}
                onClick={() => GameController.collectFallingSun(s.id)}
                className="pointer-events-auto absolute -top-6 text-4xl falling-sun hover:scale-125 transition-transform"
                style={{ left: `${s.x}%` }}
                aria-label="Coletar sol"
              >
                ☀️
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Progresso da Fase + Cartões de Plantas — em linha */}
      <div className="max-w-[1400px] mx-auto mt-6 bg-black/60 border border-emerald-900/50 rounded-xl px-5 py-3">
        <div className="flex items-center gap-4 flex-wrap justify-between">

          {/* Cartões compactos — lado esquerdo */}
          <div className="flex items-center gap-3 flex-wrap">
            {PLANT_ORDER.map((t) => {
              const s = PLANT_SPECS[t];
              const enough = state.sun >= s.cost;
              const isSel = selected === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelected(isSel ? null : t)}
                  disabled={!enough}
                  className={
                    "flex items-center gap-2 bg-gradient-to-b from-emerald-800/80 to-emerald-950/80 border-2 rounded-lg px-3 py-2 transition-all " +
                    (isSel
                      ? "border-amber-300 glow-card"
                      : enough
                        ? "border-emerald-500/50 hover:border-emerald-300"
                        : "border-zinc-700 opacity-50 cursor-not-allowed grayscale")
                  }
                >
                  <span className="text-2xl leading-none">{s.emoji}</span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-arcade text-[20px] text-emerald-200">{s.name}</span>
                    <span className="font-arcade text-[20px] text-amber-300">☀️ {s.cost}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage + barra de progresso — lado direito */}
          <div className="flex flex-col items-end gap-1 min-w-[220px]">
            <div className="font-arcade text-amber-300 text-[18px]">
              {state.phase === 1 ? 'Fase 1 – Cemitério' : state.phase === 2 ? 'Fase 2 – Egito' : 'Fase 3 – Era Glacial'}
            </div>
            <div className="w-full h-4 bg-black/80 rounded-full border border-emerald-900/50 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-1000"
                style={{ width: `${(state.phaseZombiesDefeated / (state.phase === 1 ? 5 : state.phase === 2 ? 15 : 25)) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-arcade text-[7px] text-white/80 mix-blend-difference">
                ZUMBIS DERROTADOS: {state.phaseZombiesDefeated} / {state.phase === 1 ? 5 : state.phase === 2 ? 15 : 25}
              </div>
            </div>
          </div>

        </div>
      </div>

      <ArchitectureModal open={archOpen} onClose={() => setArchOpen(false)} />
      <PhaseInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <RankingModal open={rankOpen} onClose={() => setRankOpen(false)} />
      <GameOverModal
        open={overOpen}
        onRestart={() => {
          setOverOpen(false);
          GameController.reset();
        }}
      />
      <PhaseCompletedModal
        open={victoryOpen}
        onRestart={() => {
          setVictoryOpen(false);
          if (GameController.getState().phase < 3) {
            GameController.nextPhase();
          } else {
            GameController.reset();
          }
        }}
      />
    </div>
  );
}

function HpBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  const color =
    pct > 60 ? "bg-emerald-400" : pct > 30 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
      <div className={"h-full transition-all " + color} style={{ width: `${pct}%` }} />
    </div>
  );
}

function GameOverModal({ open, onRestart }: { open: boolean; onRestart: () => void }) {
  const state = GameController.getState();
  const top = GameController.getRanking(5);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-red-950 to-zinc-950 border border-red-500/40 rounded-2xl max-w-md w-full p-6 pop-in text-center">
        <div className="font-arcade text-red-400 text-lg mb-2">☠️ GAME OVER</div>
        <div className="text-emerald-100 text-sm mb-4">{state.player}</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="Pontuação" value={`${state.score}`} />
          <Stat label="Ondas" value={`${Math.max(0, state.wave - 1)}`} />
        </div>
        <div className="font-arcade text-amber-300 text-[10px] mb-2">TOP 5</div>
        <div className="space-y-1 mb-4 text-left">
          {top.map((r, i) => (
            <div
              key={i}
              className="flex justify-between text-xs bg-black/40 border border-amber-700/20 rounded px-2 py-1"
            >
              <span className="text-amber-200">
                {i + 1}º {r.player}
              </span>
              <span className="text-amber-300 font-bold">{r.score}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onRestart}
          className="w-full bg-emerald-600 hover:bg-emerald-500 font-arcade text-xs py-3 rounded-xl"
        >
          🔄 JOGAR NOVAMENTE
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/40 border border-emerald-700/30 rounded-lg p-2">
      <div className="text-[10px] text-emerald-200/70 font-arcade">{label}</div>
      <div className="text-2xl font-bold text-emerald-200 mt-1">{value}</div>
    </div>
  );
}

function PhaseCompletedModal({ open, onRestart }: { open: boolean; onRestart: () => void }) {
  const state = GameController.getState();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-emerald-950 to-zinc-950 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 pop-in text-center">
        <div className="font-arcade text-emerald-400 text-lg mb-2">🎉 FASE {state.phase} CONCLUÍDA</div>
        <div className="text-emerald-100 text-sm mb-4">Você defendeu seu quintal!</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="Pontuação" value={`${state.score}`} />
          <Stat label="Sóis" value={`${state.sun}`} />
        </div>
        <button
          onClick={onRestart}
          className="w-full bg-emerald-600 hover:bg-emerald-500 font-arcade text-xs py-3 rounded-xl"
        >
          {state.phase < 3 ? `➡️ IR PARA FASE ${state.phase + 1}` : "🔄 JOGAR NOVAMENTE"}
        </button>
      </div>
    </div>
  );
}
