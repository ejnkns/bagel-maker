import { Ingredients } from "./Ingredients";
import { calcOffsetX, calcOffsetY, calculateOffsetXYandFill } from "./helpers";
import type { IngredientsProps, IngredientsSpringFn } from "./types";

export const IngredientsHOC = (
  props: Omit<IngredientsProps, "springFn"> & {
    getEmptyBagelPoints: () => Array<{ x: number; y: number }>;
    targetSize: number;
  }
) => {
  const { cols, elementSize, getEmptyBagelPoints, targetSize } = props;
  const springFn: IngredientsSpringFn = ({
    order,
    state = "default",
    active = false,
    // the original index input to the component
    originalIndex,
    curIndex,
    // i.e index of originalIndex in order.current when dragging began
    // These indexes will be the same when the items don't auto reorder
    x = 0,
    y = 0,
    callback,
    deletedOriginalIndex,
  }) => {
    const config = deletedOriginalIndex
      ? { friction: 0, clamp: true }
      : undefined;
    return (index: number) => {
      const emptyBagelPoints = getEmptyBagelPoints();
      if (state === "deleted" && index === deletedOriginalIndex) {
        return {
          zIndex: 1,
          immediate: (key: string) => key === "zIndex",
          config,
          ...calculateOffsetXYandFill({
            x,
            y,
            index: curIndex,
            cols,
            elementSize,
            gravityPoints: emptyBagelPoints,
            targetSize,
            useDefaults: !!callback,
          }),
          onRest: callback,
        };
      }
      if (active && index === originalIndex) {
        // order.indexOf(index) === curIndex
        return {
          zIndex: 1,
          immediate: (key: string) => key === "zIndex",
          config,
          ...calculateOffsetXYandFill({
            x,
            y,
            index: curIndex,
            cols,
            elementSize,
            gravityPoints: emptyBagelPoints,
            targetSize,
            useDefaults: !!callback,
          }),
          onRest: callback,
        };
      }

      return {
        config,
        x: calcOffsetX(order.indexOf(index), cols, elementSize),
        y: calcOffsetY(order.indexOf(index), cols, elementSize),
        scale: 1,
        zIndex: 0,
        fill: "grey",
        immediate: false,
      };
    };
  };

  return <Ingredients {...props} springFn={springFn} />;
};
