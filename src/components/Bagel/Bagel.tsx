import React from "react";
import type { UseSpringsProps } from "@react-spring/web";
import { useSprings, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { clamp, move } from "../dndHelpers";
import type { SvgProps } from "../IngredientSvgs/types";
import { isSvgComponent } from "./types";
import styles from "./Bagel.module.css";

// This component is a modified version of this: https://codesandbox.io/s/github/pmndrs/use-gesture/tree/main/demo/src/sandboxes/draggable-list
// from use-gesture examples: https://use-gesture.netlify.app/docs/examples/
export type BagelListProps = {
  items: Array<"empty" | React.FC<SvgProps>>;
  bagelOrder: React.MutableRefObject<number[]>;
  width: number;
  elementHeight: number;
  springFn: (props: {
    order: number[];
    saved?: boolean;
    active?: boolean;
    originalIndex?: number;
    curIndex?: number;
    y?: number;
  }) => (index: number) => UseSpringsProps;
};

export const BagelList = ({
  items,
  bagelOrder,
  width,
  elementHeight,
  springFn,
}: BagelListProps) => {
  // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const [springs, api] = useSprings(
    items.length,
    springFn({ order: bagelOrder.current })
  );
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    // start spring for each item in the bagel that moves them towards its center point
    bagelOrder.current.forEach((item, index) => {
      api.start(
        springFn({
          order: bagelOrder.current,
          saved: true,
          active: true,
          originalIndex: item,
          curIndex: index,
        })
      );
    });
  };

  const bind = useDrag(({ args: [originalIndex], active, movement: [, y] }) => {
    if (saved) return;
    const curIndex = bagelOrder.current.indexOf(originalIndex);
    const tempRow = Math.round((curIndex * elementHeight + y) / elementHeight);
    const curRow = clamp(tempRow, 0, items.length - 1);
    const newOrder = move(bagelOrder.current, curIndex, curRow);

    api.start(
      springFn({ order: newOrder, active, originalIndex, curIndex, y })
    ); // Feed springs new style data, they'll animate the view without causing a single render

    if (!active) bagelOrder.current = newOrder;
  });

  return (
    <>
      <div
        className={styles.bagel}
        style={{ height: items.length * elementHeight, width }}
      >
        {springs.map(({ zIndex, y, scale, fill, opacity }, i) => {
          const item = items[i];
          if (!isSvgComponent(item)) {
            return (
              <animated.div
                {...bind(i)}
                key={i}
                style={{
                  opacity,
                  zIndex,
                  y,
                  scale,
                  fill,
                  userSelect: "none",
                  height: elementHeight,
                  width: elementHeight,
                }}
              >
                <span className={styles.empty}>+</span>
              </animated.div>
            );
          } else {
            // is it much less performant to have two animted divs nested here than one?
            // could move all animation to the svg component
            const AnimatedSvgComponent = animated(item);
            return (
              <animated.div
                {...bind(i)}
                key={i}
                style={{
                  zIndex,
                  y,
                  scale,
                  height: elementHeight,
                  width: elementHeight,
                }}
              >
                <AnimatedSvgComponent fill={fill} />
              </animated.div>
            );
          }
        })}
      </div>
      <button className={styles.saveButton} onClick={handleSave}>
        Save Bagel
      </button>
    </>
  );
};
