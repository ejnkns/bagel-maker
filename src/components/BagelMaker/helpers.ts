import { Bagel, IngredientType } from "@prisma/client";
import { BagelSvg } from "../IngredientSvgs/BagelSvg";
import { LettuceSvg } from "../IngredientSvgs/LettuceSvg";
import type { SvgProps } from "../IngredientSvgs/types";

type BagelComponentType = ("EMPTY" | (({ fill, ...props }: SvgProps) => JSX.Element))[]

export const bagelStringToComponentMap = {
    [IngredientType.BAGEL]: BagelSvg,
    [IngredientType.LETTUCE]: LettuceSvg,
    [IngredientType.EMPTY]: IngredientType.EMPTY,
}

export const bagelStringArrayToComponentArray = (
    dbBagelIngredients?: IngredientType[]
): BagelComponentType => {
    const bagel = dbBagelIngredients ? dbBagelIngredients.map((ingredient) => {
        return bagelStringToComponentMap[ingredient]
    }) : [
        BagelSvg,
        IngredientType.EMPTY,
        IngredientType.EMPTY,
        IngredientType.EMPTY,
        BagelSvg

    ];
    return bagel
}

export const reorderBagel = ({
    bagel,
    order,
}: {
    bagel: IngredientType[],
    order: number[]
}) => {
    // Create a new array with the items reordered according to order
    const newBagel = order.map((index) => bagel[index] ?? IngredientType.EMPTY);
    return newBagel;
}
