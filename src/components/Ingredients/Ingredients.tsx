import React from "react";
import { useSprings, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { calcOffsetX, calcOffsetY } from "./helpers";
import type { IngredientsProps } from "./types";
import { isSvgComponent } from "../Bagel/types";
import styles from "./Ingredients.module.css";

const GRID_COLOR = 'white';

export const Ingredients = ({
  items,
  rows,
  cols,
  springFn,
  ingredientsOrder: order,
  elementSize,
  joiner,
}: IngredientsProps) => {
  const [springs, api] = useSprings(items.length, springFn(order.current));

  const bind = useGesture({
    onDrag: ({ args: [originalIndex], active, movement: [x, y] }) => {
      const curIndex = order.current.indexOf(originalIndex);
      api.start(springFn(order.current, active, originalIndex, curIndex, x, y)); // Feed springs new style data, they'll animate the view without causing a single render
    },
    onDragEnd: ({ args: [originalIndex], movement: [x, y] }) => {
      const curIndex = order.current.indexOf(originalIndex);
      const item = items[curIndex];
      if (
        isSvgComponent(item) &&
        joiner &&
        (!joiner.conditionFn ||
          joiner.conditionFn({
            item,
            itemIndex: curIndex,
            itemX: calcOffsetX(curIndex, cols, elementSize, x),
            itemY: calcOffsetY(curIndex, cols, elementSize, y),
          }))
      ) {
        // run the joiner item function
        joiner?.itemFn({
          item,
          itemIndex: curIndex,
          // X and Y are relative to the top right of the ingredient grid
          itemX: calcOffsetX(curIndex, cols, elementSize, x),
          itemY: calcOffsetY(curIndex, cols, elementSize, y),
        });
        // api.stop();
      }
    },
  });

  return (
    <div
      className={styles.ingredients}
      style={{
        width: cols * elementSize,
        height: rows * elementSize,
        boxSizing: "border-box",
        margin: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${cols*2}, 0)`,
        // css trick to draw a grid
        backgroundSize: `${elementSize}px ${elementSize}px`,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${
          elementSize - 1
        }px, ${GRID_COLOR} ${elementSize - 1}px, ${GRID_COLOR} ${elementSize}px), 
       repeating-linear-gradient(-90deg, transparent, transparent ${
         elementSize - 1
       }px, ${GRID_COLOR} ${elementSize - 1}px, ${GRID_COLOR} ${elementSize}px)`,
        borderRight: `1px solid ${GRID_COLOR}`,
        borderBottom: `1px solid ${GRID_COLOR}`,
      }}
    >
      {springs.map(({ zIndex, y, x, scale, fill }, i) => {
        const item = items[i];
        if (isSvgComponent(item)) {
          // is it much less performant to have two animted divs nested here than one?
          // could move all animation to the svg component
          const AnimatedComponent = animated(item);
          return (
            <animated.div
              {...bind(i)}
              key={i}
              style={{
                zIndex,
                y,
                x,
                scale,
                width: elementSize,
                height: elementSize,
              }}
            >
                <span
                  style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AnimatedComponent fill={fill} />
                </span>
                </animated.div>
          );
        }
      })}
    </div>
  );
};
