import { randomPick } from "./random";
import { setTile, createTile, getTile, resetTile } from "./tile";
import type { TileMap, Coordinate, Tile } from "./types";

export function insert(
  map: TileMap,
  word: string,
  at: Coordinate,
  orientation: "horizontal" | "vertical"
) {
  for (let i = 0; i < word.length; i++) {
    const x = at.x + (orientation === "horizontal" ? i : 0);
    const y = at.y + (orientation === "vertical" ? i : 0);
    setTile(map, { x, y }, createTile(word[i]));
  }
}

export function canInsert(
  map: TileMap,
  word: string,
  at: Coordinate,
  orientation: "horizontal" | "vertical"
) {
  for (let i = -1; i <= word.length; i++) {
    const x = at.x + (orientation === "horizontal" ? i : 0);
    const y = at.y + (orientation === "vertical" ? i : 0);
    const tile = getTile(map, { x, y });
    if (tile?.value && tile.value !== word[i]) return false;
    const { horizontal, vertical } = getConstraints(map, { x, y });
    if (horizontal && vertical) return false;
    if (orientation === "horizontal" && vertical) return false;
    if (orientation === "vertical" && horizontal) return false;
  }
  return true;
}

export function isInserted(
  map: TileMap,
  word: string,
  at: Coordinate,
  orientation: "horizontal" | "vertical"
) {
  for (let i = 0; i < word.length; i++) {
    const x = at.x + (orientation === "horizontal" ? i : 0);
    const y = at.y + (orientation === "vertical" ? i : 0);
    const tile = getTile(map, { x, y });
    if (tile?.value !== word[i]) return false;
  }
  return true;
}

export function printMap(map: TileMap, withOptions = false) {
  const xValues = Object.keys(map).map((x) => parseInt(x));
  const yValues = Object.values(map)
    .flatMap(Object.keys)
    .map((y) => parseInt(y));
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  for (let y = minY; y <= maxY; y++) {
    let line = "";
    for (let x = minX; x <= maxX; x++) {
      const tile = getTile(map, { x, y });
      if (!tile) {
        line += " ";
        continue;
      }
      line += tile.value || (withOptions ? tile.options.size : " ");
    }
    console.log(line);
  }
}

export function freshNeighbours(map: TileMap) {
  for (let _x in map) {
    const x = parseInt(_x);
    for (let _y in map[x]) {
      const y = parseInt(_y);
      const tile = map[x][y];
      if (tile.value) {
        resetTile(map, { x: x - 1, y });
        resetTile(map, { x: x + 1, y });
        resetTile(map, { x, y: y - 1 });
        resetTile(map, { x, y: y + 1 });
      }
    }
  }
}

export function canFill(
  map: TileMap,
  word: string,
  at: Coordinate,
  orientation: "horizontal" | "vertical"
): string | null {
  let pk: keyof Coordinate, fk: keyof Coordinate;
  if (orientation === "horizontal") {
    pk = "x";
    fk = "y";
  } else {
    pk = "y";
    fk = "x";
  }
  let start = at[pk];
  let end = at[pk] - word.length + 1;
  if (!getTile(map, { [pk]: at[pk] - 1, [fk]: at[fk] } as Coordinate)?.value) {
    start++;
    end++;
  }
  for (let i = start - 1; i >= end; i--) {
    if (
      canInsert(map, word, { [pk]: i, [fk]: at[fk] } as Coordinate, orientation)
    ) {
      // console.log(
      //   "Can insert",
      //   word[at[pk] - i],
      //   "from",
      //   word,
      //   "at",
      //   { [pk]: i, [fk]: at[fk] },
      //   start,
      //   i,
      //   at[pk]
      // );
      return word[at[pk] - i];
    }
  }
  return null;
}

export function getConstraints(map: TileMap, { x, y }: Coordinate) {
  const horizontal =
    (!!getTile(map, { x: x - 1, y })?.value &&
      !getTile(map, { x: x - 2, y })?.value) ||
    (!!getTile(map, { x: x + 1, y })?.value &&
      !getTile(map, { x: x + 2, y })?.value);

  const vertical =
    (!!getTile(map, { x, y: y - 1 })?.value &&
      !getTile(map, { x, y: y - 2 })?.value) ||
    (!!getTile(map, { x, y: y + 1 })?.value &&
      !getTile(map, { x, y: y + 2 })?.value);

  return { horizontal, vertical };
}

export function fillNeighbours(map: TileMap, words: Set<string>) {
  for (let _x in map) {
    const x = parseInt(_x);
    for (let _y in map[x]) {
      const y = parseInt(_y);
      const tile = map[x][y];
      if (tile.value) continue;

      const { horizontal, vertical } = getConstraints(map, { x, y });

      if (horizontal && vertical) continue;
      const axis = !vertical ? "horizontal" : "vertical";
      words.forEach((item) => {
        const letter = canFill(map, item, { x, y }, axis);
        if (letter) {
          tile.options.add(letter);
        }
      });
    }
  }
}

export function getRandom(map: TileMap, random: () => number) {
  let randomTile: { randomTile: Tile; at: Coordinate }[] = [];

  for (let _x in map) {
    const x = parseInt(_x);
    for (let _y in map[x]) {
      const y = parseInt(_y);
      const tile = map[x][y];
      if (tile.value || !tile.options.size) continue;
      randomTile.push({ randomTile: tile, at: { x, y } });
    }
  }
  if (!randomTile) throw new Error("No randomTile found");
  return randomPick(randomTile, random);
}

export function getLowest(map: TileMap, random: () => number) {
  let lowest: Tile | null = null,
    at: Coordinate = { x: 0, y: 0 };
  for (let _x in map) {
    const x = parseInt(_x);
    for (let _y in map[x]) {
      const y = parseInt(_y);
      const tile = map[x][y];
      if (tile.value || !tile.options.size) continue;
      if (!lowest) {
        lowest = tile;
        at = { x, y };
      } else if (tile.options.size < lowest.options.size) {
        lowest = tile;
        at = { x, y };
      } else if (tile.options.size === lowest.options.size && random() < 0.5) {
        lowest = tile;
        at = { x, y };
      }
    }
  }
  if (!lowest) throw new Error("No lowest found");
  return { lowest, at };
}

export function isPresent(map: TileMap, word: string) {
  for (let _x in map) {
    const x = parseInt(_x);
    for (let _y in map[x]) {
      const y = parseInt(_y);
      const tile = map[x][y];
      if (tile.value === word[0]) {
        if (isInserted(map, word, { x, y }, "horizontal")) return true;
        if (isInserted(map, word, { x, y }, "vertical")) return true;
      }
    }
  }
  return false;
}

export function getSize(map: TileMap): Coordinate {
  const xValues = Object.keys(map).map((x) => parseInt(x));
  const yValues = Object.values(map)
    .flatMap(Object.keys)
    .map((y) => parseInt(y));
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  return {
    x: maxX - minX - 1,
    y: maxY - minY - 1,
  };
}
