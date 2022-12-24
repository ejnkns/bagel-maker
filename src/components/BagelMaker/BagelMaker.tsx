import React, { useCallback, useMemo, useRef, useState } from "react";
import { BagelListHOC } from "../Bagel";
import { IngredientsHOC } from "../Ingredients";
import { BagelSvg } from "../IngredientSvgs/BagelSvg";
import { LettuceSvg } from "../IngredientSvgs/LettuceSvg";
import type { BagelType, IngredientsType } from "./types";

// widths and heights of the BagelList and IngredientsHOC components and elements
const BAGEL_LIST_WIDTH = 100;
const BAGEL_ELEMENT_HEIGHT = 100;
const INGREDIENTS_CELL_SIZE = 100;
const INGREDIENTS_COLS = 3;
const INGREDIENTS_ROWS = 3;
const PADDING = 200;

// component with state for bagel and its ingredients to pass to IngredientsHOC and BagelList
export const BagelMaker = () => {
  console.count('rerender')
  const [defaultBagel, setDefaultBagel] = useState<BagelType>([
    BagelSvg,
    "empty",
    "empty",
    "empty",
    BagelSvg,
  ]);
  const bagelOrder = useRef(defaultBagel.map((_, index) => index)); // Store indicies as a local ref, this represents the item order
  const getEmptyBagelPoints = () => defaultBagel.reduce((acc, item, index) => {
    if (item === "empty" && bagelOrder.current[index] !== undefined) {
      acc.push({y: bagelOrder.current.indexOf(index) * BAGEL_ELEMENT_HEIGHT, x: INGREDIENTS_CELL_SIZE * INGREDIENTS_COLS + PADDING})
    }
    return acc;
  }, [] as Array<{x: number, y: number}>)


  const [defaultIngredients, setDefaultIngredients] = useState<IngredientsType>(new Array(4).fill(LettuceSvg));
  const ingredientsOrder = useRef(defaultIngredients.map((_, index) => index)); // Store indicies as a local ref, this represents the item order

  const dropPadding = 50;
  const minX = INGREDIENTS_CELL_SIZE * INGREDIENTS_COLS + PADDING - dropPadding;
  const maxX = minX + BAGEL_LIST_WIDTH + dropPadding*2;
  const minY = -dropPadding;
  const maxY = defaultBagel.length * BAGEL_ELEMENT_HEIGHT + dropPadding;

  // useCallback to memoize the function so it doesn't get recreated when defaultIngredients changes
  const getBagelIndex = useCallback(
    (itemY: number) => {
      const bagelHeight = defaultBagel.length * BAGEL_ELEMENT_HEIGHT;
      const bagelIndex = Math.round(
        (itemY / bagelHeight) * defaultBagel.length
      );
      return bagelIndex;
    },
    [defaultBagel]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: PADDING,
        paddingTop: PADDING,
      }}
    >
      <IngredientsHOC
        items={defaultIngredients}
        rows={INGREDIENTS_ROWS}
        cols={INGREDIENTS_COLS}
        ingredientsOrder={ingredientsOrder}
        elementSize={INGREDIENTS_CELL_SIZE}
        getEmptyBagelPoints={getEmptyBagelPoints}
        joiner={{
          conditionFn: ({ itemX, itemY }) => {
            // could do things like limit to only 1 bagel top and 1 bagel bottom here
            if (itemX < minX || itemX > maxX || itemY < minY || itemY > maxY) {
              // console.log(`not in bounds: "x: ${{itemX}}, y: ${{itemY}}"`)
              return false;
            }

            const index = getBagelIndex(itemY)
            const bagelIndex = bagelOrder.current[index]
            const bagelItem = bagelIndex && defaultBagel[bagelIndex]

            if (bagelItem !== "empty") {
              console.log(`index ${getBagelIndex(itemY)} is not empty`)
              return false;
            }

            return true;
          },
          itemFn: ({ item, itemY, itemIndex }) => {
            // add it to the defaultBagel state which will cause a render
            // and update the refs
            setDefaultBagel((defaultBagelValue) => {
              // reordering the bagel according to the bagelOrder ref
              const newBagel = [...defaultBagelValue]
              const orderedIndex = bagelOrder.current[getBagelIndex(itemY)]
              if (orderedIndex) newBagel[orderedIndex] = item;

              return newBagel;
            });

            // replace it with "empty" in the defaultIngredients state
            setDefaultIngredients((defaultIngredientsValue) => {
              const newIngredients = [...defaultIngredientsValue];
              newIngredients[itemIndex] = "empty";

              return newIngredients;
            });
          },
        }}
      />
      <BagelListHOC
        width={BAGEL_LIST_WIDTH}
        elementHeight={BAGEL_ELEMENT_HEIGHT}
        items={defaultBagel}
        bagelOrder={bagelOrder}
      />
    </div>
  );
};
