// calculate y pos for index in grid with gravityPoint affecting y pos
export const calcOffsetY = (
  index: number,
  cols: number,
  elementSize: number,
  y?: number
) => {
  if (y === undefined) {
    y = 0;
  }
  return Math.floor(index / cols) * elementSize + y;
};

// calculate x pos for index in grid with gravityPoint affecting x pos by gravityStrength
export const calcOffsetX = (
  index: number,
  cols: number,
  elementSize: number,
  x?: number
) => {
  if (x === undefined) {
    x = 0;
  }
  return (index % cols) * elementSize + x;
};

export const calculateOffsetXYandFill = ({
  x,
  y,
  cols,
  elementSize,
  index,
  gravityPoints,
  targetSize,
}: {
  x: number;
  y: number;
  cols: number;
  elementSize: number;
  index: number;
  gravityPoints: { x: number; y: number }[];
  targetSize: number;
}) => {
  const gravityLimit = targetSize / 2;
  const scale = targetSize / elementSize;

  const offsetY = calcOffsetY(index, cols, elementSize, y);
  const offsetX = calcOffsetX(index, cols, elementSize, x);

  const positionXY = gravityPoints.find(
    (gravityPoint) =>
      Math.abs(gravityPoint.y - offsetY) < gravityLimit &&
      Math.abs(gravityPoint.x - offsetX) < gravityLimit
  );

  return positionXY
    ? { ...positionXY, fill: "green", scale: scale * 1.05 }
    : { x: offsetX, y: offsetY, fill: "white", scale: scale * 1.3 };
};
