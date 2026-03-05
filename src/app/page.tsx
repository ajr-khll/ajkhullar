"use client";

import { useEffect, useState } from "react";
import { useWindowManager } from "@/state/windowManager";
import { SECTION_WINDOWS } from "@/data/projects";
import BootSequence from "@/components/BootSequence/BootSequence";
import Desktop from "@/components/Desktop/Desktop";
import MenuBar from "@/components/MenuBar/MenuBar";

const BOOT_SESSION_KEY = "sys7-booted";

/**
 * Root page — orchestrates the boot sequence and desktop.
 *
 * Flow:
 *   1. On first visit this session: show BootSequence overlay
 *   2. After boot (or skip): mount the Desktop and pre-open About Me
 *   3. "Restart" from the Apple menu replays the boot animation
 */
export default function Home() {
  const openWindow = useWindowManager((s) => s.openWindow);

  // Show boot sequence unless this session has already seen it
  const [booting, setBooting] = useState(() => {
    if (typeof sessionStorage === "undefined") return true;
    return sessionStorage.getItem(BOOT_SESSION_KEY) !== "true";
  });

  // Show the desktop (with opacity animation) after boot completes
  const [desktopVisible, setDesktopVisible] = useState(!booting);

  function handleBootComplete() {
    sessionStorage.setItem(BOOT_SESSION_KEY, "true");
    setBooting(false);
    setDesktopVisible(true);
  }

  function handleRestart() {
    sessionStorage.removeItem(BOOT_SESSION_KEY);
    setDesktopVisible(false);
    // Small delay so the desktop fades out before the boot sequence shows
    setTimeout(() => setBooting(true), 200);
  }

  // Pre-open the About Me window once the desktop is visible
  useEffect(() => {
    if (desktopVisible) {
      openWindow(SECTION_WINDOWS.about);
    }
  }, [desktopVisible, openWindow]);

  return (
    <>
      {booting && <BootSequence onComplete={handleBootComplete} />}

      {/* Desktop fades in after boot */}
      <div
        style={{
          opacity: desktopVisible ? 1 : 0,
          transition: "opacity 300ms ease-in",
          pointerEvents: desktopVisible ? "auto" : "none",
        }}
      >
        <MenuBar onRestart={handleRestart} />
        <Desktop />
      </div>
    </>
  );
}
