import { IngredientType } from "@prisma/client";
import { bagelStringToComponentMap } from "../BagelMaker/helpers";

const SCALE = 0.75;

export const SaveBagel = ({
  items: bagel,
  width,
  elementHeight,
}: {
  items: IngredientType[];
  width: number;
  elementHeight: number;
}) => {
  const height =
    bagel.filter((ingredient) => (ingredient !== IngredientType.EMPTY)).length *
    elementHeight *
    SCALE;
  return (
    <div
      style={{
        height,
        width: width * SCALE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {bagel.map((ingredient, index) => {
        if (ingredient !== IngredientType.EMPTY) {
          const Ingredient = bagelStringToComponentMap[ingredient];
          return <Ingredient key={`saved-bagel-ingredient-${index}`} />;
        }
      })}
    </div>
  );
};
