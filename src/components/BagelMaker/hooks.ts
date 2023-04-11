// https://stackoverflow.com/a/36862446/14154407
import { useState, useEffect, useRef } from "react";

function getWindowDimensions(window: Window) {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height,
		loading: false,
	};
}

export function useWindowDimensions() {
	const [windowDimensions, setWindowDimensions] = useState<{
		width: number;
		height: number;
		loading: boolean;
	}>({ width: 0, height: 0, loading: true });

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions(window));
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowDimensions;
}

export const useSizes = () => {
	// widths and heights of the BagelList and IngredientsHOC components and elements
	const { width, height, loading } = useWindowDimensions();

	const isPortrait = height > width;
	const INGREDIENTS_CELL_SIZE = isPortrait
		? Math.round(width / 10)
		: Math.round(height / 10);
	const INGREDIENTS_COLS = 2;
	const INGREDIENTS_ROWS = 4;
	const BAGEL_LIST_WIDTH = INGREDIENTS_CELL_SIZE * 1.5;
	const BAGEL_ELEMENT_HEIGHT = BAGEL_LIST_WIDTH;
	const PADDING = isPortrait ? Math.round(width / 4) : Math.round(width / 8);
	const DROP_PADDING = BAGEL_LIST_WIDTH / 2;
	const BIN_WIDTH = BAGEL_LIST_WIDTH / 2;

	const defaultSizes = {
		height,
		width,
		isPortrait,
		INGREDIENTS_CELL_SIZE,
		INGREDIENTS_COLS,
		INGREDIENTS_ROWS,
		BAGEL_LIST_WIDTH,
		BAGEL_ELEMENT_HEIGHT,
		PADDING,
		DROP_PADDING,
		BIN_WIDTH,
		loading,
	} as const;

	return defaultSizes;
};

export const useFirstRender = () => {
	const firstRender = useRef(true);

	useEffect(() => {
		firstRender.current = false;
	}, []);

	return firstRender.current;
};
