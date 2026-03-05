import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AJ Khullar — Portfolio",
  description:
    "Software engineer portfolio — a faithful recreation of the Macintosh System 7 desktop experience.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
