import { GameController } from "@/game/application/usecase/GameController";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RankingModal({ open, onClose }: Props) {
  if (!open) return null;
  const top = GameController.getRanking(10);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-amber-950 to-zinc-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-arcade text-amber-300 text-sm">🏆 TOP 10</div>
          <button onClick={onClose} className="text-amber-200 hover:text-white text-2xl">
            ×
          </button>
        </div>
        {top.length === 0 ? (
          <div className="text-amber-100/70 text-sm italic">Nenhuma partida registrada ainda.</div>
        ) : (
          <div className="space-y-1">
            {top.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-black/40 border border-amber-700/30 rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="font-arcade text-amber-300 text-xs w-6">
                    {i + 1}º
                  </div>
                  <div className="text-amber-100 font-semibold">{r.player}</div>
                </div>
                <div className="flex gap-4 text-xs text-amber-200/80">
                  <span>🌊 {r.wave}</span>
                  <span className="text-amber-300 font-bold">{r.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
