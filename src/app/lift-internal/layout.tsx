import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://lift.ajkhullar.com"),
  title: "Lift",
  description: "Lift is coming soon, to an app store near you.",
  applicationName: "Lift",
  appleWebApp: {
    capable: true,
    title: "Lift",
    statusBarStyle: "black",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Lift",
    description: "Coming soon, to an app store near you.",
    url: "/",
    siteName: "Lift",
    type: "website",
  },
  robots: {
    follow: false,
    index: false,
  },
};

export default function LiftLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
