export function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomPick<T>(set: Iterable<T>, random: () => number) {
  const index = Math.floor(
    random() * ((set as Array<T>).length || (set as Set<T>).size)
  );
  const pick = [...set][index];
  if (pick) return pick;
  throw new Error("Should not happen");
}
