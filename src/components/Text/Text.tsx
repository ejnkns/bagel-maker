import React, { useMemo } from "react";
import { backgroundUrls } from "./backgrounds";

type TextProps = {
  text?: string;
  color?: string;
  opacity?: number;
  imageSrc?: string;
  animate?: boolean;
};

const Text = ({
  text,
  color = "black",
  opacity = 100,
  imageSrc,
  animate,
}: TextProps) => {
  const style: React.CSSProperties = {
    fontSize: "24em",
    fontWeight: "bold",
    wordBreak: "break-word",
    // transform: 'scale(0.94)',
    // animation: 'scale 3s forwards cubic-bezier(0.5, 1, 0.89, 1)',
    // color,
    opacity,
    //  ...(imageSrc) && {
    backgroundImage: `url(${
      backgroundUrls[(backgroundUrls.length * Math.random()) | 0]
    })`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    color: "transparent",
  };
  // };

  const words = useMemo(() => text?.split(" "), [text]);

  return animate ? (
    <div style={style}>
      {words?.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={
            {
              // animationName: 'fade-in',
              // animationDuration: '0.1s',
              // animationTimingFunction: 'linear',
              // animationDelay: `${(i+1) * 0.1}s`,
              // animationIterationCount: 'infinite',
              // animationDirection: 'alternate',
              // animation: `fade-in 0.1s ${(i+1)*0.1}s forwards cubic-bezier(0.11, 0, 0.5, 0)`
            }
          }
        >
          {word}
        </span>
      ))}
    </div>
  ) : (
    <div style={style}>{text}</div>
  );
};

export default Text;
