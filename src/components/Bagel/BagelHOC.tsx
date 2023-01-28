import type { UseSpringsProps } from "@react-spring/web";
import { config } from "@react-spring/web";
import { useMemo } from "react";
import { getBinLimits } from "../BagelMaker/helpers";
import { type BagelListProps, BagelList } from "./Bagel";

export type BagelSpringFn = (props: {
  order: number[];
  state?: "edit" | "saved" | "deleted";
  active?: boolean;
  originalIndex?: number;
  curIndex?: number;
  x?: number;
  y?: number;
}) => (index: number) => UseSpringsProps;

export const BagelListHOC = (
  props: Omit<BagelListProps, "springFn"> & {
    getBinPoint: () => { x: number; y: number };
    targetSize: number;
  }
) => {
  const { elementHeight, getBinPoint, targetSize, joiner } = props;

  const { x: binX, y: binY } = getBinPoint();
  const { minX, minY, maxX, maxY } = useMemo(() => {
    return getBinLimits({ binPoint: { x: binX, y: binY }, targetSize });
  }, [getBinPoint, targetSize]);

  const springFn: BagelSpringFn = ({
    order,
    state = "edit",
    active = false,
    originalIndex = 0,
    curIndex = 0,
    x = 0,
    y = 0,
  }) => {
    return (index: number) => {
      const itemY = order.indexOf(index) * elementHeight;
      const centerPointY = ((order.length - 1) * elementHeight) / 2;
      const offsetY = curIndex * elementHeight + y;
      const ySaved = itemY + (centerPointY - itemY) / 2;

      const savedScale =
        order.indexOf(index) === 0 || order.indexOf(index) === order.length - 1
          ? 1
          : 0.7;

      const targetScale = targetSize / elementHeight;

      const isNearBin = x > minX && offsetY > minY;

      console.log("order length", order.length);
      console.log({ index, curIndex, originalIndex });
      return state === "saved"
        ? {
            y: ySaved,
            scale: savedScale,
            zIndex: 0,
            opacity: 1,
            fill: order.indexOf(index) % 2 === 0 ? "purple" : "blue",
            immediate: false,
          }
        : state === "deleted" && active && index === originalIndex
        ? {
            x: binX + targetSize,
            y: binY + targetSize,
            scale: 0,
            zIndex: 0,
            opacity: 0,
            immediate: false,
          }
        : active && index === originalIndex
        ? {
            x: x < 0 ? 0 : x > maxX ? maxX : x,
            y: offsetY > maxY ? maxY : offsetY,
            scale: isNearBin ? targetScale : 1.1,
            zIndex: isNearBin ? 0 : 1,
            fill: isNearBin ? "red" : "green",
            opacity: isNearBin ? 0.5 : 1,
            immediate: (key: string) => key === "zIndex",
            config: (key: string) =>
              key === "y" ? config.stiff : config.default,
          }
        : {
            x: 0,
            y: order.indexOf(index) * elementHeight,
            scale: 1,
            zIndex: 0,
            opacity: 1,
            fill: "white",
            immediate: false,
          };
    };
  };

  return <BagelList {...props} springFn={springFn} />;
};
