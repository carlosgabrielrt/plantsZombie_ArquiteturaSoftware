// Implementação concreta do RankingRepository usando localStorage.
// A camada de aplicação depende da INTERFACE, não desta classe (DIP).
import type { RankingEntry, RankingRepository } from "../../domain/repository/RankingRepository";

const KEY = "pvz_ranking_v1";

export class LocalStorageRankingRepository implements RankingRepository {
  private read(): RankingEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as RankingEntry[]) : [];
    } catch {
      return [];
    }
  }
  private write(list: RankingEntry[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(list));
  }
  add(entry: RankingEntry): void {
    const list = this.read();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    this.write(list.slice(0, 10));
  }
  top(limit = 10): RankingEntry[] {
    return this.read().slice(0, limit);
  }
}
