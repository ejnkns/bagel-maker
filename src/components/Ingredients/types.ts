import type { IngredientType } from "@prisma/client";
import type { UseSpringsProps } from "@react-spring/web";
import type { Joiner } from "../BagelMaker/types";

export type IngredientsProps = {
  items: IngredientType[];
  rows: number;
  cols: number;
  orderRef: React.MutableRefObject<number[]>;
  elementSize: number;
  joiner?: Joiner;
  springFn: IngredientsSpringFn;
};

export type IngredientsSpringFn = (props: {
  order: number[];
  state?: "default" | "deleted" | "render";
  active?: boolean;
  originalIndex?: number;
  x?: number;
  y?: number;
  callback?: () => void;
  deletedOriginalIndex?: number;
}) => (index: number) => UseSpringsProps;
