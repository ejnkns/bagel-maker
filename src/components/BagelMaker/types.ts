import type { IngredientType } from "@prisma/client";

type JoinerFnProps = {
  item: IngredientType;
  itemIndex: number;
  // X and Y are relative to the top right of the component
  itemX?: number;
  itemY?: number;
};

export type Joiner = {
  // if conditionFn doesn't exist or returns false the item function won't run.
  conditionFn?: (props: JoinerFnProps) => boolean;
  itemFn: (props: JoinerFnProps) => void;
};
