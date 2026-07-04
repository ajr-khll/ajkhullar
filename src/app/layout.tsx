import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AJ Khullar",
  description:
    "USC Computer Science undergraduate specializing in C, C++, and systems optimization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
