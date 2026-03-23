export type MapNodeType = "stop" | "hub" | "district_entry";
export type EdgeType = "walk" | "subway" | "tram" | "bus";

export interface MapNode {
  id: string;
  label: string;
  type: MapNodeType;
}

export interface MapEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export interface GameMap {
  id: string;
  label: string;
  nodes: MapNode[];
  edges: MapEdge[];
}

export const viennaCoreMap: GameMap = {
  id: "vienna_core",
  label: "Vienna Core",
  nodes: [
    { id: "karlsplatz", label: "Karlsplatz", type: "hub" },
    { id: "schwedenplatz", label: "Schwedenplatz", type: "hub" },
    { id: "praterstern", label: "Praterstern", type: "hub" },
    { id: "westbahnhof", label: "Westbahnhof", type: "hub" },
    { id: "volkstheater", label: "Volkstheater", type: "stop" },
    { id: "schottentor", label: "Schottentor", type: "stop" }
  ],
  edges: [
    { from: "karlsplatz", to: "volkstheater", type: "tram" },
    { from: "karlsplatz", to: "schwedenplatz", type: "subway" },
    { from: "schwedenplatz", to: "praterstern", type: "subway" },
    { from: "volkstheater", to: "westbahnhof", type: "tram" },
    { from: "volkstheater", to: "schottentor", type: "walk" },
    { from: "schottentor", to: "schwedenplatz", type: "tram" }
  ]
};

const mapRegistry: Record<string, GameMap> = {
  [viennaCoreMap.id]: viennaCoreMap
};

export function getMapById(mapId: string): GameMap | undefined {
  return mapRegistry[mapId];
}

export function listMaps(): GameMap[] {
  return Object.values(mapRegistry);
}
