import { isSvgComponent } from "../Bagel/types";
import type { BagelType } from "../BagelMaker/types";

const SCALE = 0.75;

export const SaveBagel = ({
  items: bagel,
  width,
  elementHeight,
}: {
  items: BagelType;
  width: number;
  elementHeight: number;
}) => {
  const height =
    bagel.filter((Ingredient) => isSvgComponent(Ingredient)).length *
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
      {bagel.map((Ingredient, index) => {
        if (isSvgComponent(Ingredient)) {
          return <Ingredient key={`saved-bagel-ingredient-${index}`} />;
        }
      })}
    </div>
  );
};
