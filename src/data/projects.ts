import type { WindowConfig } from "@/state/windowManager";

// ─── Section windows (non-project) ────────────────────────────────────────────

export const SECTION_WINDOWS: Record<string, WindowConfig> = {
  about: {
    id: "about",
    title: "Read Me",
    type: "document",
    contentId: "about",
    x: 80,
    y: 60,
    width: 500,
    height: 380,
    resizable: true,
  },
  resume: {
    id: "resume",
    title: "Experience",
    type: "finder",
    contentId: "resume",
    x: 140,
    y: 90,
    width: 580,
    height: 400,
    minWidth: 400,
    minHeight: 280,
    resizable: true,
  },
  contact: {
    id: "contact",
    title: "New Message",
    type: "dialog",
    contentId: "contact",
    x: 0, // centered dynamically
    y: 0,
    width: 380,
    height: 360,
    resizable: false,
  },
};

// ─── Project metadata ─────────────────────────────────────────────────────────

export type ProjectType = "application" | "terminal" | "canvas" | "document";

export interface TerminalSessionEntry {
  type: "command" | "output" | "delay";
  text?: string;
  ms?: number;
}

export interface ProjectData {
  id: string;
  title: string;
  icon: string; // icon name → maps to <Icons.X>
  type: ProjectType;
  tagline: string;
  tags: string[];
  // Window config overrides
  window: Omit<WindowConfig, "id" | "title" | "type" | "contentId">;
  // Type-specific content
  url?: string; // application type
  terminalSession?: TerminalSessionEntry[]; // terminal type
  writeup?: string; // document type (Markdown-ish plain text rendered as JSX)
  repoUrl?: string;
}

export const PROJECTS: ProjectData[] = [
  {
    id: "proj-devboard",
    title: "DevBoard",
    icon: "globe",
    type: "application",
    tagline: "A real-time collaborative dev dashboard",
    tags: ["Next.js", "WebSockets", "PostgreSQL"],
    window: { x: 180, y: 100, width: 720, height: 480, minWidth: 400, minHeight: 300, resizable: true },
    url: "https://example.com", // ← replace with your live URL
    repoUrl: "https://github.com/yourusername/devboard",
  },
  {
    id: "proj-clicraft",
    title: "CLICraft",
    icon: "terminal",
    type: "terminal",
    tagline: "A scaffolding CLI for TypeScript projects",
    tags: ["Node.js", "TypeScript", "Commander.js"],
    window: { x: 160, y: 80, width: 560, height: 380, minWidth: 360, minHeight: 260, resizable: true },
    terminalSession: [
      { type: "command", text: "clicraft --help" },
      {
        type: "output",
        text: "CLICraft v2.1.0  —  TypeScript project scaffolding\n\nUsage:\n  clicraft new <name> [options]\n  clicraft add <feature>\n\nOptions:\n  --template  Starter template (api|web|lib)\n  --git       Initialise git repo\n  --install   Run npm install after scaffold\n  -h, --help  Show this help",
      },
      { type: "delay", ms: 600 },
      { type: "command", text: "clicraft new my-api --template api --git --install" },
      { type: "output", text: "✔  Copying template files..." },
      { type: "delay", ms: 400 },
      { type: "output", text: "✔  Initialising git repository..." },
      { type: "delay", ms: 300 },
      { type: "output", text: "✔  Installing dependencies...\n" },
      { type: "delay", ms: 600 },
      { type: "output", text: "  added 247 packages in 3.4s\n" },
      { type: "delay", ms: 200 },
      { type: "output", text: "✨  Done! Run: cd my-api && npm run dev" },
    ],
    repoUrl: "https://github.com/yourusername/clicraft",
  },
  {
    id: "proj-lifelab",
    title: "LifeLab",
    icon: "canvas",
    type: "canvas",
    tagline: "Conway's Game of Life — interactive cellular automaton",
    tags: ["Canvas API", "TypeScript", "Algorithmic art"],
    window: { x: 200, y: 70, width: 560, height: 460, minWidth: 320, minHeight: 280, resizable: true },
    repoUrl: "https://github.com/yourusername/lifelab",
  },
  {
    id: "proj-promptkit",
    title: "PromptKit",
    icon: "document",
    type: "document",
    tagline: "Open-source library of structured LLM prompts",
    tags: ["TypeScript", "LLM", "Open Source"],
    window: { x: 100, y: 80, width: 500, height: 420, minWidth: 320, minHeight: 240, resizable: true },
    writeup: `PromptKit is a typed, composable library of LLM prompt templates built for production use.

Rather than storing prompts as raw strings, PromptKit treats them as first-class typed objects with schemas, version history, and built-in evaluation tooling.

## The Problem

Prompt management in LLM applications is usually an afterthought — prompts live in .txt files, scattered env vars, or inline strings. This makes iteration slow, testing ad-hoc, and regressions invisible.

## The Solution

PromptKit provides:
- **Typed templates** — Prompts are functions with input/output schemas
- **Version control** — Semantic versioning for prompt iterations
- **Eval harness** — Run test suites against any prompt version
- **Observability** — Latency, token usage, and quality metrics per prompt

## Tech Stack

TypeScript · Zod · Vitest · OpenAI SDK

## Status

Active development — v1.2.0 shipped. Used in production at two companies.`,
    repoUrl: "https://github.com/yourusername/promptkit",
  },
  {
    id: "proj-pixelpress",
    title: "PixelPress",
    icon: "paintbrush",
    type: "document",
    tagline: "A minimal pixel-art editor that runs in the browser",
    tags: ["Canvas API", "React", "IndexedDB"],
    window: { x: 120, y: 90, width: 480, height: 400, minWidth: 320, minHeight: 240, resizable: true },
    writeup: `PixelPress is a lightweight, zero-dependency pixel art editor that runs entirely in the browser. No installs, no accounts — open a tab and draw.

## Features

- **32-colour palette** — curated retro palettes (PICO-8, CGA, GameBoy)
- **Tools** — Pencil, fill bucket, eraser, colour picker, line tool
- **Layers** — Up to 8 layers with opacity control
- **Export** — PNG, GIF (animated), and spritesheet
- **Offline** — Service worker caches the app; works fully offline
- **Persistence** — Auto-saves to IndexedDB; no account needed

## Architecture

Single-page app, no framework. The render pipeline is a custom retained-mode canvas renderer — each layer is a separate OffscreenCanvas composited to the main view on every frame.

## Interesting Problem

Getting crisp pixel-perfect rendering across device pixel ratios was tricky. The solution: render at the logical grid size and use \`imageSmoothingEnabled = false\` when compositing to the display canvas.`,
    repoUrl: "https://github.com/yourusername/pixelpress",
  },
];

// ─── Desktop icon layout ───────────────────────────────────────────────────────

/** All items that appear as icons on the desktop, in display order. */
export interface DesktopIconDef {
  id: string;
  label: string;
  icon: string;
  /** Opens this window config (for section icons) or a project window */
  windowId: string;
}

export const DESKTOP_ICONS: DesktopIconDef[] = [
  { id: "about",   label: "About Me",  icon: "person",    windowId: "about" },
  { id: "resume",  label: "Resume",    icon: "briefcase", windowId: "resume" },
  { id: "contact", label: "Contact",   icon: "envelope",  windowId: "contact" },
  // Projects
  ...PROJECTS.map((p) => ({
    id: p.id,
    label: p.title,
    icon: p.icon,
    windowId: p.id,
  })),
  { id: "trash", label: "Trash", icon: "trash", windowId: "" },
];

// ─── Resume data ───────────────────────────────────────────────────────────────

export const RESUME_DATA = {
  work: [
    {
      id: "w1",
      company: "Acme Corp",
      role: "Senior Software Engineer",
      period: "2022 – Present",
      location: "San Francisco, CA",
      description: "Full-stack development on the core platform.",
      bullets: [
        "Led migration from monolith to microservices — reduced p99 latency by 40%",
        "Built real-time collaboration features serving 50k daily active users",
        "Mentored three junior engineers; introduced ADR process for the team",
      ],
    },
    {
      id: "w2",
      company: "Startup XYZ",
      role: "Software Engineer",
      period: "2020 – 2022",
      location: "Remote",
      description: "Founding engineer on a developer tooling product.",
      bullets: [
        "Designed and shipped the VS Code extension (10k+ installs)",
        "Built CI/CD pipeline reducing deployment time from 45 min to 8 min",
        "Wrote the CLI tool now used by 200+ teams",
      ],
    },
    {
      id: "w3",
      company: "Agency ABC",
      role: "Junior Developer",
      period: "2018 – 2020",
      location: "New York, NY",
      description: "Client work across web and mobile.",
      bullets: [
        "Delivered 12 client projects on time and on budget",
        "Introduced TypeScript to the team — adopted across all new projects",
      ],
    },
  ],
  education: [
    {
      id: "e1",
      school: "State University",
      degree: "B.S. Computer Science",
      period: "2014 – 2018",
      notes: "Focus in systems programming and algorithms.",
    },
  ],
  skills: [
    {
      id: "s1",
      category: "Languages",
      items: ["TypeScript", "Python", "Rust", "SQL"],
    },
    {
      id: "s2",
      category: "Frontend",
      items: ["React", "Next.js", "CSS", "WebGL / Canvas API"],
    },
    {
      id: "s3",
      category: "Backend",
      items: ["Node.js", "PostgreSQL", "Redis", "GraphQL"],
    },
    {
      id: "s4",
      category: "Infrastructure",
      items: ["AWS", "Docker", "Terraform", "GitHub Actions"],
    },
  ],
};

// ─── About content ─────────────────────────────────────────────────────────────

export const ABOUT_CONTENT = `Hi, I'm AJ Khullar — a software engineer based in [Your City].

I build things for the web: fast APIs, thoughtful UIs, and the occasional
interactive demo that exists purely because it was fun to make.

Right now I'm focused on developer tooling and LLM-powered products. I care
about the craft — readable code, good abstractions, and systems that are a
pleasure to work with.

Previously at [Company], [Company], and [Company]. Currently open to senior
and staff-level roles.

Outside of work I like generative art, retro computing (hence this site), and
convincing people that terminal-first workflows are actually good.

─────────────────────────────────────

This site is a Macintosh System 7 desktop built with Next.js, Zustand, and
vanilla CSS. No UI libraries. Every window, drag behaviour, and pixel-art icon
is hand-crafted.

Source code is on GitHub if you want to poke around.`;
