"use client";

import { useState } from "react";
import { getIcon } from "@/components/icons/Icons";
import Tooltip from "@/components/common/Tooltip";

interface DesktopIconProps {
  id: string;
  label: string;
  iconName: string;
  onOpen: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * A single desktop icon.
 *
 * Interactions:
 *   - Single click: select (highlights label)
 *   - Double click: open the associated window
 *   - Keyboard Enter: open; Space: select
 *
 * Wraps in <Tooltip> for Balloon Help on hover (System 7.5 feature).
 */
export default function DesktopIcon({
  id,
  label,
  iconName,
  onOpen,
  isSelected,
  onSelect,
}: DesktopIconProps) {
  const IconComponent = getIcon(iconName);
  const [clickTimer, setClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();

    if (clickTimer) {
      // Second click within threshold → double click
      clearTimeout(clickTimer);
      setClickTimer(null);
      onOpen();
    } else {
      // First click — select, then wait for possible double-click
      onSelect();
      const t = setTimeout(() => {
        setClickTimer(null);
      }, 300);
      setClickTimer(t);
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }
    onOpen();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") onOpen();
    if (e.key === " ") onSelect();
  }

  return (
    <Tooltip text={`Open ${label}`}>
      <div
        className={`desktop-icon${isSelected ? " desktop-icon--selected" : ""}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${label} — double-click to open`}
        data-icon-id={id}
      >
        <div className="desktop-icon__img">
          <IconComponent size={32} />
        </div>
        <span className="desktop-icon__label">{label}</span>
      </div>
    </Tooltip>
  );
}
