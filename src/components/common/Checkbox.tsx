"use client";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

/**
 * System 7 styled checkbox.
 * Renders a plain square box with a hand-drawn checkmark when checked.
 */
export default function Checkbox({ label, checked, onChange, id }: CheckboxProps) {
  const boxId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="sys7-checkbox-wrapper" htmlFor={boxId}>
      <div
        className="sys7-checkbox-box"
        role="checkbox"
        aria-checked={checked}
        id={boxId}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onChange(!checked)}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: "block" }}>
            <polyline
              points="1,5 4,8 9,2"
              fill="none"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        )}
      </div>
      <span>{label}</span>
    </label>
  );
}
