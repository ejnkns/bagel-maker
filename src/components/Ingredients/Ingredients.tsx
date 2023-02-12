import React, { useEffect, useState } from "react";
import { useSprings, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { calcOffsetX, calcOffsetY } from "./helpers";
import type { IngredientsProps } from "./types";
import styles from "./Ingredients.module.css";
import { bagelStringToComponentMap } from "../BagelMaker/helpers";
import { IngredientType } from "@prisma/client";
import { clamp, move } from "../dndHelpers";

const GRID_COLOR = "white";

export const Ingredients = ({
  items,
  rows,
  cols,
  springFn,
  orderRef,
  elementSize,
  joiner,
}: IngredientsProps) => {
  const [deletedOriginalIndex, setDeleted] = useState<number>();

  // check if there are any EMPTY items not at the end of the order
  // if so, move them to the end
  // useEffect(() => {
  //   const order = orderRef.current;
  //   const emptyIndex = order.indexOf(
  //     items.findIndex((item) => item === IngredientType.EMPTY)
  //   );
  //   console.log({ emptyIndex });
  //   if (emptyIndex !== -1 && emptyIndex !== order.length - 1) {
  //     const newOrder = move(order, emptyIndex, order.length - 1);
  //     orderRef.current = newOrder;
  //   }
  // }, [items, orderRef]);

  const [springs, springApi] = useSprings(
    items.length,
    springFn({
      order: orderRef.current,
      state: deletedOriginalIndex !== undefined ? "deleted" : "render",
      deletedOriginalIndex,
    }),
    [orderRef.current]
  );

  const bind = useGesture({
    onDrag: ({ args: [originalIndex], active, movement: [x, y] }) => {
      const order = orderRef.current;
      if (deletedOriginalIndex !== undefined) return;
      const curIndex = order.indexOf(originalIndex);
      springApi.start(
        springFn({
          order,
          state: "default",
          active,
          originalIndex,
          x,
          y,
          deletedOriginalIndex,
        })
      );
    },
    onDragEnd: ({ args: [originalIndex], movement: [x, y] }) => {
      const order = orderRef.current;
      const curIndex = order.indexOf(originalIndex);

      const item = items[curIndex];

      if (
        item &&
        item !== IngredientType.EMPTY &&
        joiner &&
        (!joiner.conditionFn ||
          joiner.conditionFn({
            item,
            itemIndex: curIndex,
            itemX: calcOffsetX(curIndex, cols, elementSize, x),
            itemY: calcOffsetY(curIndex, cols, elementSize, y),
          }))
      ) {
        setDeleted(originalIndex);
        const callback = () =>
          joiner?.itemFn({
            item,
            itemIndex: originalIndex,
            // X and Y are relative to the top right of the ingredient grid
            itemX: calcOffsetX(curIndex, cols, elementSize, x),
            itemY: calcOffsetY(curIndex, cols, elementSize, y),
          });
        springApi.start(
          springFn({
            order,
            state: "deleted",
            originalIndex,
            x,
            y,
            callback,
            deletedOriginalIndex: originalIndex,
          })
        );
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
        gridTemplateColumns: `repeat(${cols * 2}, 0)`,
        // css trick to draw a grid
        backgroundSize: `${elementSize}px ${elementSize}px`,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${
          elementSize - 1
        }px, ${GRID_COLOR} ${
          elementSize - 1
        }px, ${GRID_COLOR} ${elementSize}px), 
       repeating-linear-gradient(-90deg, transparent, transparent ${
         elementSize - 1
       }px, ${GRID_COLOR} ${
          elementSize - 1
        }px, ${GRID_COLOR} ${elementSize}px)`,
        borderRight: `1px solid ${GRID_COLOR}`,
        borderBottom: `1px solid ${GRID_COLOR}`,
      }}
    >
      {springs.map(({ zIndex, y, x, scale, fill }, i) => {
        const item = items[i];
        if (item && item !== IngredientType.EMPTY) {
          // is it much less performant to have two animted divs nested here than one?
          // could move all animation to the svg component
          const ItemComponent = bagelStringToComponentMap[item];
          const AnimatedSvgComponent = ItemComponent && animated(ItemComponent);
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
                <AnimatedSvgComponent fill={fill} />
              </span>
            </animated.div>
          );
        }
      })}
    </div>
  );
};
