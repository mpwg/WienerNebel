import type { GameMap } from "@wiener-nebel/map-data";

export function normalizeMapGraph(map: GameMap): GameMap {
  const uniqueEdges = new Map<string, GameMap["edges"][number]>();

  for (const edge of map.edges) {
    uniqueEdges.set(`${edge.from}:${edge.to}:${edge.type}`, edge);
  }

  return {
    ...map,
    nodes: [...map.nodes].sort((left, right) => left.id.localeCompare(right.id)),
    edges: [...uniqueEdges.values()]
  };
}
