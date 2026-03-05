"use client";

import { useRef, useEffect } from "react";

export interface MenuItem {
  type: "item" | "separator";
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface MenuDropdownProps {
  items: MenuItem[];
  onClose: () => void;
}

/**
 * System 7 menu dropdown — a floating list of items that appears below the
 * active menu bar item. Closes when the user clicks outside or presses Escape.
 */
export default function MenuDropdown({ items, onClose }: MenuDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="menu-dropdown"
      ref={ref}
      role="menu"
      aria-label="Menu options"
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return <div key={i} className="menu-dropdown__separator" role="separator" />;
        }

        return (
          <div
            key={i}
            className={`menu-dropdown__item${item.disabled ? " menu-dropdown__item--disabled" : ""}`}
            role="menuitem"
            tabIndex={item.disabled ? -1 : 0}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            aria-disabled={item.disabled}
          >
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span style={{ color: "#888", fontSize: "var(--font-size-small)" }}>
                {item.shortcut}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
