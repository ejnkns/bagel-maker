export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const move = (arr: Array<number>, from: number, to: number) => {
  const copy = [...arr];
  const val = copy[from];

  if (val === undefined || arr[to] === undefined) {
    return copy;
  }
  copy.splice(from, 1);
  copy.splice(to, 0, val);
  return copy;
};
