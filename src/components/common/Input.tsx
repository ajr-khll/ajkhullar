import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/**
 * System 7 styled text input with optional label.
 * The inset bevel border is handled by .sys7-input in system7.css.
 */
export default function Input({ label, id, className = "", ...rest }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: "var(--font-size-ui)", fontWeight: "bold" }}
        >
          {label}
        </label>
      )}
      <input id={id} className={`sys7-input ${className}`} {...rest} />
    </div>
  );
}
