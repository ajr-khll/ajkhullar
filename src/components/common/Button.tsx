import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** True for the "default" button style (thick double border) */
  primary?: boolean;
}

/**
 * System 7 styled push button.
 * Use `primary` for the default/OK action — adds the thick double-border
 * that System 7 used to indicate the button that responds to Return.
 */
export default function Button({ primary, className = "", children, ...rest }: ButtonProps) {
  const classes = [
    "sys7-btn",
    primary ? "sys7-btn--default" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
