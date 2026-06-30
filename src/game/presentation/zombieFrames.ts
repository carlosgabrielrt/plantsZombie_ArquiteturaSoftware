// Carrega todos os frames do zumbi e os agrupa por ação.
import type { ZombieAction } from "@/game/domain/types";

const modules = import.meta.glob("@/assets/zombie/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

type Action = ZombieAction;

const buckets: Record<Action, string[]> = {
  idle: [],
  walk: [],
  attack: [],
  hurt: [],
  dead: [],
};

const ORDER: Array<{ prefix: string; action: Action }> = [
  { prefix: "Idle", action: "idle" },
  { prefix: "Walk", action: "walk" },
  { prefix: "Attack", action: "attack" },
  { prefix: "Hurt", action: "hurt" },
  { prefix: "Dead", action: "dead" },
];

for (const [path, url] of Object.entries(modules)) {
  const name = path.split("/").pop()!.replace(".png", "");
  for (const { prefix, action } of ORDER) {
    if (name.startsWith(prefix)) {
      const idx = parseInt(name.slice(prefix.length), 10);
      buckets[action].push(`${idx}|${url}`);
      break;
    }
  }
}

for (const a of Object.keys(buckets) as Action[]) {
  buckets[a] = buckets[a]
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((s) => s.split("|")[1]);
}

export const ZOMBIE_FRAMES = buckets;
export const ZOMBIE_FRAME_MS = 130;
