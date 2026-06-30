import { useState } from "react";
import { GameController } from "@/game/application/usecase/GameController";
import { useGameState } from "./useGameState";
import { GameScreen } from "./GameScreen";
import { ArchitectureModal } from "./ArchitectureModal";

export function App() {
  const state = useGameState();
  const [name, setName] = useState("");
  const [arch, setArch] = useState(false);

  if (state.started) return <GameScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex flex-col items-center justify-center p-6 text-emerald-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 text-[16rem] flex items-center justify-around">
        <span>🌻</span>
        <span>🧟</span>
      </div>
      <div className="relative z-10 max-w-xl w-full text-center">
        <div className="font-arcade text-3xl sm:text-5xl leading-tight mb-2">
          <span className="text-emerald-300">PLANTS</span>
          <span className="text-emerald-100 mx-2">vs</span>
          <span className="text-red-400">ZOMBIES</span>
        </div>
        <div className="text-emerald-100/70 text-sm mb-8">
          Trabalho de Arquitetura de Software · ADS
        </div>

        <div className="bg-black/50 border border-emerald-500/40 rounded-2xl p-6 backdrop-blur">
          <label className="block text-left font-arcade text-[16px] text-emerald-300 mb-2">
            NOME DO JOGADOR
          </label>
<input
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Digite seu nome"
  className="w-full bg-blue-950/60 border border-blue-600/50 rounded-lg px-4 py-3 text-blue-50 placeholder:text-blue-300/40 outline-none focus:border-blue-300"
  onKeyDown={(e) => {
    if (e.key === "Enter") GameController.start(name);
  }}
/>
          <button
            onClick={() => GameController.start(name)}
            className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-arcade text-sm py-4 rounded-xl shadow-lg border-2 border-emerald-200/60 transition-transform hover:scale-[1.02]"
          >
            ▶ INICIAR JOGO
          </button>
        </div>

        <button
          onClick={() => setArch(true)}
          className="mt-6 inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-emerald-600/40 rounded-full px-4 py-2 text-[11px] text-emerald-200"
        >
          🏗️ Arquitetura em Camadas · Factory · Strategy · Singleton · Observer · Repository
        </button>
      </div>
      <ArchitectureModal open={arch} onClose={() => setArch(false)} />
    </div>
  );
}
