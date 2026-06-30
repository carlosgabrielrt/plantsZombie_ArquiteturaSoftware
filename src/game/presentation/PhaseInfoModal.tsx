import { PLANT_SPECS } from "@/game/domain/factory/PlantFactory";
import { ZOMBIE_SPECS } from "@/game/domain/factory/ZombieFactory";
import { GameController } from "@/game/application/usecase/GameController";

export function PhaseInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const state = GameController.getState();
  const plants = Object.values(PLANT_SPECS);
  const zombies = Object.values(ZOMBIE_SPECS);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-sky-950 to-zinc-950 border border-sky-500/40 rounded-2xl max-w-2xl w-full p-6 pop-in text-center relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sky-200/50 hover:text-sky-200"
        >
          ✖
        </button>
        <div className="font-arcade text-sky-400 text-lg mb-6">ℹ️ INFORMAÇÕES DA FASE {state.phase}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Plants Section */}
          <div>
            <div className="font-arcade text-emerald-400 text-xs mb-3 border-b border-emerald-500/30 pb-2">
              🌱 PLANTAS DEFENSIVAS
            </div>
            <div className="space-y-3">
              {plants.map((p) => (
                <div key={p.type} className="bg-black/40 border border-emerald-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="font-arcade text-[10px] text-emerald-300">{p.name}</span>
                  </div>
                  <div className="text-xs text-emerald-100/80 mb-1">
                    <span className="text-red-300">❤️ HP: {p.hp}</span> | <span className="text-amber-300">☀️ Custo: {p.cost}</span>
                  </div>
                  <div className="text-[10px] text-emerald-200/60 leading-tight">
                    {p.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zombies Section */}
          <div>
            <div className="font-arcade text-red-400 text-xs mb-3 border-b border-red-500/30 pb-2">
              🧟 INIMIGOS (ZUMBIS)
            </div>
            <div className="space-y-3">
              {zombies.map((z) => (
                <div key={z.type} className="bg-black/40 border border-red-900/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{z.emoji}</span>
                    <span className="font-arcade text-[10px] text-red-300">{z.name}</span>
                  </div>
                  <div className="text-xs text-red-100/80 mb-1">
                    <span className="text-red-400">❤️ HP: {z.hp}</span> | <span className="text-orange-400">⚔️ Dano: {z.bite}</span>
                  </div>
                  <div className="text-[10px] text-red-200/60 leading-tight">
                    <span className="text-sky-300">⚡ Vel: {z.speed}</span> | <span className="text-yellow-300">⭐ Pts: {z.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
