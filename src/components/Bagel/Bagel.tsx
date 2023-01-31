import type { Dispatch, MutableRefObject } from "react";
import React, { useState } from "react";
import { useSprings, animated, useSpringValue } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import { clamp, move } from "../dndHelpers";
import styles from "./Bagel.module.css";
import { IngredientType } from "@prisma/client";
import { bagelStringToComponentMap } from "../BagelMaker/helpers";
import type { Joiner } from "../BagelMaker/types";
import type { BagelSpringFn } from "./BagelHOC";

// This component is a modified version of this: https://codesandbox.io/s/github/pmndrs/use-gesture/tree/main/demo/src/sandboxes/draggable-list
// from use-gesture examples: https://use-gesture.netlify.app/docs/examples/
export type BagelListProps = {
  items: IngredientType[];
  bagelOrder: MutableRefObject<number[]>;
  width: number;
  elementHeight: number;
  saved: boolean;
  setIsOverBin: Dispatch<React.SetStateAction<boolean>>;
  springFn: BagelSpringFn;
  joiner?: Joiner;
};

export const BagelList = ({
  items,
  bagelOrder,
  setIsOverBin,
  width,
  elementHeight,
  saved,
  springFn,
  joiner,
}: BagelListProps) => {
  const [deletedOriginalIndex, setDeleted] = useState<number>();
  // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const [springs, springApi] = useSprings(
    items.length,
    springFn({
      order: bagelOrder.current,
      state: deletedOriginalIndex !== undefined ? "deleted" : "default",
      deletedOriginalIndex,
    }),
    [bagelOrder.current]
  );

  if (saved) {
    // start spring for each item in the bagel that moves them towards its center point
    bagelOrder.current.forEach((item, index) => {
      springApi.start(
        springFn({
          order: bagelOrder.current,
          state: "saved",
          active: true,
          originalIndex: item,
          curIndex: index,
        })
      );
    });
  }

  const bind = useGesture({
    onDrag: ({ args: [originalIndex], active, movement: [x, y] }) => {
      if (saved || deletedOriginalIndex !== undefined) return;
      const curIndex = bagelOrder.current.indexOf(originalIndex);
      const tempRow = Math.round(
        (curIndex * elementHeight + y) / elementHeight
      );
      const curRow = clamp(tempRow, 0, items.length - 1);
      const newOrder = move(bagelOrder.current, curIndex, curRow);

      springApi.start(
        springFn({
          order: newOrder,
          state: deletedOriginalIndex ? "saved" : "default",
          active,
          originalIndex,
          curIndex,
          x,
          y,
        })
      ); // Feed springs new style data, they'll animate the view without causing a single render

      const item = items[originalIndex];
      if (
        item &&
        item !== IngredientType.EMPTY &&
        joiner &&
        (!joiner.conditionFn ||
          joiner.conditionFn({
            item,
            itemIndex: curIndex,
            itemX: x,
            itemY: y + curIndex * elementHeight,
          }))
      ) {
        setIsOverBin(true);
      } else {
        setIsOverBin(false);
      }

      if (!active) bagelOrder.current = newOrder;
    },
    onDragEnd: ({ args: [originalIndex], movement: [x, y] }) => {
      const curIndex = bagelOrder.current.indexOf(originalIndex);
      const item = items[originalIndex];
      if (
        item &&
        item !== IngredientType.EMPTY &&
        joiner &&
        (!joiner.conditionFn ||
          joiner.conditionFn({
            item,
            itemIndex: curIndex,
            itemX: x,
            itemY: y + curIndex * elementHeight,
          }))
      ) {
        setDeleted(originalIndex);
        const callback = () =>
          joiner?.itemFn({
            item,
            itemIndex: originalIndex,
            itemX: x,
            itemY: y + curIndex * elementHeight,
          });
        springApi.start(
          springFn({
            order: bagelOrder.current,
            state: "deleted",
            active: true,
            originalIndex,
            curIndex,
            deletedOriginalIndex: originalIndex,
            x,
            y,
            callback,
          })
        );
      }
      setIsOverBin(false);
    },
  });

  return (
    <>
      <div
        className={styles.bagel}
        style={{ height: items.length * elementHeight, width }}
      >
        {springs.map(({ fill, ...style }, i) => {
          const item = items[i] as IngredientType | undefined;
          // is it much less performant to have two animted divs nested here than one?
          // could move all animation to the svg component
          const ItemComponent = item && bagelStringToComponentMap[item];
          const AnimatedSvgComponent =
            ItemComponent !== IngredientType.EMPTY &&
            ItemComponent &&
            animated(ItemComponent);
          return !item || item === IngredientType.EMPTY ? (
            <animated.div
              {...bind(i)}
              key={i}
              style={{
                ...style,
                fill,
                userSelect: "none",
                height: elementHeight,
                width: elementHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className={styles.empty}>+</span>
            </animated.div>
          ) : (
            <animated.div
              {...bind(i)}
              key={i}
              style={{
                ...style,
                height: elementHeight,
                width: elementHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {AnimatedSvgComponent && <AnimatedSvgComponent fill={fill} />}
            </animated.div>
          );
        })}
      </div>
    </>
  );
};
