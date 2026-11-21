"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/components/reactbits/useReducedMotion";
import { Figure } from "./Embeds";
import { useSiteTheme } from "./theme";

type Width = "column" | "wide" | "full";

/** Looping, silent video — the right way to ship a "GIF" that's more than a
    few hundred KB. Plays only while on screen; respects reduced motion. */
export function Video({
  src,
  poster,
  caption,
  width,
  ratio = "16 / 9",
  controls = false,
}: {
  src: string;
  poster?: string;
  caption?: ReactNode;
  width?: Width;
  ratio?: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v || controls) return;
    if (reduced) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, controls]);

  return (
    <Figure caption={caption} width={width}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop={!controls}
        playsInline
        controls={controls || reduced}
        preload="metadata"
        style={{ aspectRatio: ratio }}
      />
    </Figure>
  );
}

/** A live, code-drawn animation. Anything can go in a post this way — this one
    is a field of dots riding a travelling wave, pulled toward the cursor. */
export function WaveField({ caption, width }: { caption?: ReactNode; width?: Width }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const theme = useSiteTheme(); // redraw a static frame in the new colour

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let visible = true;
    const mouse = { x: -1e4, y: -1e4 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(canvas).color; // var(--accent), follows theme
      const gap = 14;
      const time = t / 1000;
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          const wave =
            Math.sin(x * 0.018 + time * 1.4) * Math.cos(y * 0.022 - time * 0.9);
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const pull = Math.exp(-(dx * dx + dy * dy) / 6000);
          const r = 0.6 + (wave + 1) * 1.6 + pull * 3;
          ctx.globalAlpha = 0.25 + (wave + 1) * 0.3 + pull * 0.3;
          ctx.beginPath();
          ctx.arc(x - dx * pull * 0.15, y - dy * pull * 0.15, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, theme]);

  return (
    <Figure caption={caption} width={width}>
      <div className="b-canvas">
        <canvas ref={canvasRef} aria-label="Animated field of dots" role="img" />
      </div>
    </Figure>
  );
}
