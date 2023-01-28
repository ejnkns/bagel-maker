import type { IngredientType } from "@prisma/client";
import type { UseSpringsProps } from "@react-spring/web";
import type { Joiner } from "../BagelMaker/types";

export type IngredientsProps = {
  items: IngredientType[];
  rows: number;
  cols: number;
  springFn: (
    order: number[],
    active?: boolean,
    originalIndex?: number,
    curIndex?: number,
    x?: number,
    y?: number
  ) => (index: number) => UseSpringsProps;
  ingredientsOrder: React.MutableRefObject<number[]>;
  elementSize: number;
  joiner?: Joiner;
};
