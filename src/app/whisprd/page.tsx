import type { Metadata } from "next";
import WhisprdApp from "./WhisprdApp";
import "./whisprd.css";

export const metadata: Metadata = {
  title: "whisprd — hold-to-talk dictation for Linux",
  description:
    "Hold a key, speak, release. The text is typed into whatever window has focus. A small dictation daemon for Wayland and X11.",
};

export default function WhisprdPage() {
  return <WhisprdApp />;
}
