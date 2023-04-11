import { animated, useSpring } from "@react-spring/web";
import { BinSvg } from "../IngredientSvgs/BinSvg";
import useSound from "use-sound";
import { useEffect } from "react";
import { useFirstRender } from "./hooks";

export const Bin = ({ width, isOver }: { isOver: boolean; width?: number }) => {
	const firstRender = useFirstRender();
	console.log({ firstRender, isOver });

	const [playOnIsOverBin] = useSound("/sounds/whoosh.mp3", {
		volume: 0.15,
	});

	useEffect(() => {
		if (!firstRender) playOnIsOverBin();
	}, [firstRender, isOver, playOnIsOverBin]);

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
