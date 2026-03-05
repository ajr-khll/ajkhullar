/**
 * Pixel-art icon set — all icons are 32×32 SVGs designed to mimic the
 * hand-drawn System 7 icon aesthetic. Each uses a limited palette (black,
 * white, and at most two grays) and deliberate pixel-level precision.
 */

interface IconProps {
  size?: number;
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const Svg = ({
  size = 32,
  className,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: "pixelated", display: "block" }}
  >
    {children}
  </svg>
);

// ── Icons ─────────────────────────────────────────────────────────────────────

export function PersonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Head */}
      <rect x="11" y="3" width="10" height="10" fill="#000" />
      <rect x="12" y="4" width="8" height="8" fill="#fff" />
      {/* Neck */}
      <rect x="14" y="13" width="4" height="3" fill="#000" />
      {/* Body */}
      <rect x="7" y="16" width="18" height="11" fill="#000" />
      <rect x="8" y="17" width="16" height="9" fill="#fff" />
      {/* Collar detail */}
      <rect x="13" y="17" width="6" height="2" fill="#000" />
      {/* Arms */}
      <rect x="4" y="16" width="3" height="9" fill="#000" />
      <rect x="25" y="16" width="3" height="9" fill="#000" />
    </Svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Handle */}
      <rect x="11" y="6" width="10" height="5" fill="#000" />
      <rect x="12" y="7" width="8" height="4" fill="#fff" />
      <rect x="13" y="7" width="6" height="2" fill="#fff" />
      {/* Case body */}
      <rect x="4" y="11" width="24" height="17" fill="#000" />
      <rect x="5" y="12" width="22" height="15" fill="#fff" />
      {/* Latch */}
      <rect x="13" y="18" width="6" height="4" fill="#000" />
      <rect x="14" y="19" width="4" height="2" fill="#fff" />
      {/* Seam */}
      <rect x="5" y="19" width="22" height="1" fill="#000" />
      {/* Corners */}
      <rect x="5" y="12" width="2" height="2" fill="#aaa" />
      <rect x="25" y="12" width="2" height="2" fill="#aaa" />
    </Svg>
  );
}

export function EnvelopeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Envelope body */}
      <rect x="3" y="8" width="26" height="18" fill="#000" />
      <rect x="4" y="9" width="24" height="16" fill="#fff" />
      {/* Flap (V shape) */}
      <rect x="4"  y="9"  width="1"  height="1"  fill="#000" />
      <rect x="5"  y="10" width="1"  height="1"  fill="#000" />
      <rect x="6"  y="11" width="1"  height="1"  fill="#000" />
      <rect x="7"  y="12" width="1"  height="1"  fill="#000" />
      <rect x="8"  y="13" width="1"  height="1"  fill="#000" />
      <rect x="9"  y="14" width="1"  height="1"  fill="#000" />
      <rect x="10" y="15" width="1"  height="1"  fill="#000" />
      <rect x="11" y="16" width="1"  height="1"  fill="#000" />
      <rect x="12" y="17" width="1"  height="1"  fill="#000" />
      <rect x="13" y="18" width="1"  height="1"  fill="#000" />
      <rect x="14" y="19" width="1"  height="1"  fill="#000" />
      <rect x="15" y="20" width="2"  height="1"  fill="#000" />
      <rect x="17" y="19" width="1"  height="1"  fill="#000" />
      <rect x="18" y="18" width="1"  height="1"  fill="#000" />
      <rect x="19" y="17" width="1"  height="1"  fill="#000" />
      <rect x="20" y="16" width="1"  height="1"  fill="#000" />
      <rect x="21" y="15" width="1"  height="1"  fill="#000" />
      <rect x="22" y="14" width="1"  height="1"  fill="#000" />
      <rect x="23" y="13" width="1"  height="1"  fill="#000" />
      <rect x="24" y="12" width="1"  height="1"  fill="#000" />
      <rect x="25" y="11" width="1"  height="1"  fill="#000" />
      <rect x="26" y="10" width="1"  height="1"  fill="#000" />
      <rect x="27" y="9"  width="1"  height="1"  fill="#000" />
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Circle outline */}
      <rect x="10" y="3"  width="12" height="2" fill="#000" />
      <rect x="6"  y="5"  width="4"  height="2" fill="#000" />
      <rect x="22" y="5"  width="4"  height="2" fill="#000" />
      <rect x="4"  y="7"  width="2"  height="4" fill="#000" />
      <rect x="26" y="7"  width="2"  height="4" fill="#000" />
      <rect x="3"  y="11" width="2"  height="10" fill="#000" />
      <rect x="27" y="11" width="2"  height="10" fill="#000" />
      <rect x="4"  y="21" width="2"  height="4" fill="#000" />
      <rect x="26" y="21" width="2"  height="4" fill="#000" />
      <rect x="6"  y="25" width="4"  height="2" fill="#000" />
      <rect x="22" y="25" width="4"  height="2" fill="#000" />
      <rect x="10" y="27" width="12" height="2" fill="#000" />
      {/* Meridian lines */}
      <rect x="15" y="4"  width="2"  height="24" fill="#000" />
      <rect x="5"  y="15" width="22" height="2"  fill="#000" />
      {/* Longitude arcs (approximated) */}
      <rect x="10" y="4"  width="2"  height="24" fill="#000" />
      <rect x="20" y="4"  width="2"  height="24" fill="#000" />
      {/* Fill white */}
      <rect x="5"  y="5"  width="22" height="22" fill="#fff" />
      {/* Re-draw grid on white */}
      <rect x="15" y="5"  width="1"  height="22" fill="#000" />
      <rect x="10" y="5"  width="1"  height="22" fill="#000" />
      <rect x="21" y="5"  width="1"  height="22" fill="#000" />
      <rect x="5"  y="15" width="22" height="1"  fill="#000" />
      <rect x="5"  y="10" width="22" height="1"  fill="#000" />
      <rect x="5"  y="21" width="22" height="1"  fill="#000" />
    </Svg>
  );
}

export function TerminalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Monitor bezel */}
      <rect x="2"  y="4"  width="28" height="20" fill="#000" />
      <rect x="3"  y="5"  width="26" height="18" fill="#fff" />
      {/* Screen (dark) */}
      <rect x="4"  y="6"  width="24" height="16" fill="#000" />
      {/* Prompt */}
      <rect x="6"  y="10" width="4"  height="2"  fill="#0f0" />
      <rect x="11" y="10" width="10" height="2"  fill="#0f0" />
      <rect x="6"  y="14" width="14" height="2"  fill="#0f0" />
      <rect x="6"  y="18" width="4"  height="2"  fill="#0f0" />
      <rect x="11" y="18" width="2"  height="2"  fill="#0f0" />
      {/* Stand */}
      <rect x="12" y="24" width="8"  height="2"  fill="#000" />
      <rect x="9"  y="26" width="14" height="3"  fill="#000" />
    </Svg>
  );
}

export function CanvasIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Palette shape */}
      <rect x="4"  y="8"  width="24" height="18" fill="#000" />
      <rect x="5"  y="9"  width="22" height="16" fill="#fff" />
      {/* Thumb hole */}
      <rect x="14" y="5"  width="6"  height="6"  fill="#000" />
      <rect x="15" y="6"  width="4"  height="4"  fill="#888" />
      {/* Color swatches */}
      <rect x="7"  y="11" width="4"  height="4"  fill="#000" />
      <rect x="13" y="11" width="4"  height="4"  fill="#555" />
      <rect x="19" y="11" width="4"  height="4"  fill="#aaa" />
      <rect x="7"  y="18" width="4"  height="4"  fill="#777" />
      <rect x="13" y="18" width="4"  height="4"  fill="#ccc" />
      {/* Brush handle */}
      <rect x="24" y="6"  width="4"  height="14" fill="#000" />
      <rect x="25" y="7"  width="2"  height="10" fill="#fff" />
      <rect x="24" y="20" width="4"  height="4"  fill="#555" />
    </Svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Page body */}
      <rect x="5"  y="2"  width="18" height="26" fill="#000" />
      <rect x="6"  y="3"  width="16" height="24" fill="#fff" />
      {/* Dog-ear */}
      <rect x="17" y="2"  width="6"  height="6"  fill="#000" />
      <rect x="17" y="3"  width="5"  height="5"  fill="#888" />
      <rect x="17" y="8"  width="6"  height="1"  fill="#000" />
      {/* Text lines */}
      <rect x="8"  y="10" width="12" height="1"  fill="#000" />
      <rect x="8"  y="13" width="12" height="1"  fill="#000" />
      <rect x="8"  y="16" width="10" height="1"  fill="#000" />
      <rect x="8"  y="19" width="12" height="1"  fill="#000" />
      <rect x="8"  y="22" width="7"  height="1"  fill="#000" />
    </Svg>
  );
}

export function PaintbrushIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Brush handle — diagonal */}
      <rect x="20" y="2"  width="4"  height="12" fill="#000" rx="1" />
      <rect x="21" y="3"  width="2"  height="10" fill="#aaa" />
      {/* Ferrule */}
      <rect x="19" y="13" width="6"  height="3"  fill="#000" />
      <rect x="20" y="14" width="4"  height="2"  fill="#888" />
      {/* Bristles */}
      <rect x="19" y="16" width="6"  height="8"  fill="#000" />
      <rect x="20" y="17" width="1"  height="6"  fill="#555" />
      <rect x="22" y="17" width="1"  height="7"  fill="#555" />
      <rect x="24" y="17" width="1"  height="5"  fill="#555" />
      {/* Paint blob */}
      <rect x="4"  y="18" width="12" height="10" fill="#000" />
      <rect x="5"  y="19" width="10" height="8"  fill="#fff" />
      <rect x="7"  y="21" width="6"  height="4"  fill="#aaa" />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Lid */}
      <rect x="7"  y="5"  width="18" height="3"  fill="#000" />
      <rect x="8"  y="6"  width="16" height="2"  fill="#fff" />
      {/* Handle on lid */}
      <rect x="13" y="3"  width="6"  height="3"  fill="#000" />
      <rect x="14" y="4"  width="4"  height="2"  fill="#fff" />
      {/* Body */}
      <rect x="6"  y="8"  width="20" height="20" fill="#000" />
      <rect x="7"  y="9"  width="18" height="18" fill="#fff" />
      {/* Vertical lines on body */}
      <rect x="10" y="10" width="2"  height="15" fill="#000" />
      <rect x="15" y="10" width="2"  height="15" fill="#000" />
      <rect x="20" y="10" width="2"  height="15" fill="#000" />
    </Svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Apple silhouette (simplified) */}
      <rect x="12" y="3"  width="4"  height="4"  fill="#000" />
      <rect x="10" y="7"  width="12" height="2"  fill="#000" />
      <rect x="7"  y="9"  width="18" height="2"  fill="#000" />
      <rect x="5"  y="11" width="22" height="2"  fill="#000" />
      <rect x="4"  y="13" width="24" height="8"  fill="#000" />
      <rect x="5"  y="21" width="22" height="4"  fill="#000" />
      <rect x="7"  y="25" width="18" height="2"  fill="#000" />
      <rect x="10" y="27" width="12" height="2"  fill="#000" />
      {/* Highlight */}
      <rect x="8"  y="12" width="5"  height="8"  fill="#888" />
    </Svg>
  );
}

export function HappyMacIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Mac body */}
      <rect x="6"  y="2"  width="20" height="24" fill="#000" rx="2" />
      <rect x="7"  y="3"  width="18" height="22" fill="#fff" />
      {/* Screen */}
      <rect x="8"  y="4"  width="16" height="12" fill="#000" />
      <rect x="9"  y="5"  width="14" height="10" fill="#fff" />
      {/* Happy face on screen */}
      <rect x="11" y="8"  width="2"  height="2"  fill="#000" />
      <rect x="19" y="8"  width="2"  height="2"  fill="#000" />
      {/* Smile */}
      <rect x="11" y="12" width="10" height="1"  fill="#000" />
      <rect x="10" y="11" width="2"  height="2"  fill="#000" />
      <rect x="20" y="11" width="2"  height="2"  fill="#000" />
      {/* Disk slot */}
      <rect x="10" y="19" width="12" height="3"  fill="#000" />
      <rect x="11" y="20" width="10" height="1"  fill="#888" />
      {/* Bottom vents */}
      <rect x="9"  y="23" width="14" height="1"  fill="#aaa" />
    </Svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Chain link 1 */}
      <rect x="4"  y="10" width="14" height="6"  fill="#000" />
      <rect x="5"  y="11" width="12" height="4"  fill="#fff" />
      <rect x="8"  y="11" width="6"  height="4"  fill="#000" />
      <rect x="9"  y="12" width="4"  height="2"  fill="#fff" />
      {/* Chain link 2 */}
      <rect x="14" y="16" width="14" height="6"  fill="#000" />
      <rect x="15" y="17" width="12" height="4"  fill="#fff" />
      <rect x="18" y="17" width="6"  height="4"  fill="#000" />
      <rect x="19" y="18" width="4"  height="2"  fill="#fff" />
    </Svg>
  );
}

// ── Lookup helper ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  person: PersonIcon,
  briefcase: BriefcaseIcon,
  envelope: EnvelopeIcon,
  globe: GlobeIcon,
  terminal: TerminalIcon,
  canvas: CanvasIcon,
  document: DocumentIcon,
  paintbrush: PaintbrushIcon,
  trash: TrashIcon,
  apple: AppleIcon,
  "happy-mac": HappyMacIcon,
  link: LinkIcon,
};

export function getIcon(name: string): React.ComponentType<IconProps> {
  return ICON_MAP[name] ?? DocumentIcon;
}
