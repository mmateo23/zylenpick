export type MapArtResponse = {
  location: string;
  query: string;
  center: {
    lat: number;
    lon: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  contentBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  roadCount: number;
  pathCount: number;
  paths: Array<{
    d: string;
    kind: "primary" | "secondary" | "local";
  }>;
};
