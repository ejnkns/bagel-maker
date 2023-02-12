import type { UseSpringsProps } from "@react-spring/web";
import { config } from "@react-spring/web";
import type { Dispatch, SetStateAction } from "react";
import { useMemo } from "react";
import { getBinLimits } from "../BagelMaker/helpers";
import { type BagelListProps, BagelList } from "./Bagel";

export type BagelSpringFn = (props: {
  order: number[];
  state?: "default" | "saved" | "deleted" | "render";
  active?: boolean;
  originalIndex?: number;
  curIndex?: number;
  deletedOriginalIndex?: number;
  x?: number;
  y?: number;
  callback?: () => void;
}) => (index: number) => UseSpringsProps;

export const BagelListHOC = (
  props: Omit<BagelListProps, "springFn"> & {
    getBinPoint: () => { x: number; y: number };
    targetSize: number;
    setIsOverBin: Dispatch<SetStateAction<boolean>>;
    isOverBin: boolean;
  }
) => {
  const { elementHeight, getBinPoint, targetSize, setIsOverBin, isOverBin } =
    props;

  const { x: binX, y: binY } = getBinPoint();
  const { minX, minY, maxX, maxY } = useMemo(() => {
    return getBinLimits({ binPoint: { x: binX, y: binY }, targetSize });
  }, [binX, binY, targetSize]);

  const springFn: BagelSpringFn = ({
    order,
    state = "default",
    active = false,
    // the index in the original order of the item being dragged
    originalIndex,
    // the current index of the item being dragged
    curIndex,
    deletedOriginalIndex,
    x = 0,
    y = 0,
    callback,
  }) => {
    const centerPointY = ((order.length - 1) * elementHeight) / 2;
    const savedScale =
      curIndex === 0 || curIndex === order.length - 1 ? 1 : 0.7;

    // the original index of the item being animated
    return (index: number) => {
      const itemY = order.indexOf(index) * elementHeight;

      if (state === "saved") {
        return {
          y: itemY + (centerPointY - itemY) / 2,
          scale: savedScale,
          zIndex: 0,
          opacity: 1,
          fill: order.indexOf(index) % 2 === 0 ? "purple" : "blue",
          immediate: false,
        };
      }

      const binTarget = { x: binX + targetSize, y: binY + targetSize };
      if (state === "deleted" && index === deletedOriginalIndex) {
        return {
          x: binTarget.x,
          y: binTarget.y,
          scale: 0,
          zIndex: 0,
          opacity: 0,
          immediate: false,
          onRest: callback,
          // this is slightly more performant than using onChange
          onProps: () => {
            setIsOverBin(false);
          },
        };
      }

      const targetScale = targetSize / elementHeight;
      const offsetY = curIndex ? curIndex * elementHeight + y : y;
      const isNearBin = x > minX && offsetY > minY;

      return active && index === originalIndex
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
            onChange: () => setIsOverBin(isNearBin),
          }
        : {
            x: 0,
            y: itemY,
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
