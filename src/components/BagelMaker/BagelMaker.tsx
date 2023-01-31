import type { FormEvent } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BagelListHOC } from "../Bagel";
import { IngredientsHOC } from "../Ingredients";
import useWindowDimensions from "./hooks";
import type { Bagel } from "@prisma/client";
import { IngredientType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "../../utils/api";
import { getBinLimits, reorderBagel } from "./helpers";
import { Form } from "./SaveBagelForm";
import { Bin } from "./Bin";
import styles from "./BagelMaker.module.css";

type BagelMakerProps = {
  userBagel?: Bagel;
};

// component with state for, screensize, bagel and its ingredients to pass to IngredientsHOC, BagelListHOC, and SaveBagel
export const BagelMaker = ({ userBagel }: BagelMakerProps) => {
  console.count("rerender");

  // widths and heights of the BagelList and IngredientsHOC components and elements
  const { width, height } = useWindowDimensions();

  const isPortrait = height > width;
  const INGREDIENTS_CELL_SIZE = isPortrait
    ? Math.round(width / 12)
    : Math.round(height / 12);
  const INGREDIENTS_COLS = 2;
  const INGREDIENTS_ROWS = 7;
  const BAGEL_LIST_WIDTH = INGREDIENTS_CELL_SIZE * 1.5;
  const BAGEL_ELEMENT_HEIGHT = BAGEL_LIST_WIDTH;
  const PADDING = isPortrait ? Math.round(width / 8) : Math.round(height / 8);
  const DROP_PADDING = BAGEL_LIST_WIDTH / 2;
  const BIN_WIDTH = BAGEL_LIST_WIDTH / 2;

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

  const getBinPoint = useCallback(
    () => ({
      x: PADDING + BIN_WIDTH / 2,
      y: BAGEL_ELEMENT_HEIGHT * defaultBagel.length - (PADDING + BIN_WIDTH / 2),
    }),
    [BAGEL_ELEMENT_HEIGHT, BIN_WIDTH, PADDING, defaultBagel.length]
  );
  const [isOverBin, setIsOverBin] = useState(false);

  const [defaultIngredients, setDefaultIngredients] = useState<
    IngredientType[]
  >([
    ...new Array(4).fill(IngredientType.BAGEL),
    ...new Array(8).fill(IngredientType.LETTUCE),
  ]);
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

  const { data: sessionData } = useSession();
  const mutation = api.example.putBagel.useMutation();
  const [saved, setSaved] = useState(false);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    if (!sessionData?.user || !event.currentTarget) return;
    event.preventDefault();
    // save bagel to prisma db for user
    const ingredients = reorderBagel({
      bagel: defaultBagel,
      order: bagelOrder.current,
    });

    mutation.mutate({
      name: event.currentTarget.nameInput.value,
      ingredients,
      userId: sessionData.user.id,
    });
    setSaved(true);
  };

  return (
    <>
      <div
        key={`${width}x${height}-${defaultBagel.join("-")}`}
        className={styles.row}
        style={{
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
              if (
                itemX < minX ||
                itemX > maxX ||
                itemY < minY ||
                itemY > maxY
              ) {
                // console.info(`not in bounds: "x: ${{itemX}}, y: ${{itemY}}"`)
                return false;
              }

              const index = getBagelIndex(itemY);
              const bagelIndex = bagelOrder.current[index];
              const bagelItem =
                bagelIndex !== undefined && defaultBagel[bagelIndex];
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
                if (orderedIndex !== undefined) newBagel[orderedIndex] = item;
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
          saved={saved}
          getBinPoint={getBinPoint}
          setIsOverBin={setIsOverBin}
          targetSize={BIN_WIDTH}
          joiner={{
            conditionFn: ({ itemX, itemY }) => {
              const { x, y } = getBinPoint();
              const { minX, minY, maxX, maxY } = getBinLimits({
                binPoint: { x, y },
                targetSize: BIN_WIDTH,
              });

              if (itemX < minX || itemY < minY) {
                return false;
              }

              return true;
            },
            itemFn: ({ item, itemY, itemIndex }) => {
              // replace it with "empty" in the defaultBagel state
              setDefaultBagel((defaultBagelValue) => {
                const newBagel = [...defaultBagelValue];
                newBagel[itemIndex] = IngredientType.EMPTY;
                return newBagel;
              });
            },
          }}
        />
        <div
          style={{
            marginTop: "auto",
          }}
        >
          <Bin width={BIN_WIDTH} isOver={isOverBin} />
        </div>
      </div>
      <div
        className={styles.row}
        style={{
          height: "200px",
          alignItems: "center",
        }}
      >
        <Form save={handleSave} />
      </div>
    </>
  );
};
