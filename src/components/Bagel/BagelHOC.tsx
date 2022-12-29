import { config } from "@react-spring/web";
import { type BagelListProps, BagelList } from "./Bagel";

export const BagelListHOC = (props: Omit<BagelListProps, "springFn">) => {
  const { elementHeight } = props;
  const springFn = ({
    order,
    saved = false,
    active = false,
    originalIndex = 0,
    curIndex = 0,
    y = 0,
  }: {
    order: number[];
    saved?: boolean;
    active?: boolean;
    originalIndex?: number;
    curIndex?: number;
    y?: number;
  }) => {
    return (index: number) => {
      const itemY = order.indexOf(index) * elementHeight;
      const centerPointY = ((order.length - 1) * elementHeight) / 2;
      const ySaved = itemY + (centerPointY - itemY) / 2;
      return saved
        ? {
            y: ySaved,
            scale: 1,
            zIndex: 0,
            opacity: 1,
            fill: order.indexOf(index) % 2 === 0 ? "purple" : "blue",
            immediate: false,
          }
        : active && index === originalIndex
        ? {
            y: curIndex * elementHeight + y,
            scale: 1.1,
            zIndex: 1,
            fill: "green",
            opacity: 1,
            immediate: (key: string) => key === "zIndex",
            config: (key: string) =>
              key === "y" ? config.stiff : config.default,
          }
        : {
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
