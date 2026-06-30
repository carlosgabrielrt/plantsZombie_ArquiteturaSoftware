interface Props {
  open: boolean;
  onClose: () => void;
}

const PATTERNS = [
  {
    icon: "🏭",
    name: "Factory Method",
    where: "PlantFactory / ZombieFactory",
    desc: "Cria entidades (Plant, Zombie) a partir de um tipo. O cliente não conhece as classes concretas das estratégias.",
  },
  {
    icon: "🧠",
    name: "Strategy",
    where: "PeaShootStrategy, SunGenerationStrategy, NoAttackStrategy",
    desc: "Cada planta recebe uma estratégia intercambiável que define seu comportamento de ataque/efeito.",
  },
  {
    icon: "👑",
    name: "Singleton",
    where: "GameController, EventBus",
    desc: "Única fonte de verdade do estado e do barramento de eventos do jogo.",
  },
  {
    icon: "📡",
    name: "Observer / Event-Driven",
    where: "EventBus + GameEventMap",
    desc: "Toda ação relevante publica um evento. A UI reage sem acoplamento direto ao domínio.",
  },
  {
    icon: "🗄️",
    name: "Repository (DIP)",
    where: "RankingRepository ← LocalStorageRankingRepository",
    desc: "Camadas superiores dependem da interface abstrata. A persistência (localStorage) pode ser trocada sem impacto.",
  },
];

export function ArchitectureModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-emerald-950 to-zinc-900 border border-emerald-500/40 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-arcade text-emerald-300 text-sm">🏗️ ARQUITETURA</div>
            <div className="text-emerald-100/70 text-sm mt-1">
              Padrões de projeto implementados no jogo
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PATTERNS.map((p) => (
            <div
              key={p.name}
              className="bg-black/40 border border-emerald-700/40 rounded-xl p-4"
            >
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="font-arcade text-emerald-300 text-[11px] mb-1">{p.name}</div>
              <div className="text-amber-300/90 text-xs font-mono mb-2">{p.where}</div>
              <div className="text-emerald-100/80 text-xs leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-[11px] text-emerald-200/60 leading-relaxed">
          Camadas: <span className="text-emerald-300">domain</span> (entidades, strategies,
          factories, repositórios) →{" "}
          <span className="text-emerald-300">application</span> (GameController, events) →{" "}
          <span className="text-emerald-300">infrastructure</span> (EventBus,
          LocalStorageRankingRepository) →{" "}
          <span className="text-emerald-300">presentation</span> (componentes React).
        </div>
      </div>
    </div>
  );
}
