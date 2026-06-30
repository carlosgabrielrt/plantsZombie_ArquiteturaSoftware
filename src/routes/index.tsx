import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/game/presentation/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plants vs Zombies — Arquitetura de Software" },
      {
        name: "description",
        content:
          "Réplica acadêmica de Plants vs Zombies em React + TypeScript demonstrando Factory, Strategy, Singleton, Observer e Repository.",
      },
      { property: "og:title", content: "Plants vs Zombies — Arquitetura de Software" },
      {
        property: "og:description",
        content:
          "Trabalho de ADS: padrões de projeto aplicados em um jogo web em React/TypeScript.",
      },
    ],
  }),
  component: () => <App />,
});
