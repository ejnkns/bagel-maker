import type { IngredientType } from "@prisma/client";
import type { UseSpringsProps } from "@react-spring/web";

export type JoinerFnProps = {
  item: IngredientType;
  itemIndex: number;
  // X and Y are relative to the top right of the ingredient grid
  itemX: number;
  itemY: number;
};

type Joiner = {
  // if conditionFn exists, item function will only be run if conditionFn returns true.
  conditionFn?: (props: JoinerFnProps) => boolean;
  itemFn: (props: JoinerFnProps) => void;
};

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
