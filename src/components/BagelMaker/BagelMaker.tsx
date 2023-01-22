import React, { useCallback, useEffect, useRef, useState } from "react";
import { BagelListHOC } from "../Bagel";
import { IngredientsHOC } from "../Ingredients";
import useWindowDimensions from "./hooks";
import type { Bagel } from "@prisma/client";
import { IngredientType } from "@prisma/client";

type BagelMakerProps = {
  userBagel?: Bagel;
};

// component with state for, screensize, bagel and its ingredients to pass to IngredientsHOC, BagelListHOC, and SaveBagel
export const BagelMaker = ({ userBagel }: BagelMakerProps) => {
  console.count("rerender");

  // widths and heights of the BagelList and IngredientsHOC components and elements
  const { width, height, loading } = useWindowDimensions();

  const isPortrait = height > width;
  const INGREDIENTS_CELL_SIZE = isPortrait
    ? Math.round(width / 8)
    : Math.round(height / 8);
  const INGREDIENTS_COLS = 1;
  const INGREDIENTS_ROWS = 7;
  const BAGEL_LIST_WIDTH = INGREDIENTS_CELL_SIZE * 1.5;
  const BAGEL_ELEMENT_HEIGHT = BAGEL_LIST_WIDTH;
  const PADDING = isPortrait ? Math.round(width / 4) : Math.round(height / 4);
  const DROP_PADDING = BAGEL_LIST_WIDTH / 2;

  const [defaultBagel, setDefaultBagel] = useState<IngredientType[]>(
    userBagel?.ingredients
      ? userBagel.ingredients
      : new Array(5).fill(IngredientType.EMPTY)
  );

  useEffect(() => {
    if (userBagel?.ingredients) setDefaultBagel(userBagel?.ingredients);
  }, [userBagel]);

  const bagelOrder = useRef(defaultBagel.map((_, index) => index)); // Store indicies as a local ref, this represents the item order
  const elementSizeDiff = BAGEL_ELEMENT_HEIGHT - INGREDIENTS_CELL_SIZE;
  const getEmptyBagelPoints = useCallback(
    () =>
      defaultBagel.reduce((acc, item, index) => {
        if (
          item === IngredientType.EMPTY &&
          bagelOrder.current[index] !== undefined
        ) {
          acc.push({
            y:
              bagelOrder.current.indexOf(index) * BAGEL_ELEMENT_HEIGHT +
              elementSizeDiff / 2,
            x:
              INGREDIENTS_CELL_SIZE * INGREDIENTS_COLS +
              PADDING +
              elementSizeDiff / 2,
          });
        }
        return acc;
      }, [] as Array<{ x: number; y: number }>),
    [
      BAGEL_ELEMENT_HEIGHT,
      INGREDIENTS_CELL_SIZE,
      PADDING,
      defaultBagel,
      elementSizeDiff,
    ]
  );

  const [defaultIngredients, setDefaultIngredients] = useState<
    IngredientType[]
  >(new Array(3).fill(IngredientType.LETTUCE));
  const ingredientsOrder = useRef(defaultIngredients.map((_, index) => index)); // Store indicies as a local ref, this represents the item order

  const middleBagelX =
    INGREDIENTS_CELL_SIZE * INGREDIENTS_COLS + PADDING + elementSizeDiff / 2;
  const minX = middleBagelX - DROP_PADDING;
  const maxX = middleBagelX + DROP_PADDING;
  const minY = -DROP_PADDING;
  const maxY = defaultBagel.length * BAGEL_ELEMENT_HEIGHT + DROP_PADDING;

  // useCallback to memoize the function so it doesn't get recreated when defaultIngredients changes
  const getBagelIndex = useCallback(
    (itemY: number) => {
      const bagelHeight = defaultBagel.length * BAGEL_ELEMENT_HEIGHT;
      const bagelIndex = Math.round(
        (itemY / bagelHeight) * defaultBagel.length
      );
      return bagelIndex;
    },
    [BAGEL_ELEMENT_HEIGHT, defaultBagel.length]
  );

  return (
    <div
      key={`${width}x${height}-${defaultBagel.join("-")}`}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: PADDING,
        paddingTop: PADDING / 4,
      }}
    >
      <IngredientsHOC
        items={defaultIngredients}
        rows={INGREDIENTS_ROWS}
        cols={INGREDIENTS_COLS}
        ingredientsOrder={ingredientsOrder}
        elementSize={INGREDIENTS_CELL_SIZE}
        targetSize={BAGEL_ELEMENT_HEIGHT}
        getEmptyBagelPoints={getEmptyBagelPoints}
        joiner={{
          conditionFn: ({ itemX, itemY }) => {
            // could do things like limit to only 1 bagel top and 1 bagel bottom here
            if (itemX < minX || itemX > maxX || itemY < minY || itemY > maxY) {
              // console.log(`not in bounds: "x: ${{itemX}}, y: ${{itemY}}"`)
              return false;
            }

            const index = getBagelIndex(itemY);
            const bagelIndex = bagelOrder.current[index];
            const bagelItem = bagelIndex && defaultBagel[bagelIndex];

            if (bagelItem !== IngredientType.EMPTY) {
              return false;
            }

            return true;
          },
          itemFn: ({ item, itemY, itemIndex }) => {
            // add it to the defaultBagel state which will cause a render
            // and update the refs
            setDefaultBagel((defaultBagelValue) => {
              // reordering the bagel according to the bagelOrder ref
              const newBagel = [...defaultBagelValue];
              const orderedIndex = bagelOrder.current[getBagelIndex(itemY)];
              if (orderedIndex) newBagel[orderedIndex] = item;

              return newBagel;
            });

            // replace it with "empty" in the defaultIngredients state
            setDefaultIngredients((defaultIngredientsValue) => {
              const newIngredients = [...defaultIngredientsValue];
              newIngredients[itemIndex] = IngredientType.EMPTY;

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
