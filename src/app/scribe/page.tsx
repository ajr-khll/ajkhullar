import type { Metadata } from "next";
import ScribeApp from "./ScribeApp";
import "./scribe.css";
import "./scribe-tw.css";

export const metadata: Metadata = {
  title: "scribe — hold-to-talk dictation for Linux",
  description:
    "Hold a key, speak, release. The text is typed into whatever window has focus. A small dictation daemon for Wayland and X11.",
};

export default function ScribePage() {
  return <ScribeApp />;
}
