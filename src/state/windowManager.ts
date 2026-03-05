import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WindowType =
  | "document"
  | "finder"
  | "application"
  | "terminal"
  | "canvas"
  | "dialog";

/** Full configuration needed to open a window. */
export interface WindowConfig {
  id: string;
  title: string;
  type: WindowType;
  /** Maps to a section ("about", "resume", "contact") or a project id. */
  contentId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
}

/** Runtime state of a single open window. */
export interface WindowState extends WindowConfig {
  zIndex: number;
  isMinimized: boolean;
}

/** Temporary outline rendered while the user drags a window. */
export interface DragOutline {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Desktop-level settings that can be toggled from the View menu. */
export interface DesktopSettings {
  scanlines: boolean;
  gridSnap: boolean;
  sound: boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface WindowManagerStore {
  // Windows
  windows: WindowState[];
  topZIndex: number;

  // Drag overlay
  dragOutline: DragOutline | null;

  // Desktop settings
  settings: DesktopSettings;

  // --- Actions ---
  openWindow: (config: WindowConfig) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  toggleMinimize: (id: string) => void;
  isWindowOpen: (id: string) => boolean;
  setDragOutline: (outline: DragOutline | null) => void;
  toggleSetting: (key: keyof DesktopSettings) => void;
}

export const useWindowManager = create<WindowManagerStore>((set, get) => ({
  windows: [],
  topZIndex: 100,
  dragOutline: null,
  settings: { scanlines: false, gridSnap: false, sound: false },

  openWindow(config) {
    const { windows, topZIndex } = get();
    const existing = windows.find((w) => w.id === config.id);

    if (existing) {
      // Already open — just focus it and un-minimize if needed
      const newZ = topZIndex + 1;
      set((s) => ({
        topZIndex: newZ,
        windows: s.windows.map((w) =>
          w.id === config.id
            ? { ...w, zIndex: newZ, isMinimized: false }
            : w,
        ),
      }));
      return;
    }

    const newZ = topZIndex + 1;
    set((s) => ({
      topZIndex: newZ,
      windows: [
        ...s.windows,
        { ...config, zIndex: newZ, isMinimized: false },
      ],
    }));
  },

  closeWindow(id) {
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }));
  },

  focusWindow(id) {
    const { topZIndex, windows } = get();
    // Already on top — no-op to avoid unnecessary re-renders
    const win = windows.find((w) => w.id === id);
    if (!win || win.zIndex === topZIndex) return;

    const newZ = topZIndex + 1;
    set((s) => ({
      topZIndex: newZ,
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, zIndex: newZ } : w,
      ),
    }));
  },

  moveWindow(id, x, y) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    }));
  },

  resizeWindow(id, width, height) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w,
      ),
    }));
  },

  toggleMinimize(id) {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w,
      ),
    }));
  },

  isWindowOpen(id) {
    return get().windows.some((w) => w.id === id);
  },

  setDragOutline(outline) {
    set({ dragOutline: outline });
  },

  toggleSetting(key) {
    set((s) => ({
      settings: { ...s.settings, [key]: !s.settings[key] },
    }));
  },
}));
