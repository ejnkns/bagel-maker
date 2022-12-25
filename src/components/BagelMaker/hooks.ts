// https://stackoverflow.com/a/36862446/14154407
import { useState, useEffect } from "react";

function getWindowDimensions(window: Window & typeof globalThis) {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
    loading: false,
  };
}

export default function useWindowDimensions() {
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
