import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

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
    <html
      lang="en"
      data-theme="dark"
      className={jetbrainsMono.variable}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
