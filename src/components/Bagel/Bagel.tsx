import type { MutableRefObject } from "react";
import React, { useState } from "react";
import { useSprings, animated } from "@react-spring/web";
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
  order: MutableRefObject<number[]>;
  width: number;
  elementHeight: number;
  saved: boolean;
  springFn: BagelSpringFn;
  joiner?: Joiner;
  isOverBin: boolean;
};

export const BagelList = ({
  items,
  order,
  width,
  elementHeight,
  saved,
  springFn,
  joiner,
  isOverBin,
}: BagelListProps) => {
  const [deletedOriginalIndex, setDeleted] = useState<number>();
  // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const [springs, springApi] = useSprings(
    items.length,
    springFn({
      order: order.current,
      state: deletedOriginalIndex !== undefined ? "deleted" : "render",
      deletedOriginalIndex,
    }),
    [order.current]
  );

  if (saved) {
    // start spring for each item in the bagel that moves them towards its center point
    order.current.forEach((item, index) => {
      springApi.start(
        springFn({
          order: order.current,
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

      const curIndex = order.current.indexOf(originalIndex);
      const tempRow = Math.round(
        (curIndex * elementHeight + y) / elementHeight
      );
      const curRow = clamp(tempRow, 0, items.length - 1);
      const newOrder = move(order.current, curIndex, curRow);

      springApi.start(
        springFn({
          order: newOrder,
          state: "default",
          active,
          originalIndex,
          curIndex,
          x,
          y,
        })
      ); // Feed springs new style data, they'll animate the view without causing a single render

      if (!active) order.current = newOrder;
    },
    onDragEnd: ({ args: [originalIndex], movement: [x, y], ...props }) => {
      const curIndex = order.current.indexOf(originalIndex);
      const elem = document.elementFromPoint(props.xy[0], props.xy[1]);
      console.info("DROPPED ON ELEM: ", elem);

      if (isOverBin) {
        setDeleted(originalIndex);
        const callback = () =>
          joiner?.itemFn({
            itemIndex: originalIndex,
          });
        springApi.start(
          springFn({
            order: order.current,
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
