import React from "react";
import styles from "./Button.module.css";

export const Button = ({
  children,
  onClick,
  className,
  disabled,
  submit,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  submit?: boolean;
}) => {
  return (
    <button
      type={submit ? "submit" : "button"}
      className={`${styles.button} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
