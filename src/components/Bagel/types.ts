import type React from "react";
import type { SvgProps } from "../IngredientSvgs/types";

export function isEmpty(item: unknown): item is "empty" {
  return item === "empty";
}

export function isSvgComponent(
  item: "empty" | React.FC<SvgProps> | undefined
): item is React.FC<SvgProps> {
  return item !== "empty" && typeof item === "function";
}
