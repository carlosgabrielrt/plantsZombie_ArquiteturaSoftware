// Padrão Singleton + Observer: barramento único de eventos pub/sub do jogo.
import type { GameEventMap, GameEventType } from "../../application/events/events";

type Listener<T extends GameEventType> = (payload: GameEventMap[T]) => void;

class EventBusImpl {
  private listeners = new Map<GameEventType, Set<Listener<GameEventType>>>();
  on<T extends GameEventType>(type: T, fn: Listener<T>): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    const set = this.listeners.get(type)!;
    set.add(fn as Listener<GameEventType>);
    return () => set.delete(fn as Listener<GameEventType>);
  }
  emit<T extends GameEventType>(type: T, payload: GameEventMap[T]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    set.forEach((fn) => {
      try {
        (fn as Listener<T>)(payload);
      } catch (e) {
        console.error("EventBus listener error", e);
      }
    });
  }
}

export const EventBus = new EventBusImpl();
export type { GameEventMap, GameEventType };
