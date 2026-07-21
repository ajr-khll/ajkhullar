"use client";

// Based on React Bits (https://reactbits.dev) — FadeContent.
// Fades (and optionally un-blurs) its children in. This is a mount-triggered
// fade rather than the upstream gsap-ScrollTrigger version: scroll triggers
// proved fragile here (a layout shift after mount could leave content stuck
// hidden), so the reveal now runs unconditionally right after mount and can
// never get stuck. prefers-reduced-motion shows the content with no animation.
import * as React from "react";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface FadeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  initialOpacity?: number;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  blur = false,
  duration = 800,
  ease = "power2.out",
  delay = 0,
  initialOpacity = 0,
  className = "",
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const secs = (v: number) => (v > 10 ? v / 1000 : v);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { autoAlpha: 1, filter: "blur(0px)" });
      return;
    }

    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(8px)" : "blur(0px)",
    });
    const tween = gsap.to(el, {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: secs(duration),
      ease,
      delay: secs(delay) + 0.05,
    });

    return () => {
      tween.kill();
      gsap.killTweensOf(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className} style={{ visibility: "hidden", ...style }} {...props}>
      {children}
    </div>
  );
};

export default FadeContent;
