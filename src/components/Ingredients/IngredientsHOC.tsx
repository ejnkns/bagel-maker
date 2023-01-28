import { config } from "@react-spring/web";
import { Ingredients } from "./Ingredients";
import { calcOffsetX, calcOffsetY, calculateOffsetXYandFill } from "./helpers";
import type { IngredientsProps } from "./types";

export const IngredientsHOC = (
  props: Omit<IngredientsProps, "springFn"> & {
    getEmptyBagelPoints: () => Array<{ x: number; y: number }>;
    targetSize: number;
  }
) => {
  const { cols, elementSize, getEmptyBagelPoints, targetSize } = props;
  const springFn =
    (
      order: number[],
      active = false,
      // the original index input to the component
      originalIndex = 0,
      // the from index of the element being dragged
      // i.e index of originalIndex in order.current when dragging began
      curIndex = 0,
      x = 0,
      y = 0
    ) =>
    // the original index of the element being calculated
    (index: number) => {
      return active && index === originalIndex
        ? {
            zIndex: 1,
            immediate: (key: string) => key === "zIndex",
            config: (key: string) =>
              key === "y" ? config.stiff : config.default,
            ...calculateOffsetXYandFill({
              x,
              y,
              index: curIndex,
              cols,
              elementSize,
              gravityPoints: getEmptyBagelPoints(),
              targetSize,
            }),
          }
        : {
            x: calcOffsetX(order.indexOf(index), cols, elementSize),
            y: calcOffsetY(order.indexOf(index), cols, elementSize),
            scale: 1,
            zIndex: 0,
            fill: "grey",
            immediate: false,
          };
    };

  return <Ingredients {...props} springFn={springFn} />;
};
