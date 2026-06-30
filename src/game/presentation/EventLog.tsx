import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/infrastructure/events/EventBus";

interface LogItem {
  id: number;
  text: string;
  tone: "good" | "bad" | "info" | "warn";
}

let nextId = 1;

export function EventLog() {
  const [items, setItems] = useState<LogItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const push = (text: string, tone: LogItem["tone"]) =>
      setItems((prev) => [{ id: nextId++, text, tone }, ...prev].slice(0, 50));

    const offs = [
      EventBus.on("PLANT_PLACED", (e) =>
        push(`🌱 Planta plantada: ${e.plant.name} em (L${e.row + 1}, C${e.col + 1})`, "info"),
      ),
      EventBus.on("ZOMBIE_KILLED", (e) =>
        push(`💀 Zumbi eliminado! +${e.pts} pts (${e.zombie.name})`, "good"),
      ),
      EventBus.on("SCORE_UPDATED", (e) => push(`⭐ Pontuação: ${e.score}`, "info")),
      EventBus.on("WAVE_SPAWNED", (e) =>
        push(`🌊 Onda ${e.waveNum} — ${e.zombies} zumbis invadiram!`, "warn"),
      ),
      EventBus.on("SUN_GENERATED", (e) =>
        push(`🌻 Sol gerou +${e.amount} sol`, "good"),
      ),
      EventBus.on("SUN_COLLECTED", (e) => push(`☀️ Sol coletado +${e.amount}`, "good")),
      EventBus.on("TURN_PROCESSED", () => push(`⏩ Turno processado`, "info")),
      EventBus.on("GAME_OVER", (e) =>
        push(`☠️ GAME OVER — ${e.player} • ${e.score} pts`, "bad"),
      ),
    ];
    return () => offs.forEach((o) => o());
  }, []);

  return (
    <div className="bg-black/70 border border-emerald-700/60 rounded-xl p-3 max-h-[300px] overflow-y-auto flex flex-col">
      <div className="font-arcade text-emerald-300 text-[10px] mb-2 tracking-wider">
        LOG DE EVENTOS (Observer)
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto space-y-1 text-xs">
        {items.length === 0 && (
          <div className="text-emerald-200/40 italic">Aguardando eventos…</div>
        )}
        {items.map((i) => (
          <div
            key={i.id}
            className={
              "px-2 py-1 rounded border-l-2 pop-in " +
              (i.tone === "good"
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                : i.tone === "bad"
                  ? "border-red-500 bg-red-500/10 text-red-200"
                  : i.tone === "warn"
                    ? "border-amber-400 bg-amber-500/10 text-amber-100"
                    : "border-sky-400 bg-sky-500/10 text-sky-100")
            }
          >
            {i.text}
          </div>
        ))}
      </div>
    </div>
  );
}
