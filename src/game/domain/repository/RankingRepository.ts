// Padrão Repository + Inversão de Dependência: interface abstrata para o ranking.
export interface RankingEntry {
  player: string;
  score: number;
  wave: number;
  date: string; // ISO
}

export interface RankingRepository {
  add(entry: RankingEntry): void;
  top(limit?: number): RankingEntry[];
}
