import { useEffect, useState } from "react";
import { ZOMBIE_FRAMES, ZOMBIE_FRAME_MS } from "./zombieFrames";
import type { ZombieAction } from "@/game/domain/types";

interface Props {
  action: ZombieAction;
  flip?: boolean;
}

export function ZombieSprite({ action }: Props) {
  const frames = ZOMBIE_FRAMES[action]?.length ? ZOMBIE_FRAMES[action] : ZOMBIE_FRAMES.idle;
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
    if (action === "dead") {
      // toca uma vez
      let idx = 0;
      const id = setInterval(() => {
        idx++;
        if (idx >= frames.length) {
          clearInterval(id);
          setI(frames.length - 1);
        } else {
          setI(idx);
        }
      }, ZOMBIE_FRAME_MS);
      return () => clearInterval(id);
    }
    const id = setInterval(() => setI((p) => (p + 1) % frames.length), ZOMBIE_FRAME_MS);
    return () => clearInterval(id);
  }, [action, frames.length]);

  const src = frames[Math.min(i, frames.length - 1)];
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
      <img
        src={src}
        alt="zombie"
        style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", transform: "scaleX(-1)" }}
        draggable={false}
      />
    </div>
  );
}
