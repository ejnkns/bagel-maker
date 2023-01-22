import React from "react";
import type { UseSpringsProps } from "@react-spring/web";
import { useSprings, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { clamp, move } from "../dndHelpers";
import styles from "./Bagel.module.css";
import { useSession } from "next-auth/react";
import { api } from "../../utils/api";
import { IngredientType } from "@prisma/client";
import { bagelStringToComponentMap, reorderBagel } from "../BagelMaker/helpers";

// This component is a modified version of this: https://codesandbox.io/s/github/pmndrs/use-gesture/tree/main/demo/src/sandboxes/draggable-list
// from use-gesture examples: https://use-gesture.netlify.app/docs/examples/
export type BagelListProps = {
  items: IngredientType[];
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
  const [springs, springApi] = useSprings(
    items.length,
    springFn({ order: bagelOrder.current })
  );
  const [saved, setSaved] = React.useState(false);

  const { data: sessionData } = useSession();
  const mutation = api.example.putBagel.useMutation();

  const handleSave = () => {
    if (!sessionData || !sessionData.user) return;
    setSaved(true);
    // start spring for each item in the bagel that moves them towards its center point
    bagelOrder.current.forEach((item, index) => {
      springApi.start(
        springFn({
          order: bagelOrder.current,
          saved: true,
          active: true,
          originalIndex: item,
          curIndex: index,
        })
      );
    });

    // save bagel to prisma db for user
    const ingredients = reorderBagel({
      bagel: items,
      order: bagelOrder.current,
    });
    console.log(ingredients);
    mutation.mutate({
      ingredients,
      userId: sessionData.user.id,
    });
  };

  const bind = useDrag(({ args: [originalIndex], active, movement: [, y] }) => {
    if (saved) return;
    const curIndex = bagelOrder.current.indexOf(originalIndex);
    const tempRow = Math.round((curIndex * elementHeight + y) / elementHeight);
    const curRow = clamp(tempRow, 0, items.length - 1);
    const newOrder = move(bagelOrder.current, curIndex, curRow);

    springApi.start(
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
          if (!item || item === IngredientType.EMPTY) {
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
            // console.log(item)
            const ItemComponent = bagelStringToComponentMap[item];
            const AnimatedSvgComponent =
              ItemComponent && animated(ItemComponent);
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
