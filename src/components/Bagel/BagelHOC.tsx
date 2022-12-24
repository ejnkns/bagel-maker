import { config } from "@react-spring/web";
import { type BagelListProps, BagelList } from "./Bagel";

export const BagelListHOC = (props: Omit<BagelListProps, "springFn">) => {
  const { elementHeight } = props;
  const springFn =
    (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) =>
    (index: number) =>
      active && index === originalIndex
        ? {
            y: curIndex * elementHeight + y,
            scale: 1.1,
            zIndex: 1,
            fill: "red",
            immediate: (key: string) => key === "zIndex",
            config: (key: string) =>
              key === "y" ? config.stiff : config.default,
          }
        : {
            y: order.indexOf(index) * elementHeight,
            scale: 1,
            zIndex: 0,
            fill: "white",
            immediate: false,
          };

  return <BagelList {...props} springFn={springFn} />;
};
