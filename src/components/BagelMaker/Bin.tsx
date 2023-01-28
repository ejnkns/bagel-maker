import { animated, useSpring } from "@react-spring/web";
import { BinSvg } from "../IngredientSvgs/BinSvg";

export const Bin = ({ width, isOver }: { isOver: boolean; width?: number }) => {
  const props = useSpring({
    from: { opacity: 0.1, transform: "rotate(0deg)" },
    to: {
      opacity: isOver ? 1 : 0.1,
      transform: isOver ? "rotate(-45deg)" : "rotate(0deg)",
    },
  });
  return (
    <animated.div style={props}>
      <BinSvg width={width} />;
    </animated.div>
  );
};
