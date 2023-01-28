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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {bagelWithNoEmptyIngredients.map((ingredient, index) => {
          if (ingredient !== IngredientType.EMPTY) {
            const Ingredient = bagelStringToComponentMap[ingredient];
            // const y = index === bagelWithNoEmptyIngredients.length -1 ? 0 : index * width / bagelWithNoEmptyIngredients.length
            const y = 0;
            // 0, 25,
            return (
              <div
                style={{ height: width / 2 }}
                key={`saved-bagel-ingredient-${index}`}
              >
                <Ingredient
                  style={{
                    height: width,
                    position: "relative",
                    bottom: `${y}px`,
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
