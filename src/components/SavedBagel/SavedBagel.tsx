import type { Bagel } from "@prisma/client";
import { IngredientType } from "@prisma/client";
import { bagelStringToComponentMap } from "../BagelMaker/helpers";

const SCALE = 1;

export const SavedBagel = ({
  bagel,
  width: inputWidth,
}: {
  bagel: Bagel;
  width: number;
}) => {
  const { ingredients } = bagel;
  const width = inputWidth * SCALE;
  const bagelWithNoEmptyIngredients = ingredients.filter(
    (ingredient) => ingredient !== IngredientType.EMPTY
  );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ color: "white" }}>{bagel.name}</h3>
      <div
        style={{
          width,
          // Below assumes width is the same as height
          // and it adds ingredients.length to account for extra 1px between svgs
          height: ((ingredients.length + 1) * width) / 2 + ingredients.length,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {bagelWithNoEmptyIngredients.map((ingredient, index) => {
          if (ingredient !== IngredientType.EMPTY) {
            const Ingredient = bagelStringToComponentMap[ingredient];
            return (
              <div
                style={{ height: width / 2 }}
                key={`saved-bagel-ingredient-${index}`}
              >
                <Ingredient
                  style={{
                    height: width,
                    position: "relative",
                  }}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
