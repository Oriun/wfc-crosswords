import { TileMap, Coordinate, Tile } from "./types";

export function createTile(val: string | string[]): Tile {
  const t = Array.isArray(val);
  return {
    options: new Set(t ? val : undefined),
    value: t ? undefined : val,
  };
}

export function getTile(map: TileMap, at: Coordinate) {
  return map[at.x]?.[at.y];
}

export function setTile(map: TileMap, at: Coordinate, tile?: Tile) {
  map[at.x] ||= {};
  const existingTile = getTile(map, at);
  map[at.x][at.y] = tile
    ? tile
    : existingTile?.value
    ? existingTile
    : createTile([]);
}

export function resetTile(map: TileMap, at: Coordinate) {
  const tile = getTile(map, at);
  if (tile?.value) return;
  setTile(map, at, createTile([]));
}
