// Padrão: tipos compartilhados do domínio do jogo.
export type PlantType = "PEASHOOTER" | "SUNFLOWER" | "WALLNUT";
export type ZombieType = "NORMAL" | "CONE" | "GIRL";
export type ZombieAction = "idle" | "walk" | "attack" | "hurt" | "dead";

export const ROWS = 5;
export const COLS = 9;
