import {
  freshNeighbours,
  fillNeighbours,
  getLowest,
  isPresent,
  insert,
  printMap,
  getRandom,
  canInsert,
  getConstraints,
} from "./map";
import { mulberry32, randomPick } from "./random";
import { TileMap } from "./types";

function wave(map: TileMap, words: Set<string>, seed: number, print = false) {
  let i = 0;
  const max = 1_000;
  const random = mulberry32(seed);
  function printState(label: string, withOptions = false) {
    if (!print) return;
    printMap(map, withOptions);
    console.log(label + " ------------------");
  }
  while (words.size && i++ < max) {
    printState("RESETTING");

    freshNeighbours(map);
    printState("FILLING", true);
    fillNeighbours(map, words);
    printState("SETTING LOWEST", true);

    // const { randomTile, at } = getRandom(map, random);
    // const choice = randomPick(randomTile.options, random);
    const { lowest, at } = getLowest(map, random);
    const choice = randomPick(lowest.options, random);
    // setTile(map, at, createTile(choice));
    words: for (const word of words) {
      console.log("processing word", word, "at", at, "with choice", choice);
      if (!word.includes(choice)) continue;
      let index: number = -1;
      while ((index = word.indexOf(choice, index + 1)) !== -1) {
        console.log({ index });
        const { horizontal, vertical } = getConstraints(map, at);
        if (!horizontal && !vertical) continue;
        const axis = !horizontal ? "vertical" : "horizontal";
        const coord =
          axis === "horizontal"
            ? { x: at.x - index, y: at.y }
            : { x: at.x, y: at.y - index };
        if (canInsert(map, word, coord, axis)) {
          insert(map, word, coord, axis);
          break words;
        }
      }
    }
    printState("REMOVING WORDS");

    [...words].forEach((word) => {
      if (isPresent(map, word)) {
        words.delete(word);
        print && console.log("Removed", word);
      }
    });
  }
  if (i >= max) throw new Error("Max iterations reached");
  console.log({ i, max, words: words.size });
}

function main() {
  let tileMap: TileMap = {};
  const resetMap = () => {
    tileMap = {};
    insert(tileMap, "red", { x: 0, y: 0 }, "horizontal");
  };
  resetMap();
  const getWords = () =>
    new Set([
      "blue",
      "green",
      "yellow",
      "orange",
      "purple",
      "pink",
      "brown",
      "black",
      "white",
      "grey",
      "gray",
      "cyan",
      "magenta",
      "lime",
      "maroon",
      "olive",
      "navy",
      "teal",
      "aqua",
      "fuchsia",
      "silver",
      "gold",
      "coral",
      "indigo",
      "violet",
      "azure",
      "beige",
    ]);

  let seed = 0;
  while (seed < 1_000_000_000) {
    try {
      console.log("SEED", seed);
      wave(tileMap, getWords(), seed++, true);
      break;
    } catch (e) {
      console.log("FAILURE ------------------");
      printMap(tileMap);
      resetMap();
    }
  }
  console.log("SUCCESS ------------------");

  printMap(tileMap);
}
console.time("main");
main();
console.timeEnd("main");
