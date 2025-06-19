"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export const Button = ({ children, className, onClick, type, style }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={onClick}
      type={type}
      style={style}
    >
      {children}
    </button>
  );
};
