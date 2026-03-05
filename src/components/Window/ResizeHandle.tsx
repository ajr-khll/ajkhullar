interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Bottom-right corner resize grip with classic System 7 diagonal-lines texture.
 * Styled entirely via system7.css (.resize-handle).
 */
export default function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      className="resize-handle"
      onMouseDown={onMouseDown}
      aria-label="Resize window"
      role="separator"
    />
  );
}
