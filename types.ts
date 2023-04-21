export type Tile = {
  value?: string;
  options: Set<string>;
};
export type TileMap = {
  [key: number]: {
    [key: number]: Tile;
  };
};
export type Coordinate = {
  x: number;
  y: number;
};
export type Orientation = "horizontal" | "vertical";
