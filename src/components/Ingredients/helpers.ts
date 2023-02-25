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
  useDefaults,
}: {
  x: number;
  y: number;
  cols: number;
  elementSize: number;
  gravityPoints: { x: number; y: number }[];
  targetSize: number;
  index?: number;
  useDefaults?: boolean;
}) => {
  const gravityLimit = targetSize / 2;
  const offsetY = index ? calcOffsetY(index, cols, elementSize, y) : y;
  const offsetX = index ? calcOffsetX(index, cols, elementSize, x) : x;

  const positionXY = gravityPoints.find(
    (gravityPoint) =>
      Math.abs(gravityPoint.y - offsetY) < gravityLimit &&
      Math.abs(gravityPoint.x - offsetX) < gravityLimit
  );

  const fillToUse = useDefaults ? "white " : positionXY ? "green" : "white";

  const baseScale = targetSize / elementSize;
  const scaleToUse = useDefaults
    ? baseScale
    : positionXY
    ? baseScale * 1.05
    : baseScale * 1.3;

  const XYToUse =
    index === undefined ? undefined : positionXY || { x: offsetX, y: offsetY };

  return { ...XYToUse, fill: fillToUse, scale: scaleToUse };
};
