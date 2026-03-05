/**
 * The classic System 7 desktop pattern: a 50% gray dither achieved by
 * alternating black and white pixels in a 2×2 checkerboard. Rendered as a
 * full-bleed background layer behind all windows and icons.
 *
 * Pure CSS — no canvas needed.
 */
export default function DesktopPattern() {
  return (
    <div
      className="desktop-pattern"
      aria-hidden="true"
    />
  );
}
