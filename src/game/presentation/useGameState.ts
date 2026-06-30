// Hook que reage a STATE_CHANGED do EventBus para re-renderizar a UI.
import { useEffect, useReducer } from "react";
import { EventBus } from "@/game/infrastructure/events/EventBus";
import { GameController } from "@/game/application/usecase/GameController";

export function useGameState() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => EventBus.on("STATE_CHANGED", () => force()), []);
  return GameController.getState();
}
