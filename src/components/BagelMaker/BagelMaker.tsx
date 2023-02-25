import type { FormEvent } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BagelListHOC } from "../Bagel";
import { IngredientsHOC } from "../Ingredients";
import { useSizes } from "./hooks";
import type { Bagel } from "@prisma/client";
import { IngredientType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "../../utils/api";
import { reorderBagel } from "./helpers";
import { Form } from "./SaveBagelForm";
import { Bin } from "./Bin";
import styles from "./BagelMaker.module.css";

type BagelMakerProps = {
  userBagel?: Bagel;
};

// component with state for, screen size, bagel and its ingredients to pass to IngredientsHOC, BagelListHOC, and SaveBagel
export const BagelMaker = ({ userBagel }: BagelMakerProps) => {
  const [defaultBagel, setDefaultBagel] = useState<IngredientType[]>(
    userBagel?.ingredients
      ? userBagel.ingredients
      : new Array(5).fill(IngredientType.EMPTY)
  );

  useEffect(() => {
    if (userBagel?.ingredients) setDefaultBagel(userBagel?.ingredients);
  }, [userBagel]);

  const bagelOrder = useRef(defaultBagel.map((_, index) => index)); // Store indices as a local ref, this represents the item order

  const {
    INGREDIENTS_CELL_SIZE,
    INGREDIENTS_COLS,
    INGREDIENTS_ROWS,
    BAGEL_LIST_WIDTH,
    BAGEL_ELEMENT_HEIGHT,
    PADDING,
    DROP_PADDING,
    BIN_WIDTH,
  } = useSizes();

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
      INGREDIENTS_COLS,
      PADDING,
      defaultBagel,
      elementSizeDiff,
    ]
  );

  const getBinPoint = useCallback(
    () => ({
      x: PADDING + BIN_WIDTH / 2,
      y: BAGEL_ELEMENT_HEIGHT * (defaultBagel.length - 1),
    }),
    [BAGEL_ELEMENT_HEIGHT, BIN_WIDTH, PADDING, defaultBagel.length]
  );
  const [isOverBin, setIsOverBin] = useState(false);

  const [defaultIngredients, setDefaultIngredients] = useState<
    IngredientType[]
  >([
    ...new Array(2).fill(IngredientType.BAGEL),
    ...new Array(4).fill(IngredientType.LETTUCE),
    ...new Array(2).fill(IngredientType.EMPTY),
  ]);
  const ingredientsOrder = useRef(defaultIngredients.map((_, index) => index)); // Store indices as a local ref, this represents the item order

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
    const ingredients = reorderBagel({
      bagel: defaultBagel,
      order: bagelOrder.current,
    });

    // save bagel to prisma db for user
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
        key={`${INGREDIENTS_CELL_SIZE}-${defaultBagel.join("-")}`}
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
          orderRef={ingredientsOrder}
          elementSize={INGREDIENTS_CELL_SIZE}
          targetSize={BAGEL_ELEMENT_HEIGHT}
          getEmptyBagelPoints={getEmptyBagelPoints}
          joiner={{
            conditionFn: ({ itemX, itemY }) => {
              if (!itemX || !itemY) return false;
              if (
                itemX < minX ||
                itemX > maxX ||
                itemY < minY ||
                itemY > maxY
              ) {
                return false;
              }

              const bagelIndex = bagelOrder.current[getBagelIndex(itemY)];
              const bagelItem =
                bagelIndex !== undefined && defaultBagel[bagelIndex];

              if (bagelItem !== IngredientType.EMPTY) {
                return false;
              }

              return true;
            },
            itemFn: ({ item, itemY, itemIndex }) => {
              if (
                itemY === undefined ||
                item === undefined ||
                itemIndex === undefined
              )
                return;
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
          order={bagelOrder}
          saved={saved}
          getBinPoint={getBinPoint}
          isOverBin={isOverBin}
          setIsOverBin={setIsOverBin}
          targetSize={BIN_WIDTH}
          joiner={{
            itemFn: ({ itemIndex }) => {
              if (itemIndex === undefined) return;
              // replace it with empty in the defaultBagel state
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
