import { config } from "@react-spring/web";
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
    // i.e index of originalIndex in order.current when dragging began
    // These indexes will be the same when the items don't auto reorder
    x = 0,
    y = 0,
    callback,
    deletedOriginalIndex,
  }) => {
    return (index: number) => {
      const emptyBagelPoints = getEmptyBagelPoints();
      if (index === originalIndex && (active || state === "deleted")) {
        return {
          zIndex: 1,
          immediate: (key: string) => key === "zIndex",
          config: () =>
            deletedOriginalIndex
              ? { friction: 0, clamp: true }
              : config.default,
          ...calculateOffsetXYandFill({
            x,
            y,
            index: order.indexOf(originalIndex),
            cols,
            elementSize,
            gravityPoints: emptyBagelPoints,
            targetSize,
            useDefaults: callback ? true : undefined,
          }),
          onRest: callback,
        };
      }

      return {
        x: calcOffsetX(order.indexOf(index), cols, elementSize),
        y: calcOffsetY(order.indexOf(index), cols, elementSize),
        scale: 1,
        zIndex: 0,
        fill: "grey",
        immediate: false,
        onRest: callback,
      };
    };
  };

  return <Ingredients {...props} springFn={springFn} />;
};
