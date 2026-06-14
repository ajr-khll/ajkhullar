import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const garamond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "AJ Khullar",
  description: "USC Computer Science undergraduate specializing in C, C++, and systems optimization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={garamond.variable}>
      <body>{children}</body>
    </html>
  );
}
