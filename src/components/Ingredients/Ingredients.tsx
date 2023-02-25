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
      const curIndex = order.indexOf(originalIndex);
      if (deletedOriginalIndex !== undefined) return;
      springApi.start(
        springFn({
          order,
          state: "default",
          active,
          originalIndex,
          curIndex,
          x,
          y,
          deletedOriginalIndex,
        })
      );
    },
    onDragEnd: ({ args: [originalIndex], movement: [x, y] }) => {
      const order = orderRef.current;
      const curIndex = order.indexOf(originalIndex);
      const item = items[originalIndex];
      const newOrder = move(order, curIndex, order.length - 1);

      if (
        item &&
        item !== IngredientType.EMPTY &&
        joiner &&
        (!joiner.conditionFn ||
          joiner.conditionFn({
            itemX: calcOffsetX(curIndex, cols, elementSize, x),
            itemY: calcOffsetY(curIndex, cols, elementSize, y),
          }))
      ) {
        setDeleted(originalIndex);
        const callback = () => {
          joiner?.itemFn({
            item,
            itemIndex: originalIndex,
            // X and Y are relative to the top right of the ingredient grid
            itemX: calcOffsetX(curIndex, cols, elementSize, x),
            itemY: calcOffsetY(curIndex, cols, elementSize, y),
          });

          orderRef.current = newOrder;
        };
        springApi.start(
          springFn({
            order: newOrder,
            state: "deleted",
            originalIndex,
            curIndex,
            deletedOriginalIndex: originalIndex,
            x,
            y,
            callback,
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
          // is it much less performant to have two animated divs nested here than one?
          // could move all animation to the svg component
          const ItemComponent = bagelStringToComponentMap[item];
          const AnimatedSvgComponent = ItemComponent && animated(ItemComponent);
          return (
            <animated.div
              {...bind(i)}
              key={`${orderRef.current[i]}}`}
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
